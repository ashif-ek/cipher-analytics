import tenseal as ts


def create_context():

    context = ts.context(
        ts.SCHEME_TYPE.CKKS,
        poly_modulus_degree=8192,
        coeff_mod_bit_sizes=[60, 40, 40, 60],
    )

    context.generate_galois_keys()

    context.global_scale = 2**40

    return context


def encrypt_vector(context, vector):

    encrypted = ts.ckks_vector(context, vector)

    return encrypted