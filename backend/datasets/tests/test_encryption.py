import tenseal as ts

def test_ckks_encryption():

    context = ts.context(
        ts.SCHEME_TYPE.CKKS,
        poly_modulus_degree=8192,
        coeff_mod_bit_sizes=[60,40,40,60]
    )

    context.global_scale = 2**40
    context.generate_galois_keys()

    vector = [10.0, 20.0, 30.0]

    encrypted = ts.ckks_vector(context, vector)
    decrypted = encrypted.decrypt()

    assert abs(vector[0] - decrypted[0]) < 0.01