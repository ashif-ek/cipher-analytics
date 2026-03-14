from django.core.management.base import BaseCommand
import tenseal as ts

class Command(BaseCommand):
    help = "Test CKKS encryption and decryption"

    def handle(self, *args, **kwargs):

        context = ts.context(
            ts.SCHEME_TYPE.CKKS,
            poly_modulus_degree=8192,
            coeff_mod_bit_sizes=[60, 40, 40, 60]
        )

        context.global_scale = 2**40
        context.generate_galois_keys()

        vector = [10.2, 5.1, 7.8]

        encrypted = ts.ckks_vector(context, vector)
        decrypted = encrypted.decrypt()

        print("Original:", vector)
        print("Decrypted:", decrypted)