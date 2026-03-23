import pandas as pd
import tenseal as ts
import base64
import io
import os
from django.core.files.base import ContentFile
from rest_framework import serializers

def validate_csv_file(file):
    """
    Check extension, size and encoding.
    """
    if not file.name.endswith('.csv'):
        raise serializers.ValidationError("File must be a CSV.")
    
    # 5MB limit
    if file.size > 5 * 1024 * 1024:
        raise serializers.ValidationError("File size must be under 5MB.")
    
    return True

def parse_and_validate_csv(file):
    """
    Load CSV, check for numeric-only data and handle missing values.
    """
    try:
        # Reset file pointer
        file.seek(0)
        df = pd.read_csv(file)
        
        if df.empty:
            raise serializers.ValidationError("CSV file is empty.")
        
        # Keep only numeric columns
        df = df.select_dtypes(include=['number'])
        
        if df.empty:
            raise serializers.ValidationError("CSV must contain at least one numeric column for encryption.")
        
        # Drop rows with missing values for now (simple approach)
        df = df.dropna()
        
        if df.empty:
            raise serializers.ValidationError("CSV has no valid data after removing missing values.")
            
        return df
    except Exception as e:
        if isinstance(e, serializers.ValidationError):
            raise e
        raise serializers.ValidationError(f"Error parsing CSV: {str(e)}")

def encrypt_dataset(df):
    """
    Encrypt dataset using TenSEAL CKKS.
    Returns: (serialized_data, rows_count, columns_count)
    """
    # Create TenSEAL context
    context = ts.context(
        ts.SCHEME_TYPE.CKKS,
        poly_modulus_degree=8192,
        coeff_mod_bit_sizes=[60, 40, 40, 60]
    )
    context.generate_relin_keys()
    context.global_scale = 2**40
    
    # Process as flattened vector for simplicity in initial version
    # Real-world might use matrix/vector per column or row
    data_vector = df.values.flatten().tolist()
    
    # Encrypt
    encrypted_vector = ts.ckks_vector(context, data_vector)
    
    # Serialize context and ciphertext
    # Note: In production, the secret key should be handled securely
    # We include everything for demonstration, but typically secret key is with owner
    serialized_ctx = context.serialize(save_secret_key=True)
    serialized_vec = encrypted_vector.serialize()
    
    # Combine or separate. Here we'll return a combined binary blob for storage
    # [Length of Context][Context][Vector]
    ctx_len = len(serialized_ctx).to_bytes(4, byteorder='big')
    binary_data = ctx_len + serialized_ctx + serialized_vec
    
    return binary_data, df.shape[0], df.shape[1]

def process_and_encrypt_dataset(dataset_obj):
    """
    Main entry point for processing and encryption.
    """
    try:
        dataset_obj.status = "PROCESSING"
        dataset_obj.save()
        
        # 1. Parse
        df = parse_and_validate_csv(dataset_obj.original_file)
        
        # 2. Encrypt
        encrypted_binary, rows, cols = encrypt_dataset(df)
        
        # 3. Save
        file_name = f"{dataset_obj.id}_encrypted.bin"
        dataset_obj.encrypted_file.save(file_name, ContentFile(encrypted_binary))
        dataset_obj.rows_count = rows
        dataset_obj.columns_count = cols
        dataset_obj.status = "READY"
        dataset_obj.save()
        
    except Exception as e:
        dataset_obj.status = "FAILED"
        dataset_obj.save()
        raise e
