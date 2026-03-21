import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import pickle
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "anomaly_model.pkl")
DATA_PATH = os.path.join(BASE_DIR, "data", "network_dataset.csv")

class AnomalyEngine:
    def __init__(self):
        self.model = None
        self.ensure_data_exists()
        self.load_or_train()

    def ensure_data_exists(self):
        if not os.path.exists(DATA_PATH):
            os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
            # Generate synthetic "real" dataset
            n_samples = 1500
            data = {
                'src_bytes': np.random.lognormal(mean=8, sigma=1.5, size=n_samples),
                'dst_bytes': np.random.lognormal(mean=7, sigma=1.2, size=n_samples),
                'count': np.random.randint(1, 50, size=n_samples),
                'srv_count': np.random.randint(1, 50, size=n_samples),
            }
            df = pd.DataFrame(data)
            # Inject anomalies
            n_anomalies = 60
            indices = np.random.choice(n_samples, n_anomalies, replace=False)
            df.loc[indices, 'src_bytes'] *= 30
            df.loc[indices, 'count'] *= 8
            df.to_csv(DATA_PATH, index=False)

    def load_or_train(self):
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                
                self.model = pickle.load(f)
        else:
            self.train_default()

    def train_default(self):
        if not os.path.exists(DATA_PATH): return
        df = pd.read_csv(DATA_PATH)
        features = ['src_bytes', 'dst_bytes', 'count', 'srv_count']
        X = df[features]
        self.model = IsolationForest(contamination=0.08, random_state=42)
        self.model.fit(X)
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(self.model, f)

    def predict_dataframe(self, df):
        features = ['src_bytes', 'dst_bytes', 'count', 'srv_count']
        # Check if features exist
        if not all(col in df.columns for col in features):
            # Try to map if possible or return error
            return None, "Missing required columns: src_bytes, dst_bytes, count, srv_count"
        
        X = df[features]
        # Predict: 1 for inliers, -1 for outliers
        preds = self.model.predict(X)
        # Decision function: higher is more normal
        scores = self.model.decision_function(X)
        
        # Convert to more user-friendly format
        results = []
        # Convert to more user-friendly format
        results = []
        for i in range(len(df)):
            is_anomaly = bool(preds[i] == -1)
            # Normalize score to 0-1 (higher score = more anomalous for our UI)
            # IsolationForest decision_function returns negative values for anomalies
            # and positive for normal points.
            anomaly_prob = 1.0 - ((float(scores[i]) + 0.5) / 1.0) # Crude normalization
            anomaly_prob = max(0.0, min(1.0, float(anomaly_prob)))
            
            results.append({
                "index": i,
                "is_anomaly": is_anomaly,
                "anomaly_score": float(int(anomaly_prob * 1000) / 1000.0),
                "severity": "HIGH" if anomaly_prob > 0.7 else ("MEDIUM" if anomaly_prob > 0.4 else "LOW")
            })
        return results, None

    def predict_single(self, src_bytes, dst_bytes, count, srv_count):
        df = pd.DataFrame([[src_bytes, dst_bytes, count, srv_count]], 
                          columns=['src_bytes', 'dst_bytes', 'count', 'srv_count'])
        results, err = self.predict_dataframe(df)
        if err: return None
        return results[0]

anomaly_engine = AnomalyEngine()
