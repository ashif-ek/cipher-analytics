import logging
from celery import shared_task
from .models import Dataset
from .services.dataset_processing import process_and_encrypt_dataset

logger = logging.getLogger(__name__)

@shared_task
def process_and_encrypt_dataset_task(dataset_id):
    try:
        dataset_obj = Dataset.objects.get(id=dataset_id)
        process_and_encrypt_dataset(dataset_obj)
        logger.info(f"Successfully processed and encrypted dataset {dataset_id}")
    except Dataset.DoesNotExist:
        logger.error(f"Dataset {dataset_id} does not exist.")
    except Exception as e:
        logger.error(f"Error processing dataset {dataset_id}: {str(e)}")
        # The service process_and_encrypt_dataset already sets status to FAILED
