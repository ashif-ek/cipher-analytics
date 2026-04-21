import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def run_anomaly_detection(scaled_df: pd.DataFrame) -> dict:
    """
    Executes IsolationForest anomaly detection dynamically.
    No hardcoded contamination. Relies on score thresholding internally.
    """
    iso = IsolationForest(contamination='auto', random_state=42)
    predictions = iso.fit_predict(scaled_df)
    
    # decision_function gives anomaly score (lower is more abnormal)
    scores = iso.decision_function(scaled_df)
    
    # Find anomaly index bounds (-1 prediction)
    anomaly_indices = np.where(predictions == -1)[0].tolist()
    count = len(anomaly_indices)
    total = len(scaled_df)
    pct = round((count / total) * 100, 2) if total > 0 else 0.0
    
    # Dynamic threshold boundary used by IsolationForest 'auto'
    threshold = float(iso.offset_[0]) if hasattr(iso, 'offset_') else 0.0
    
    # Intelligent Explanation: Why are these anomalous?
    # Mean difference per feature compared between normal and anomaly rows
    top_features = []
    if count > 0 and count < total:
        normal_idx = np.where(predictions == 1)[0]
        anom_data = scaled_df.iloc[anomaly_indices]
        norm_data = scaled_df.iloc[normal_idx]
        
        diff = (anom_data.mean() - norm_data.mean()).abs()
        top_features = diff.sort_values(ascending=False).head(3).index.tolist()
        
    return {
        "type": "anomaly",
        "count": count,
        "percentage": float(pct),
        "indices": anomaly_indices[:100],  # Bound payload sizes
        "scores": [float(s) for s in scores[:100]],
        "threshold": float(threshold),
        "explanation": {
            "top_contributing_features": top_features
        }
    }
