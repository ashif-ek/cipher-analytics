import os
import sys
import django
import pandas as pd
import numpy as np

# Add parent directory to path so config module is found
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from datasets.ml_insights import execute_ml_insight

def run_tests():
    print("--- Running ML Insights Tests ---")
    
    # 1. Clean dataset
    df_clean = pd.DataFrame({
        'A': np.linspace(0, 100, 20),
        'B': np.linspace(0, 100, 20) * 2 + np.random.normal(0, 1, 20),
        'C': np.random.normal(0, 1, 20)
    })
    df_clean.to_csv("test_clean.csv", index=False)
    
    res1 = execute_ml_insight("CORRELATION", "test_clean.csv")
    print("Clean Correlation:", res1)
    
    res2 = execute_ml_insight("ANOMALY_DETECTION", "test_clean.csv")
    print("Clean Anomaly:", res2)
    
    # 2. Dirty dataset (missing values)
    df_dirty = df_clean.copy()
    df_dirty.loc[0, 'A'] = np.nan
    df_dirty.loc[5, 'B'] = np.nan
    df_dirty.to_csv("test_dirty.csv", index=False)
    
    res3 = execute_ml_insight("CORRELATION", "test_dirty.csv")
    print("Dirty Correlation:", res3)
    
    # 3. Not enough rows
    df_small = pd.DataFrame({'A': [1,2,3], 'B': [4,5,6]})
    df_small.to_csv("test_small.csv", index=False)
    
    res4 = execute_ml_insight("ANOMALY_DETECTION", "test_small.csv")
    print("Small Anomaly:", res4)
    
    # 4. Large dataset (> 100k)
    df_large = pd.DataFrame({
        'A': np.random.randn(100005),
        'B': np.random.randn(100005)
    })
    df_large.to_csv("test_large.csv", index=False)
    res5 = execute_ml_insight("CORRELATION", "test_large.csv")
    print("Large Correlation:", res5)

    res6 = execute_ml_insight("ANOMALY_DETECTION", "test_large.csv")
    print("Large Anomaly:", res6)
    
    # Cleanup
    for f in ["test_clean.csv", "test_dirty.csv", "test_small.csv", "test_large.csv"]:
        if os.path.exists(f):
            os.remove(f)
            
if __name__ == "__main__":
    run_tests()
