import sys
import os

# Add the 'app' directory to the python path so imports inside app/ work
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
