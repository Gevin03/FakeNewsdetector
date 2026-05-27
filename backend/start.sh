#!/bin/bash
# Download NLTK data
python -m nltk.downloader punkt punkt_tab

# Start the application
# We use 'app:app' and rely on the PYTHONPATH or Root Directory
uvicorn app:app --host 0.0.0.0 --port $PORT
