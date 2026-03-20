import pandas as pd
import numpy as np
import os

# Create data directory
os.makedirs('backend/data', exist_ok=True)

# Generate a synthetic "real" dataset for network anomalies
# Columns: duration, protocol_type, service, src_bytes, dst_bytes, count, srv_count, label
n_samples = 1000
data = {
    'duration': np.random.exponential(scale=0.1, size=n_samples),
    'src_bytes': np.random.lognormal(mean=8, sigma=2, size=n_samples),
    'dst_bytes': np.random.lognormal(mean=7, sigma=1.5, size=n_samples),
    'count': np.random.randint(1, 100, size=n_samples),
    'srv_count': np.random.randint(1, 100, size=n_samples),
    'logged_in': np.random.choice([0, 1], size=n_samples, p=[0.1, 0.9]),
    'is_anomaly': 0
}

df = pd.DataFrame(data)

# Inject anomalies (outliers)
n_anomalies = 50
indices = np.random.choice(n_samples, n_anomalies, replace=False)

df.loc[indices, 'src_bytes'] = df.loc[indices, 'src_bytes'] * 50
df.loc[indices, 'count'] = df.loc[indices, 'count'] * 10
df.loc[indices, 'is_anomaly'] = 1

df.to_csv('backend/data/network_dataset.csv', index=False)
print("Dataset created at backend/data/network_dataset.csv")
