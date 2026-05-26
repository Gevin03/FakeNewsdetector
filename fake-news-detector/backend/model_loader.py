from transformers import pipeline

_classifier = None

def get_classifier():
    global _classifier
    if _classifier is None:
        print("Loading Fake News Classifier...")
        _classifier = pipeline(
            "text-classification",
            model="hamzab/roberta-fake-news-classification",
            truncation=True
        )
    return _classifier

def predict_fake_news(text):
    classifier = get_classifier()
    result = classifier(text)[0]

    return {
        "label": result["label"],
        "score": round(result["score"], 4)
    }
