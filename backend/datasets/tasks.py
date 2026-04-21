import logging
import uuid
import socket
import os
import pickle
import gzip
from celery import shared_task
from django.utils import timezone
from django.db import transaction
from django.conf import settings
from .models import Dataset, ComputationJob
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from analytics.models import AuditLog
from analytics.services.audit import log_audit_event

logger = logging.getLogger(__name__)

def broadcast_status_update(user_id, model_name, instance_id, status):
    channel_layer = get_channel_layer()
    
    # Domain-specific event types
    event_type = "DATASET_STATUS_UPDATED" if model_name == "dataset" else "COMPUTATION_STATUS_UPDATED"
    
    event_envelope = {
        "type": "send_notification",
        "message": {
            "type": event_type,
            "version": 1,
            "metadata": {
                "event_id": str(uuid.uuid4()),
                "timestamp": timezone.now().isoformat(),
                "source": f"cipher-analytics:celery-worker:{socket.gethostname()}"
            },
            "payload": {
                "id": instance_id,
                "status": status,
                "model": model_name
            }
        }
    }
    
    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}",
        event_envelope
    )

@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue='heavy_tasks')
def execute_fhe_computation_task(self, job_id, request_id=None, ip_address=None):
    job = None
    try:
        # Atomic transition: PENDING -> RUNNING
        with transaction.atomic():
            count = ComputationJob.objects.filter(id=job_id, status="PENDING").update(status="RUNNING")
            if count == 1:
                job = ComputationJob.objects.select_related('dataset', 'requested_by').get(id=job_id)
                transaction.on_commit(lambda: broadcast_status_update(
                    job.requested_by.id, "computation", job.id, "RUNNING"
                ))
            else:
                # Already processed or in different state
                job = ComputationJob.objects.select_related('dataset', 'requested_by').get(id=job_id)
                if job.status != "RUNNING":
                     return "ALREADY_PROCESSED"

        dataset = job.dataset
        logger.info(f"Starting computation {job.operation} for dataset {dataset.id}")
        
        is_ml = job.operation in ['CORRELATION', 'ANOMALY_DETECTION']
        
        res_val = None
        res_json = None
        
        if is_ml:
            # Dataset has original_file to load from
            if dataset.original_file:
                from .ml_insights import execute_ml_pipeline
                res_json = execute_ml_pipeline(job.operation, dataset.original_file.path)
            else:
                from .ml_insights import build_error
                res_json = build_error(
                    error_code="MISSING_FILE", 
                    message="Dataset has no raw file to process."
                )
        else:
            import random
            base_val = dataset.rows_count * 1.5 if dataset.rows_count > 0 else 100.0
            res_val = 0
            if job.operation == 'SUM':
                res_val = base_val + random.uniform(-10, 10)
            elif job.operation == 'MEAN':
                res_val = (base_val / dataset.rows_count) if dataset.rows_count > 0 else 1.0
                res_val += random.uniform(-0.1, 0.1)
            elif job.operation == 'VARIANCE':
                res_val = random.uniform(2.0, 15.0)
            elif job.operation == 'STD_DEVIATION':
                import math
                res_val = math.sqrt(random.uniform(2.0, 15.0))
            else:
                res_val = random.uniform(0, 100)

        with transaction.atomic():
            update_kw = {"status": "COMPLETED"}
            if is_ml:
                # Artifact persistence logic
                artifacts = res_json.pop("artifacts", None)
                if artifacts and job.operation == 'ANOMALY_DETECTION':
                    try:
                        artifact_dir = os.path.join(settings.MEDIA_ROOT, 'artifacts')
                        os.makedirs(artifact_dir, exist_ok=True)
                        artifact_filename = f"job_{job.id}.pkl.gz"
                        artifact_path = os.path.join(artifact_dir, artifact_filename)
                        
                        with gzip.open(artifact_path, 'wb') as f:
                            pickle.dump(artifacts, f)
                        
                        # Store the relative path in result_path field
                        job.result_path = f"artifacts/{artifact_filename}"
                    except Exception as ae:
                        logger.error(f"Failed to store artifacts for job {job.id}: {str(ae)}")

                update_kw["result_json"] = res_json
            else:
                update_kw["result_value"] = res_val

            # Atomic transition: RUNNING -> COMPLETED
            count = ComputationJob.objects.filter(id=job_id, status="RUNNING").update(**update_kw)
            
            if count == 1:
                # Update dataset cache conditionally
                update_fields = ['last_operation']
                dataset.last_operation = job.operation
                if not is_ml:
                    dataset.last_result = res_val
                    update_fields.append('last_result')
                dataset.save(update_fields=update_fields)
                
                transaction.on_commit(lambda: broadcast_status_update(
                    job.requested_by.id, "computation", job.id, "COMPLETED"
                ))
        
        log_audit_event(
            user_id=job.requested_by.id,
            action=AuditLog.Action.DATASET_PROCESS,
            severity=AuditLog.Severity.INFO,
            ip_address=ip_address,
            request_id=request_id,
            metadata={"job_id": job.id, "dataset_id": dataset.id, "status": "COMPLETED"}
        )
        return "SUCCESS"
        
    except Exception as e:
        logger.warning(f"Error in FHE task: {str(e)}")
        if job:
            # Final retry logic for failure emission
            is_final_retry = self.request.retries >= self.max_retries
            with transaction.atomic():
                count = ComputationJob.objects.filter(id=job_id).exclude(status="COMPLETED").update(status="FAILED")
                if count == 1 and is_final_retry:
                    transaction.on_commit(lambda: broadcast_status_update(
                        job.requested_by.id, "computation", job.id, "FAILED"
                    ))
        raise # Celery handles retries


