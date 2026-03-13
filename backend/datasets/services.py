import pandas as pd
import pickle

from .encryption import create_context, encrypt_vector


def process_and_encrypt_dataset(dataset):

    file_path = dataset.original_file.path

    df = pd.read_csv(file_path)

    dataset.rows = df.shape[0]
    dataset.columns = df.shape[1]
    dataset.status = "processing"
    dataset.save()

    context = create_context()

    encrypted_rows = []

    for row in df.values.tolist():

        encrypted = encrypt_vector(context, row)

        encrypted_rows.append(encrypted.serialize())

    encrypted_file_path = file_path.replace("raw", "encrypted") + ".pkl"

    with open(encrypted_file_path, "wb") as f:
        pickle.dump(encrypted_rows, f)

    dataset.encrypted_file = encrypted_file_path.split("media/")[1]

    dataset.status = "encrypted"

    dataset.save()