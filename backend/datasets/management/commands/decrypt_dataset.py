from django.core.management.base import BaseCommand
from datasets.models import Dataset
import pickle
import tenseal as ts


class Command(BaseCommand):
    help = "Decrypt and inspect encrypted dataset"

    def handle(self, *args, **kwargs):

        dataset = Dataset.objects.get(id=5)

        file_path = dataset.encrypted_file.path

        # Load encrypted vectors
        with open(file_path, "rb") as f:
            encrypted_vectors = pickle.load(f)

        # Load saved TenSEAL context
        with open("media/keys/context.seal", "rb") as f:
            context = ts.context_from(f.read())

        # Decrypt vectors
        for vec_bytes in encrypted_vectors:
            vec = ts.ckks_vector_from(context, vec_bytes)
            print(vec.decrypt())