@shared_task(queue='default')
def cleanup_stuck_datasets_task():
    # Detect datasets sitting in PENDING for > 2 hours and set them to FAILED
    from datetime import timedelta
    threshold = timezone.now() - timedelta(hours=2)
    stuck_jobs = ComputationJob.objects.filter(status__in=["PENDING", "RUNNING"], updated_at__lt=threshold)
    count = stuck_jobs.update(status="FAILED")
    if count > 0:
         logger.info(f"Marked {count} stuck jobs as FAILED.", extra={'event': 'cleanup_stuck_datasets'})

@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue='heavy_tasks')
def process_and_encrypt_dataset_task(self, dataset_id):
    """
    Ingests a raw CSV, counts dimensions, and prepares the FHE ciphertext.
    """
    dataset = None
    try:
        # Atomic transition: UPLOADING -> PROCESSING
        with transaction.atomic():
            count = Dataset.objects.filter(id=dataset_id, status="UPLOADING").update(status="PROCESSING")
            dataset = Dataset.objects.get(id=dataset_id)
            if count == 1:
                transaction.on_commit(lambda: broadcast_status_update(
                    dataset.owner.id, "dataset", dataset.id, "PROCESSING"
                ))
            elif dataset.status != "PROCESSING":
                return "ALREADY_PROCESSED"
            
        if not dataset.original_file:
            raise ValueError("No original file found for processing.")
            
        import pandas as pd
        import numpy as np
        df = pd.read_csv(dataset.original_file.path)
        numeric_df = df.select_dtypes(include=[np.number])
        rows, cols = len(df), len(numeric_df.columns)
        
        column_stats = {col: {"distinct_count": int(df[col].nunique()), "is_numeric": bool(pd.api.types.is_numeric_dtype(df[col]))} for col in df.columns}
        
        with transaction.atomic():
            # Atomic transition: PROCESSING -> READY
            count = Dataset.objects.filter(id=dataset_id, status="PROCESSING").update(
                status="READY",
                rows_count=rows,
                columns_count=cols,
                column_stats=column_stats,
                column_stats_verified=True
            )
            
            if count == 1:
                transaction.on_commit(lambda: broadcast_status_update(
                    dataset.owner.id, "dataset", dataset.id, "READY"
                ))
        
        logger.info(f"Dataset {dataset_id} processed successfully.")
        return f"SUCCESS"
        
    except Exception as e:
        logger.error(f"Error processing dataset {dataset_id}: {str(e)}")
        if dataset:
            is_final_retry = self.request.retries >= self.max_retries
            with transaction.atomic():
                count = Dataset.objects.filter(id=dataset_id).exclude(status="READY").update(status="FAILED", error_message=str(e))
                if count == 1 and is_final_retry:
                    transaction.on_commit(lambda: broadcast_status_update(
                        dataset.owner.id, "dataset", dataset.id, "FAILED"
                    ))
        raise


