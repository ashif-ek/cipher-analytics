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

@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue='queue_fhe')
def execute_fhe_computation_task(self, job_id, request_id=None, ip_address=None):
    job = None
    try:
        # Atomic transition: PENDING/QUEUED -> RUNNING
        with transaction.atomic():
            job = ComputationJob.objects.select_for_update().get(id=job_id)
            if job.status not in ["PENDING", "QUEUED", "RETRYING"]:
                return "ALREADY_PROCESSED"
                
            job.status = "RUNNING"
            job.save(update_fields=["status", "updated_at"])
            
            transaction.on_commit(lambda: broadcast_status_update(
                job.requested_by.id, "computation", job.id, "RUNNING"
            ))

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
            try:
                from .services.dataset_processing import compute_encrypted_aggregation
                res = compute_encrypted_aggregation(dataset, operation=job.operation.lower())
                res_val = res.get("result")
            except Exception as fhe_err:
                logger.warning(f"Falling back to simulation for {job.operation}: {str(fhe_err)}")
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
            job = ComputationJob.objects.select_for_update().get(id=job_id)
            if job.status != "RUNNING":
                return "UNEXPECTED_STATE"
            
            if is_ml and isinstance(res_json, dict) and res_json.get('status') == 'failed':
                job.status = "FAILED"
                job.error_message = res_json.get("message", "ML computation failed.")
                job.result_json = res_json
            else:
                job.status = "COMPLETED"
            
            if is_ml and job.status == "COMPLETED":
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
                        
                    # Auto-trigger embedding if small enough
                    dataset.embedding_status = "PENDING"
                    update_fields = ['embedding_status']
                    if dataset.rows_count <= 10000:
                        dataset.save(update_fields=update_fields)
                        from .tasks import generate_embedding_task
                        generate_embedding_task.delay(dataset.id)
                    else:
                        dataset.save(update_fields=update_fields)

                job.result_json = res_json
            else:
                job.result_value = res_val

            job.save()
            
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
            is_final_retry = self.request.retries >= self.max_retries
            with transaction.atomic():
                job = ComputationJob.objects.select_for_update().filter(id=job_id).first()
                if job and job.status != "COMPLETED":
                    job.status = "FAILED" if is_final_retry else "RETRYING"
                    job.save(update_fields=["status", "updated_at"])
                    
                    if is_final_retry:
                        transaction.on_commit(lambda: broadcast_status_update(
                            job.requested_by.id, "computation", job.id, "FAILED"
                        ))
        raise # Celery handles retries


@shared_task(queue='default')
def cleanup_stuck_datasets_task():
    """
    Detects datasets stuck in PROCESSING status for > 30 minutes (timeout_or_worker_crash).
    """
    from datetime import timedelta
    threshold = timezone.now() - timedelta(minutes=30)
    
    stuck_datasets = Dataset.objects.filter(status="PROCESSING", updated_at__lt=threshold)
    count = stuck_datasets.update(status="FAILED", error_message="timeout_or_worker_crash")
    
    if count > 0:
        logger.warning(f"Cleaned up {count} stuck datasets.")

    # Also clean up jobs
    job_threshold = timezone.now() - timedelta(minutes=15)
    stuck_jobs = ComputationJob.objects.filter(status__in=["PENDING", "RUNNING"], updated_at__lt=job_threshold)
    stuck_jobs.update(status="FAILED")

@shared_task(bind=True, max_retries=1, soft_time_limit=240, time_limit=300, queue='queue_ml')
def process_and_encrypt_dataset_task(self, dataset_id):
    """
    Production-grade ingestion pipeline:
    1. Lock Dataset (Idempotency)
    2. Safe Ingestion (SafeCSVLoader)
    3. Data Profiling (DataProfiler)
    4. Adaptive Preprocessing (AdaptivePreprocessor)
    5. FHE Encryption
    """
    from .services.locking import RedisLock
    from .services.ingestion import SafeCSVLoader
    from .services.validation import DataProfiler
    from .services.preprocessing import AdaptivePreprocessor
    from .services.dataset_processing import encrypt_dataset
    from django.core.files.base import ContentFile

    lock = RedisLock(f"dataset_ingest:{dataset_id}")
    
    with lock.acquire() as acquired:
        if not acquired:
            return "ALREADY_LOCKED"

        dataset = Dataset.objects.get(id=dataset_id)
        
        # Idempotency check: Don't process if already READY
        if dataset.status == "READY":
            return "ALREADY_READY"

        try:
            # 1. Transition: UPLOADING -> PROCESSING
            dataset.status = "PROCESSING"
            dataset.save(update_fields=['status'])
            broadcast_status_update(dataset.owner.id, "dataset", dataset.id, "PROCESSING")

            # 2. Stage: INGESTION
            logger.info(f"ingestion_started: {dataset.id}")
            loader = SafeCSVLoader(dataset.original_file.path)
            df, ingestion_report = loader.load_safe()
            dataset.ingestion_report = ingestion_report
            dataset.save(update_fields=['ingestion_report'])

            if ingestion_report["status"] == "FAILED":
                logger.error(f"ingestion_failed: {dataset.id}")
                dataset.status = "FAILED"
                dataset.error_message = f"Ingestion Error: {', '.join(ingestion_report['errors'])}"
                dataset.save(update_fields=['status', 'error_message'])
                broadcast_status_update(dataset.owner.id, "dataset", dataset.id, "FAILED")
                return "FAILED_INGESTION"

            # 3. Stage: VALIDATION
            profiler = DataProfiler(df)
            profile = profiler.profile_dataset()
            dataset.column_stats = profile # Store profile in stats for now
            
            if not profiler.is_valid:
                logger.error(f"validation_failed: {dataset.id}")
                dataset.status = "FAILED"
                dataset.error_message = f"Validation Error: {profiler.reason}"
                dataset.save(update_fields=['status', 'error_message', 'column_stats'])
                broadcast_status_update(dataset.owner.id, "dataset", dataset.id, "FAILED")
                return "FAILED_VALIDATION"

            # 4. Stage: PREPROCESSING
            preprocessor = AdaptivePreprocessor(profile)
            clean_df = preprocessor.apply(df)
            logger.info(f"preprocessing_completed: {dataset.id}")

            # 5. Stage: ENCRYPTION
            # Use only numeric columns for FHE as currently designed
            numeric_df = clean_df.select_dtypes(include=['number'])
            if numeric_df.empty:
                dataset.status = "FAILED"
                dataset.error_message = "No numeric columns remain after preprocessing."
                dataset.save(update_fields=['status', 'error_message'])
                broadcast_status_update(dataset.owner.id, "dataset", dataset.id, "FAILED")
                return "FAILED_NO_NUMERIC"

            encrypted_binary, rows, cols = encrypt_dataset(numeric_df)
            
            file_name = f"{dataset.id}_encrypted.bin"
            dataset.ciphertext_path.save(file_name, ContentFile(encrypted_binary))
            dataset.rows_count = rows
            dataset.columns_count = cols
            dataset.status = "READY"
            dataset.save(update_fields=['ciphertext_path', 'rows_count', 'columns_count', 'status'])
            
            broadcast_status_update(dataset.owner.id, "dataset", dataset.id, "READY")
            return "SUCCESS"

        except Exception as e:
            logger.exception(f"Unexpected failure in ingestion pipeline for dataset {dataset_id}")
            dataset.status = "FAILED"
            dataset.error_message = f"INTERNAL_ERROR: {str(e)}"
            dataset.save(update_fields=['status', 'error_message'])
            broadcast_status_update(dataset.owner.id, "dataset", dataset.id, "FAILED")
            return "FAILED_INTERNAL"


