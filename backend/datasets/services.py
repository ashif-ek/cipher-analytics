import pandas as pd
import pickle
from pathlib import Path
import numpy as np

from .encryption import create_context, encrypt_vector


def process_and_encrypt_dataset(dataset):
    file_path = Path(dataset.original_file.path)

    # Ensure directories exist
    raw_dir = file_path.parent
    encrypted_dir = raw_dir.parent / "encrypted"
    encrypted_dir.mkdir(parents=True, exist_ok=True)

    keys_dir = Path("media/keys")
    keys_dir.mkdir(parents=True, exist_ok=True)

    context_path = keys_dir / "context.seal"

    # Read CSV
    df = pd.read_csv(file_path)

    # Keep only numeric columns
    df = df.select_dtypes(include=[np.number])

    # Handle missing values
    df = df.fillna(0)

    # Validate dataset
    if df.empty or df.shape[1] == 0:
        raise ValueError(
            "The dataset contains no numeric data to encrypt. "
            "Please ensure your CSV has numeric columns."
        )

    dataset.rows = df.shape[0]
    dataset.columns = df.shape[1]
    dataset.status = "processing"
    dataset.save()

    # Create encryption context
    context = create_context()

    # Save context only once (so same key is reused)
    if not context_path.exists():
        with open(context_path, "wb") as f:
            f.write(context.serialize(save_secret_key=True))

    encrypted_rows = []

    # Encrypt each row
    for row in df.values.tolist():
        encrypted = encrypt_vector(context, row)
        encrypted_rows.append(encrypted.serialize())

    # Create encrypted file
    encrypted_file_name = f"{file_path.name}.pkl"
    encrypted_file_full_path = encrypted_dir / encrypted_file_name

    with open(encrypted_file_full_path, "wb") as f:
        pickle.dump(encrypted_rows, f)

    # Store relative path for Django FileField
    dataset.encrypted_file = f"datasets/encrypted/{encrypted_file_name}"
    dataset.status = "encrypted"
    dataset.save()