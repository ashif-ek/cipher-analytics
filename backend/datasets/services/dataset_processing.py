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
    context.generate_galois_keys()
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
    Raises exceptions directly to allow Celery to handle retries and state updates.
    """
    # 1. Parse
    df = parse_and_validate_csv(dataset_obj.original_file)
    
    # 2. Encrypt
    encrypted_binary, rows, cols = encrypt_dataset(df)
    
    # 3. Save
    file_name = f"{dataset_obj.id}_encrypted.bin"
    dataset_obj.encrypted_file.save(file_name, ContentFile(encrypted_binary))
    dataset_obj.rows_count = rows
    dataset_obj.columns_count = cols
    dataset_obj.save(update_fields=['encrypted_file', 'rows_count', 'columns_count'])

def compute_encrypted_aggregation(dataset_obj, operation="sum"):
    """
    Load encrypted data, perform homomorphic operation (sum/mean), 
    decrypt and return the numerical result.
    """
    if not dataset_obj.encrypted_file:
        raise ValueError("Dataset is not yet encrypted.")
        
    # 1. Read binary data
    dataset_obj.encrypted_file.seek(0)
    binary_data = dataset_obj.encrypted_file.read()
    
    # 2. Extract Context and Vector
    ctx_len = int.from_bytes(binary_data[:4], byteorder='big')
    serialized_ctx = binary_data[4:4+ctx_len]
    serialized_vec = binary_data[4+ctx_len:]
    
    # 3. Reload into TenSEAL
    context = ts.context_from(serialized_ctx)
    encrypted_vector = ts.ckks_vector_from(context, serialized_vec)
    
    # 4. Perform operation homomorphically
    if operation == "sum":
        result_encrypted = encrypted_vector.sum()
        result_plaintext = result_encrypted.decrypt()
        value = result_plaintext[0]
        return {"operation": "sum", "result": round(value, 4)}
        
    elif operation == "mean":
        result_encrypted = encrypted_vector.sum()
        total_elements = dataset_obj.rows_count * dataset_obj.columns_count
        if total_elements > 0:
            result_encrypted = result_encrypted * (1.0 / total_elements)
            
        result_plaintext = result_encrypted.decrypt()
        value = result_plaintext[0]
        return {"operation": "mean", "result": round(value, 4)}
    else:
        raise ValueError("Unsupported operation")
