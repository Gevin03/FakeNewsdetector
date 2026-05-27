import requests
import os
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
API_URL = "https://api-inference.huggingface.co/models/hamzab/roberta-fake-news-classification"
headers = {"Authorization": f"Bearer {HF_TOKEN}"}

def predict_fake_news(text):
    if not HF_TOKEN:
        print("Warning: HF_TOKEN not found. API calls may fail.")
    
    payload = {"inputs": text}
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=20)
        result = response.json()
        
        # Hugging Face API returns a list of lists of dicts for text-classification
        # Example: [[{'label': 'FAKE', 'score': 0.99}, {'label': 'REAL', 'score': 0.01}]]
        if isinstance(result, list) and len(result) > 0:
            top_prediction = result[0][0]
            return {
                "label": top_prediction["label"],
                "score": round(top_prediction["score"], 4)
            }
        
        # Handle API loading state
        if "error" in result and "loading" in result["error"]:
            print("Model is loading on Hugging Face...")
            return {"label": "Loading", "score": 0.0}

        return {"label": "Unknown", "score": 0.0}
    except Exception as e:
        print(f"Hugging Face API Error: {e}")
        return {"label": "Error", "score": 0.0}
