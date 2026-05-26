from transformers import pipeline

_bias_classifier = None

def get_bias_classifier():
    global _bias_classifier
    if _bias_classifier is None:
        print("Loading Bias Detection Model...")
        # Using a lighter DistilBERT model for much faster classification
        _bias_classifier = pipeline("zero-shot-classification", model="typeform/distilbert-base-uncased-mnli")
    return _bias_classifier

def detect_bias(text):
    try:
        classifier = get_bias_classifier()
        candidate_labels = ["Left Leaning", "Center / Neutral", "Right Leaning"]
        # Use first 300 chars for maximum speed
        result = classifier(text[:300], candidate_labels)
        
        # Create a dictionary of results with percentages
        bias_results = {}
        for label, score in zip(result["labels"], result["scores"]):
            bias_results[label] = round(score * 100, 1)
            
        return {
            "top_label": result["labels"][0],
            "breakdown": bias_results
        }
    except Exception as e:
        print(f"Bias Detection Error: {e}")
        return {
            "top_label": "Center / Neutral",
            "breakdown": {"Left Leaning": 33.3, "Center / Neutral": 33.3, "Right Leaning": 33.3}
        }
