import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import hashlib
import sklearn

def run_anomaly_detection(df: pd.DataFrame) -> tuple[dict, dict]:
    """
    Executes IsolationForest with strict artifact management for SHAP.
    Returns (result_json, artifacts).
    """
    # 1. Drop constant features (std < 1e-6)
    stds = df.std()
    constant_features = stds[stds < 1e-6].index.tolist()
    clean_df = df.drop(columns=constant_features)
    
    if clean_df.empty or clean_df.shape[1] == 0:
        # Return a structured failure instead of crashing
        return {
            "type": "error",
            "error_code": "NO_FEATURES_REMAINING",
            "message": "Anomaly detection cannot proceed because all numeric features are constant or contain only null values."
        }, None

    feature_names = clean_df.columns.tolist()
    feature_hash = hashlib.sha256(",".join(feature_names).encode()).hexdigest()
    
    # 2. Scale data
    scaler = StandardScaler()
    X_scaled_np = scaler.fit_transform(clean_df)
    X_scaled = pd.DataFrame(X_scaled_np, columns=feature_names, index=clean_df.index)
    
    # 3. Train Model
    iso = IsolationForest(contamination='auto', random_state=42)
    predictions = iso.fit_predict(X_scaled)
    
    # 4. Score Standardization (Z-score)
    # decision_function gives anomaly score (lower is more abnormal)
    # We want higher score = more anomalous for visualization
    raw_scores = -iso.decision_function(X_scaled)
    scores_mean = np.mean(raw_scores)
    scores_std = np.std(raw_scores)
    std_scores = (raw_scores - scores_mean) / (scores_std if scores_std > 0 else 1.0)
    
    # 5. Top-K Selection (Exactly 15)
    anomaly_indices_all = np.where(predictions == -1)[0]
    total_anomalies = len(anomaly_indices_all)
    
    # Sort by standardized score descending
    sorted_idx = np.argsort(-std_scores[anomaly_indices_all])
    top_indices = anomaly_indices_all[sorted_idx[:15]].tolist()
    
    # 6. Deviation Matrix (Z-score)
    # We compare top anomalies to the "normal" population
    normal_indices = np.where(predictions == 1)[0]
    normal_data = X_scaled.iloc[normal_indices]
    normal_mean = normal_data.mean().values
    normal_std = normal_data.std().values
    
    # Safe Z-score: prevent division by zero
    std_safe = np.where(normal_std == 0, 1e-6, normal_std)
    
    # Compute Z-score deviations for top anomalies
    anom_data = X_scaled.iloc[top_indices].values
    deviation_matrix = (anom_data - normal_mean) / std_safe
    
    # 7. Background Sample for SHAP
    rng = np.random.default_rng(42)
    bg_size = min(100, len(normal_indices))
    if bg_size > 0:
        bg_indices = rng.choice(normal_indices, size=bg_size, replace=False)
        background_sample = X_scaled.iloc[bg_indices].values
    else:
        bg_indices = []
        background_sample = np.array([])

    artifacts = {
        "model": iso,
        "scaler": scaler,
        "background_sample": background_sample,
        "feature_names": feature_names,
        "active_feature_mask": feature_names,
        "feature_hash": feature_hash,
        "normal_mean": normal_mean,
        "normal_std": normal_std,
        "dropped_features": constant_features,
        "metadata": {
            "model_type": "IsolationForest",
            "model_version": "v1",
            "sklearn_version": sklearn.__version__,
            "feature_hash": feature_hash
        }
    }
    
    result_json = {
        "type": "anomaly",
        "count": total_anomalies,
        "percentage": round((total_anomalies / len(df)) * 100, 2) if len(df) > 0 else 0.0,
        "top_anomalies": top_indices,
        "features": feature_names,
        "deviation_matrix": deviation_matrix.tolist(),
        "scores": [float(s) for s in std_scores[top_indices]],
        "metadata": artifacts["metadata"]
    }
    
    return result_json, artifacts
