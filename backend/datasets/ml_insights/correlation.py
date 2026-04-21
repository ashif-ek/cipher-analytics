import pandas as pd
import numpy as np

def compute_correlation(df: pd.DataFrame) -> dict:
    """
    Computes a full correlation matrix and structural summaries.
    Uses basic Pearson correlation.
    """
    corr_matrix = df.corr()
    
    # Structural breakdown for UI matrix rendering
    cols = corr_matrix.columns.tolist()
    # Replace any NaNs with 0 in the JSON payload (can happen if variance is 0, but validation should catch it)
    matrix_values = corr_matrix.fillna(0.0).values.tolist()
    
    # Extract unique pairs using upper triangle
    upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
    corr_pairs = upper.unstack().dropna()
    
    strong = []
    moderate = []
    weak = []
    pairs_dict = {}
    
    for (col1, col2), val in corr_pairs.items():
        pair_str = f"{col1}-{col2}"
        v = float(val)
        pairs_dict[pair_str] = v
        
        abs_v = abs(v)
        if abs_v > 0.7:
            strong.append(pair_str)
        elif abs_v >= 0.3:
            moderate.append(pair_str)
        else:
            weak.append(pair_str)
            
    return {
        "type": "correlation",
        "matrix": {
            "columns": cols,
            "values": matrix_values
        },
        "pairs": pairs_dict,
        "summary": {
            "strong_pairs": strong,
            "moderate_pairs": moderate,
            "weak_pairs": weak
        }
    }
