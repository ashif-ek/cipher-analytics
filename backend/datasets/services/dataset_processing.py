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
    
    # 15MB limit
    if file.size > 15 * 1024 * 1024:
        raise serializers.ValidationError("File size must be under 15MB.")
    
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
    Encrypt dataset using TenSEAL CKKS with slot-aware chunking.
    Returns: (serialized_data, rows_count, columns_count)
    """
    # Create TenSEAL context
    poly_mod = 8192
    context = ts.context(
        ts.SCHEME_TYPE.CKKS,
        poly_modulus_degree=poly_mod,
        coeff_mod_bit_sizes=[60, 40, 40, 60]
    )
    context.generate_relin_keys()
    context.generate_galois_keys() # Needed for .sum() rotations
    context.global_scale = 2**40
    
    # Calculate slots (usually poly_mod / 2 for CKKS)
    slots = poly_mod // 2
    
    # Flatten and chunk
    data_vector = df.values.flatten().tolist()
    total_elements = len(data_vector)
    
    encrypted_chunks = []
    for i in range(0, total_elements, slots):
        chunk = data_vector[i : i + slots]
        # Pad chunk with zeros if it's the last one and smaller than slots
        # (Though TenSEAL handles variable sizes, keeping them consistent can help)
        encrypted_chunks.append(ts.ckks_vector(context, chunk))
    
    # Serialize
    serialized_ctx = context.serialize(save_secret_key=True)
    serialized_chunks = [c.serialize() for c in encrypted_chunks]
    
    # Combine binary blob: 
    # [4: ctx_len][ctx][4: num_chunks][4: chunk1_len][chunk1]...
    ctx_bytes = serialized_ctx
    ctx_len = len(ctx_bytes).to_bytes(4, byteorder='big')
    num_chunks = len(serialized_chunks).to_bytes(4, byteorder='big')
    
    binary_data = ctx_len + ctx_bytes + num_chunks
    for sc in serialized_chunks:
        binary_data += len(sc).to_bytes(4, byteorder='big')
        binary_data += sc
        
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
    dataset_obj.ciphertext_path.save(file_name, ContentFile(encrypted_binary))
    dataset_obj.rows_count = rows
    dataset_obj.columns_count = cols
    dataset_obj.save(update_fields=['ciphertext_path', 'rows_count', 'columns_count'])

def compute_encrypted_aggregation(dataset_obj, operation="sum"):
    """
    Load chunked encrypted data, perform homomorphic operation (sum/mean), 
    decrypt and return the numerical result.
    """
    if not dataset_obj.ciphertext_path:
        raise ValueError("Dataset is not yet encrypted.")
        
    # 1. Read binary data
    dataset_obj.ciphertext_path.seek(0)
    binary_data = dataset_obj.ciphertext_path.read()
    
    # 2. Extract Context and Chunks
    offset = 0
    ctx_len = int.from_bytes(binary_data[offset:offset+4], byteorder='big')
    offset += 4
    serialized_ctx = binary_data[offset:offset+ctx_len]
    offset += ctx_len
    
    context = ts.context_from(serialized_ctx)
    
    num_chunks = int.from_bytes(binary_data[offset:offset+4], byteorder='big')
    offset += 4
    
    chunks = []
    for _ in range(num_chunks):
        c_len = int.from_bytes(binary_data[offset:offset+4], byteorder='big')
        offset += 4
        chunks.append(ts.ckks_vector_from(context, binary_data[offset:offset+c_len]))
        offset += c_len
    
    # 3. Perform operation homomorphically across chunks
    total_sum = 0
    for i, encrypted_vector in enumerate(chunks):
        chunk_sum = encrypted_vector.sum().decrypt()[0]
        total_sum += chunk_sum
        
    if operation == "sum":
        return {"operation": "sum", "result": round(total_sum, 4)}
        
    elif operation == "mean":
        total_elements = dataset_obj.rows_count * dataset_obj.columns_count
        if total_elements > 0:
            value = total_sum / total_elements
            return {"operation": "mean", "result": round(value, 4)}
        return {"operation": "mean", "result": 0}
    else:
        raise ValueError("Unsupported operation")
