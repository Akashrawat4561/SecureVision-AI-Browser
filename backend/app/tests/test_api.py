import pytest
from fastapi.testclient import TestClient
import sys
import os

# Ensure app is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from main import app

client = TestClient(app)

def test_api_docs_available():
    """Verify that the FastAPI interactive documentation is generated and accessible."""
    response = client.get("/docs")
    assert response.status_code == 200

def test_honeypot_events_endpoint_unauthorized_or_empty():
    """Basic structural validation of the honeypot events endpoint."""
    response = client.get("/api/honeypot/events")
    # Even if empty or structurally changing, it shouldn't 500
    assert response.status_code in (200, 401, 403)