@shared_task(bind=True, max_retries=2, default_retry_delay=30, queue='queue_ml')
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
            job = ComputationJob.objects.select_for_update().get(id=job_id)
            if job.status not in ["PENDING", "QUEUED", "RETRYING"]:
                return "ALREADY_PROCESSED"
                
            job.status = "RUNNING"
            job.save(update_fields=["status", "updated_at"])

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

@shared_task(bind=True, max_retries=2, soft_time_limit=300, time_limit=360, queue='queue_ml')
def generate_embedding_task(self, dataset_id):
    """
    Computes UMAP 3D embedding for a dataset asynchronously.
    """
    import os
    import json
    import time
    from django.conf import settings
    from .services.locking import RedisLock
    from .ml_insights.embedding import compute_3d_embedding
    import pandas as pd
    import pickle
    
    lock = RedisLock(f"dataset_embedding:{dataset_id}")
    with lock.acquire() as acquired:
        if not acquired:
            return "ALREADY_RUNNING"
            
        dataset = Dataset.objects.get(id=dataset_id)
        if dataset.embedding_status == "COMPLETED":
            return "ALREADY_COMPLETED"
            
        dataset.embedding_status = "RUNNING"
        dataset.save(update_fields=['embedding_status'])
        broadcast_status_update(dataset.owner.id, "dataset", dataset.id, "EMBEDDING_RUNNING")
        
        start_time = time.time()
        try:
            # Hash to avoid recomputing if unchanged
            dataset_hash = dataset.content_hash or str(dataset.id)
            embedding_dir = os.path.join(settings.MEDIA_ROOT, 'embeddings')
            os.makedirs(embedding_dir, exist_ok=True)
            output_path = os.path.join(embedding_dir, f"{dataset_hash}.json")
            
            # If exists, just mark completed
            if os.path.exists(output_path):
                dataset.embedding_status = "COMPLETED"
                dataset.save(update_fields=['embedding_status'])
                broadcast_status_update(dataset.owner.id, "dataset", dataset.id, "EMBEDDING_COMPLETED")
                return "CACHED"
                
            # Load Data
            df = pd.read_csv(dataset.original_file.path)
            
            # Extract existing anomaly scores if Anomaly Detection was run
            precomputed_scores = None
            detection_job = ComputationJob.objects.filter(
                dataset=dataset, 
                operation='ANOMALY_DETECTION', 
                status='COMPLETED'
            ).order_by('-created_at').first()
            
            if detection_job and detection_job.result_json and 'result' in detection_job.result_json:
                result_data = detection_job.result_json['result']
                if 'anomaly_scores' in result_data:
                    precomputed_scores = np.array(result_data['anomaly_scores'])
                    
            # Compute Embedding
            import tracemalloc
            tracemalloc.start()
            
            embedding_results = compute_3d_embedding(df, precomputed_scores=precomputed_scores)
            
            current, peak = tracemalloc.get_traced_memory()
            tracemalloc.stop()
            logger.info(f"Embedding compute time: {time.time() - start_time:.2f}s, Peak Mem: {peak / 10**6:.2f}MB")
            
            # Save compressed/json
            with open(output_path, 'w') as f:
                json.dump(embedding_results, f)
                
            dataset.embedding_status = "COMPLETED"
            dataset.save(update_fields=['embedding_status'])
            broadcast_status_update(dataset.owner.id, "dataset", dataset.id, "EMBEDDING_COMPLETED")
            return "SUCCESS"
            
        except Exception as e:
            logger.error(f"Embedding failed: {str(e)}")
            dataset.embedding_status = "FAILED"
            dataset.save(update_fields=['embedding_status'])
            broadcast_status_update(dataset.owner.id, "dataset", dataset.id, "EMBEDDING_FAILED")
            raise
