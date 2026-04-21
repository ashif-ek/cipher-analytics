import logging
import pandas as pd
from .errors import build_error
from .validation import validate_dataset
from .preprocessing import hybrid_imputer, apply_scaling
from .correlation import compute_correlation
from .anomaly import run_anomaly_detection

logger = logging.getLogger(__name__)

def execute_ml_pipeline(operation: str, file_path: str) -> dict:
    """
    Main orchestration router. Guaranteed to return structured V2 JSON.
    Never throws an exception upward.
    """
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        return build_error("FILE_READ_ERROR", "Could not read or parse the CSV.", debug={"error": str(e)})
        
    operation = operation.upper()
    total_rows, total_cols = df.shape
    
    # 1. Deterministic Sampling Strategy
    sampling_meta = {
        "applied": False,
        "original_rows": total_rows,
        "sampled_rows": total_rows
    }
    
    if total_rows > 50000:
        df = df.sample(n=50000, random_state=42)
        sampling_meta.update({
            "applied": True,
            "sampled_rows": 50000
        })
        
    # 2. Validation Stage
    valid_df, error_dict = validate_dataset(df, operation)
    if error_dict:
        error_dict["debug"].update(sampling_meta)
        return error_dict
        
    # 3. Preprocessing Stage
    try:
        clean_df = hybrid_imputer(valid_df)
    except Exception as e:
         return build_error("IMPUTATION_ERROR", "Failed to clean dataset missing values.", debug={"error": str(e)})
         
    if clean_df.empty:
         return build_error("EXTREME_DATA_LOSS", "Dataset is empty after imputation drops.")
         
    # 4. Computation Routing
    result_data = {}
    artifacts = None
    try:
        if operation == "CORRELATION":
            # Raw (unscaled) output needed for correlation
            result_data = compute_correlation(clean_df)
            
        elif operation == "ANOMALY_DETECTION":
            # V2 Logic: Pass clean_df, it handles scaling internally to capture artifacts
            result_data, artifacts = run_anomaly_detection(clean_df)
            
        else:
            return build_error("UNSUPPORTED_OPERATION", f"Operation '{operation}' is not supported.")
            
    except Exception as e:
        logger.exception("ML Core Engine Failure.")
        return build_error(
            "COMPUTATION_FAILURE", 
            "An unexpected internal error occurred during mathematical execution.", 
            debug={"error": str(e)}
        )
        
    # 5. Generic V2 encapsulation
    response = {
        "version": "v2",
        "operation": operation,
        "status": "success",
        "sampling": sampling_meta,
        "result": result_data
    }
    
    if artifacts:
        response["artifacts"] = artifacts
        
    return response