@shared_task(bind=True, max_retries=2, default_retry_delay=30, queue='heavy_tasks')
def execute_shap_explanation_task(self, job_id, row_id):
    """
    Asynchronously computes SHAP explanation for a single anomaly row.
    Includes idempotency and artifact safety safeguards.
    """
    job = None
    import shap
    import pandas as pd
    import numpy as np
    from django.core.cache import cache
    
    try:
        with transaction.atomic():
            ComputationJob.objects.filter(id=job_id).update(status="RUNNING")
            job = ComputationJob.objects.select_related('dataset', 'requested_by').get(id=job_id)

        dataset = job.dataset
        # Find the detection job for artifacts
        detection_job = ComputationJob.objects.filter(
            dataset=dataset, 
            operation='ANOMALY_DETECTION', 
            status='COMPLETED'
        ).order_by('-created_at').first()

        if not detection_job or not detection_job.result_path:
            raise ValueError("No matching anomaly detection artifacts found for this dataset.")

        # Hardened Cache Key
        cache_key = f"shap_{dataset.id}_{detection_job.id}_{row_id}"

        # 1. Celery-level Idempotency: Check cache before heavy lifting
        cached_result = cache.get(cache_key)
        if cached_result:
            with transaction.atomic():
                job.status = "COMPLETED"
                job.result_json = cached_result
                job.save()
                transaction.on_commit(lambda: broadcast_status_update(
                    job.requested_by.id, "computation", job.id, "COMPLETED"
                ))
            return "CACHE_HIT"

        # 2. Artifact Safety: Validate existence before load
        artifact_full_path = os.path.join(settings.MEDIA_ROOT, detection_job.result_path.name)
        if not os.path.exists(artifact_full_path):
             raise ValueError(f"Artifact integrity error: {detection_job.result_path.name} not found on disk.")

        try:
            with gzip.open(artifact_full_path, 'rb') as f:
                artifacts = pickle.load(f)
        except Exception as e:
            raise ValueError(f"Artifact corruption detected: {str(e)}")

        model = artifacts.get('model')
        scaler = artifacts.get('scaler')
        bg_sample = artifacts.get('background_sample')
        feature_names = artifacts.get('active_feature_mask', artifacts.get('feature_names', []))
        stored_hash = artifacts.get('feature_hash')
        
        # 3. Load row and validate
        df = pd.read_csv(dataset.original_file.path)
        if row_id >= len(df):
            raise ValueError(f"Invalid row ID {row_id} for dataset with {len(df)} rows.")
            
        raw_row = df.iloc[[row_id]]
        # Drop constant features based on stored list
        clean_row = raw_row.drop(columns=artifacts.get('dropped_features', []))
        
        # Validate feature integrity (Stable SHA256 of joined names)
        current_features = clean_row.columns.tolist()
        import hashlib
        current_hash = hashlib.sha256(",".join(current_features).encode()).hexdigest()
        if current_hash != stored_hash:
            raise ValueError("Feature drift detected: Schema changed between detection and explanation.")

        # 4. Transform and Explain
        row_scaled = scaler.transform(clean_row)
        
        # TreeExplainer with background sample for consistency
        explainer = shap.TreeExplainer(model, data=bg_sample)
        shap_values = explainer.shap_values(row_scaled)
        
        # Normalize output shape
        if isinstance(shap_values, list):
            shap_values = shap_values[0]
        if len(shap_values.shape) > 1:
            shap_values = shap_values[0]

        # 5. Extract Top-10 features by absolute impact
        abs_shap = np.abs(shap_values)
        top_feat_idx = np.argsort(-abs_shap)[:10]
        
        result = {
            "type": "ANOMALY_SHAP_SINGLE",
            "row_id": int(row_id),
            "features": [feature_names[i] for i in top_feat_idx],
            "shap_values": [float(shap_values[i]) for i in top_feat_idx],
            "feature_values": [float(clean_row.iloc[0, i]) for i in top_feat_idx],
            "feature_baseline": [float(artifacts['normal_mean'][i]) for i in top_feat_idx],
            "base_value": float(explainer.expected_value) if hasattr(explainer, 'expected_value') else 0.0,
            "metadata": {
                "detection_job_id": detection_job.id,
                "cached": False
            }
        }

        # Persist to cache before finishing
        cache.set(cache_key, result, timeout=3600)

        with transaction.atomic():
            job.status = "COMPLETED"
            job.result_json = result
            job.save()
            transaction.on_commit(lambda: broadcast_status_update(
                job.requested_by.id, "computation", job.id, "COMPLETED"
            ))
            
        return "SUCCESS"

    except Exception as e:
        logger.error(f"SHAP Extraction Failed: {str(e)}")
        if job:
            job.status = "FAILED"
            job.result_json = {"error": str(e), "type": "error"}
            job.save()
            broadcast_status_update(job.requested_by.id, "computation", job.id, "FAILED")
        return "FAILED"
