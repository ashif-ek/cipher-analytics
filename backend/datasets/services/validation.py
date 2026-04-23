import pandas as pd
import numpy as np

class DataProfiler:
    """
    Analyzes dataset quality, identifies column types, and detects unusable data.
    """
    
    NULL_THRESHOLD_GLOBAL = 0.8
    NULL_THRESHOLD_COLUMN = 0.9
    CARDINALITY_THRESHOLD = 100
    
    def __init__(self, df):
        self.df = df
        self.profile = {
            "numeric_columns": [],
            "categorical_columns": [],
            "null_summary": {},
            "constant_columns": [],
            "high_cardinality_columns": []
        }
        self.is_valid = True
        self.reason = None

    def profile_dataset(self):
        if self.df is None or self.df.empty:
            self.is_valid = False
            self.reason = "EMPTY_DATAFRAME"
            return self.profile

        # 1. Global Null Check
        null_ratio = self.df.isnull().mean().mean()
        if null_ratio > self.NULL_THRESHOLD_GLOBAL:
            self.is_valid = False
            self.reason = f"EXTREME_NULL_RATIO: {null_ratio:.2%}"
            return self.profile

        for col in self.df.columns:
            series = self.df[col]
            
            # 2. Check for constant columns
            if series.nunique() <= 1:
                self.profile["constant_columns"].append(col)
                continue

            # 3. Check for nulls
            col_null_ratio = series.isnull().mean()
            self.profile["null_summary"][col] = col_null_ratio
            if col_null_ratio > self.NULL_THRESHOLD_COLUMN:
                continue

            # 4. Type Detection
            if pd.api.types.is_numeric_dtype(series):
                self.profile["numeric_columns"].append(col)
            else:
                self.profile["categorical_columns"].append(col)
                # 5. Cardinality Check
                if series.nunique() > self.CARDINALITY_THRESHOLD:
                    self.profile["high_cardinality_columns"].append(col)

        # Final usability check
        valid_cols = len(self.profile["numeric_columns"]) + len(self.profile["categorical_columns"])
        if valid_cols == 0:
            self.is_valid = False
            self.reason = "NO_VALID_COLUMNS_REMAINING"

        return self.profile
