import pandas as pd
from sklearn.preprocessing import StandardScaler

def hybrid_imputer(df: pd.DataFrame) -> pd.DataFrame:
    """
    Forward fill -> Mean imputation -> Drop rows (last resort)
    """
    # 1. Forward fill first safely
    df = df.ffill()
    
    # 2. Mean imputation for any variables strictly numeric
    for col in df.select_dtypes(include=['number']).columns:
        if df[col].isna().any():
            df[col] = df[col].fillna(df[col].mean())
            
    # 3. Drop remaining NaNs (last resort)
    df = df.dropna()
    return df

def apply_scaling(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply standard scalar. Must be called AFTER imputation.
    """
    if df.empty:
        return df
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(df)
    return pd.DataFrame(scaled_data, columns=df.columns, index=df.index)
