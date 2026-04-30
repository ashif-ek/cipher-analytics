import logging
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any
from sklearn.preprocessing import RobustScaler
from sklearn.ensemble import IsolationForest
import umap
from sklearn.cluster import HDBSCAN

logger = logging.getLogger(__name__)

def compute_3d_embedding(df: pd.DataFrame, precomputed_scores: Optional[np.ndarray] = None) -> List[Dict[str, Any]]:
    """
    Computes a 3D embedding of the dataset using UMAP, alongside anomaly scores and clusters.
    Enforces adaptive sampling to maintain performance.
    
    Args:
        df: The raw pandas DataFrame (preferably cleaned from ingestion).
        precomputed_scores: Optional numpy array of anomaly scores to reuse.
        
    Returns:
        List of dictionaries containing x, y, z, score, cluster, and feature_summary.
    """
    try:
        total_rows = len(df)
        
        # 1. Data Preprocessing
        # Select numeric columns
        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.empty:
            raise ValueError("No numeric columns available for embedding.")
            
        # Handle missing values safely (median imputation)
        numeric_df = numeric_df.fillna(numeric_df.median())
        
        # 2. Adaptive Sampling & Anomaly Scores
        # We need anomaly scores before sampling to do anomaly-aware sampling if > 100k
        scores = precomputed_scores
        
        # We must align scores with df before sampling
        if scores is None:
            # If no scores, we compute them on the full dataset or sample first?
            # IsolationForest is fast enough for 100k, but maybe we should sample first.
            # Let's scale first.
            scaler_init = RobustScaler()
            X_scaled_full = scaler_init.fit_transform(numeric_df)
            
            iso = IsolationForest(contamination='auto', random_state=42)
            # Higher score = more anomalous. Isolation forest returns negative for anomaly.
            # We negate it so higher is more anomalous.
            raw_scores = -iso.fit_predict(X_scaled_full) 
            # Or use decision_function which returns continuous scores (lower is more anomalous)
            decision_scores = -iso.decision_function(X_scaled_full)
            scores = decision_scores
        else:
            if len(scores) != len(numeric_df):
                raise ValueError("Precomputed scores length must match dataframe length.")
                
        # Combine back into a dataframe for sampling
        sample_df = numeric_df.copy()
        sample_df['_anomaly_score'] = scores
        
        # Adaptive Sampling Logic
        HARD_LIMIT = 20000
        sampled_df = sample_df
        
        if total_rows > 100000:
            # Anomaly-aware sampling: preserve rare points (high anomaly scores)
            # Keep top 5k anomalies, random sample 15k normal
            top_anomalies = sample_df.nlargest(5000, '_anomaly_score')
            remaining = sample_df.drop(top_anomalies.index)
            normal_sample = remaining.sample(n=15000, random_state=42)
            sampled_df = pd.concat([top_anomalies, normal_sample])
        elif total_rows > 10000:
            # Random sample ~15k
            n_sample = min(15000, total_rows)
            sampled_df = sample_df.sample(n=n_sample, random_state=42)
            
        # Re-extract scores and features
        final_scores = sampled_df['_anomaly_score'].values
        features_df = sampled_df.drop(columns=['_anomaly_score'])
        feature_names = features_df.columns.tolist()
        
        # Use RobustScaler to reduce outlier distortion
        scaler = RobustScaler()
        X_scaled = scaler.fit_transform(features_df)
        
        # 3. Clustering (HDBSCAN on original scaled features, not UMAP)
        # HDBSCAN on high dimensions can struggle, but it's better than distorted UMAP space
        clusterer = HDBSCAN(min_cluster_size=15, metric='euclidean')
        clusters = clusterer.fit_predict(X_scaled)
        
        # 4. Dimensionality Reduction (UMAP)
        # Ensure deterministic input ordering implicitly handled by pandas index resetting (we didn't reset, but order is deterministic based on sample random_state)
        reducer = umap.UMAP(n_components=3, random_state=42, n_jobs=1) # n_jobs=1 for strict reproducibility
        embedding = reducer.fit_transform(X_scaled)
        
        # 5. Normalization [-1, 1]
        # Min-Max scale the 3D embedding to [-1, 1]
        emb_min = embedding.min(axis=0)
        emb_max = embedding.max(axis=0)
        range_val = emb_max - emb_min
        # Avoid division by zero
        range_val[range_val == 0] = 1.0
        
        # scale to [0, 1] then to [-1, 1]
        embedding_norm = 2 * ((embedding - emb_min) / range_val) - 1
        
        # 6. Normalize Scores for visual mapping [0, 1]
        sc_min = final_scores.min()
        sc_max = final_scores.max()
        sc_range = sc_max - sc_min if sc_max > sc_min else 1.0
        final_scores_norm = (final_scores - sc_min) / sc_range
        
        # 7. Output Structure Formatting
        results = []
        for i in range(len(sampled_df)):
            # Create feature summary (top positive and negative deviations from median)
            row_scaled = X_scaled[i]
            # argsort sorts ascending, so last elements are highest positive, first are most negative
            sorted_idx = np.argsort(row_scaled)
            top_pos_idx = sorted_idx[-3:][::-1] # top 3 positive
            top_neg_idx = sorted_idx[:3] # top 3 negative
            
            feature_summary = {
                "top_positive": [{"feature": feature_names[idx], "value": float(row_scaled[idx])} for idx in top_pos_idx if row_scaled[idx] > 0],
                "top_negative": [{"feature": feature_names[idx], "value": float(row_scaled[idx])} for idx in top_neg_idx if row_scaled[idx] < 0]
            }
            
            results.append({
                "x": float(embedding_norm[i, 0]),
                "y": float(embedding_norm[i, 1]),
                "z": float(embedding_norm[i, 2]),
                "score": float(final_scores_norm[i]),
                "cluster": int(clusters[i]),
                "feature_summary": feature_summary
            })
            
        return results
        
    except Exception as e:
        logger.exception("Failed to compute 3D embedding.")
        raise
