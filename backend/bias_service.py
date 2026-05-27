import requests
import os
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
API_URL = "https://api-inference.huggingface.co/models/typeform/distilbert-base-uncased-mnli"
headers = {"Authorization": f"Bearer {HF_TOKEN}"}

def detect_bias(text):
    if not HF_TOKEN:
        print("Warning: HF_TOKEN not found for Bias Detection.")
    
    candidate_labels = ["Left Leaning", "Center / Neutral", "Right Leaning"]
    payload = {
        "inputs": text[:500],
        "parameters": {"candidate_labels": candidate_labels}
    }
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=20)
        result = response.json()
        
        # Zero-shot classification returns {labels: [], scores: []}
        if "labels" in result and "scores" in result:
            bias_results = {}
            for label, score in zip(result["labels"], result["scores"]):
                bias_results[label] = round(score * 100, 1)
                
            return {
                "top_label": result["labels"][0],
                "breakdown": bias_results
            }
        
        if "error" in result and "loading" in result["error"]:
            return {"top_label": "Loading...", "breakdown": {}}

        return {"top_label": "Center / Neutral", "breakdown": {}}
    except Exception as e:
        print(f"Bias Detection API Error: {e}")
        return {
            "top_label": "Center / Neutral",
            "breakdown": {"Left Leaning": 33.3, "Center / Neutral": 33.3, "Right Leaning": 33.3}
        }
