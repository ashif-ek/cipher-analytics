import pandas as pd
import numpy as np
from .errors import build_error

def validate_dataset(df: pd.DataFrame, operation: str):
    """
    Strict validation layer for incoming raw datasets.
    """
    if df.empty:
        return None, build_error("EMPTY_DATASET", "The dataset is empty.")

    # 1. Extract purely numeric features
    num_df = df.select_dtypes(include=[np.number])
    if num_df.empty:
        return None, build_error("NO_NUMERIC_DATA", "Dataset contains no numeric columns.", "Include numeric features.")
        
    # 2. Missing data proportion enforcement
    total_cells = num_df.shape[0] * num_df.shape[1]
    missing_cells = num_df.isna().sum().sum()
    pct_missing = missing_cells / total_cells if total_cells > 0 else 0
    if pct_missing > 0.4:
        return None, build_error(
            "HIGH_MISSING_DATA", 
            f"Dataset has {pct_missing:.1%} missing data (>40% allowed threshold).",
            "Impute your data or remove corrupted rows prior to upload."
        )

    # 3. Remove constant columns (zero variance or all NaNs)
    num_df = num_df.dropna(axis=1, how='all')
    if num_df.empty:
        return None, build_error("ALL_NANS", "All numeric columns consist entirely of null values.")
        
    variances = num_df.var(skipna=True)
    constant_cols = variances[variances == 0].index
    if not constant_cols.empty:
        num_df = num_df.drop(columns=constant_cols)
        
    if num_df.empty:
        return None, build_error("NO_VARIANCE", "All numeric columns have zero variance (constant values).")

    # 4. Remove deeply duplicated columns
    num_df = num_df.loc[:, ~num_df.columns.duplicated()]
    num_df = num_df.T.drop_duplicates().T

    # 5. Operation Strict Minimum Requirements
    if operation == "CORRELATION":
        if num_df.shape[1] < 2:
            return None, build_error("INVALID_DIMENSIONS", "Correlation matrix requires at least 2 numeric columns.")
            
    elif operation == "ANOMALY_DETECTION":
        if num_df.shape[0] < 10:
            return None, build_error("INVALID_DIMENSIONS", "Anomaly detection requires at least 10 rows to build statistical profiles.")
        if num_df.shape[1] < 1:
            return None, build_error("INVALID_DIMENSIONS", "Anomaly detection requires at least 1 numeric column.")

    return num_df, None
