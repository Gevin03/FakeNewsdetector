import requests
import json

url = "http://127.0.0.1:8000/analyze-text"


# Sample payload for the analyze-text endpoint
payload = {
    "text": "This is a short test article used by automated tests. It contains a few claims about technology and society to exercise the analysis endpoint."
}

# Sample payload for testing
payload = {
    "text": "Scientists announce a breakthrough in renewable energy, claiming 90% efficiency in new solar cells."
}


try:
    response = requests.post(url, json=payload, timeout=30)
    print(f"Status: {response.status_code}")
    print("Response Data:")
    try:
        print(json.dumps(response.json(), indent=2))
    except Exception:
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
