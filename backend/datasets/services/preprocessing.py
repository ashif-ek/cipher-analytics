import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

class AdaptivePreprocessor:
    """
    Cleans and prepares data for FHE/ML pipelines.
    Handles imputation, constant dropping, and safe encoding.
    """
    
    def __init__(self, profile):
        self.profile = profile

    def apply(self, df):
        if df is None or df.empty:
            return df
            
        # 1. Drop constant columns
        df = df.drop(columns=self.profile["constant_columns"])
        
        # 2. Impute Numeric
        for col in self.profile["numeric_columns"]:
            if col in df.columns:
                median = df[col].median()
                df[col] = df[col].fillna(median)
                
        # 3. Impute Categorical
        for col in self.profile["categorical_columns"]:
            if col in df.columns:
                if not df[col].mode().empty:
                    mode = df[col].mode()[0]
                    df[col] = df[col].fillna(mode)
                else:
                    df[col] = df[col].fillna("UNKNOWN")

        # 4. Handle High Cardinality (Safety Drop)
        # In a real system, we might use hashing or target encoding here.
        # For this FHE-focused platform, we drop them to avoid dimensionality explosion.
        df = df.drop(columns=self.profile["high_cardinality_columns"])
        
        return df
