from newspaper import Article, Config
from datetime import datetime, timezone
import nltk
import httpx

# Ensure NLTK data is downloaded
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

def extract_article(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.google.com/",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
    }

    try:
        # Use httpx with HTTP/2 to bypass bot detection (e.g., Akamai)
        with httpx.Client(http2=True, headers=headers, follow_redirects=True, timeout=20) as client:
            response = client.get(url)
            
            if response.status_code == 200:
                article = Article(url)
                article.set_html(response.text)
                article.parse()
            else:
                raise Exception(f"HTTP {response.status_code} - Site blocked the request")
    except Exception as e:
        print(f"Error downloading or parsing article from {url}: {e}")
        return {
            "title": "Extraction Failed",
            "text": f"Could not extract content from the provided URL. Error: {str(e)}",
            "publish_date": None,
            "is_old": False,
            "age_days": None
        }

    publish_date = article.publish_date
    is_old = False
    age_days = None

    if publish_date:
        # Ensure publish_date is timezone-aware if it isn't
        if publish_date.tzinfo is None:
            publish_date = publish_date.replace(tzinfo=timezone.utc)
        
        now = datetime.now(timezone.utc)
        delta = now - publish_date
        age_days = delta.days
        if age_days > 30:
            is_old = True

    return {
        "title": article.title,
        "text": article.text,
        "publish_date": publish_date.isoformat() if publish_date else None,
        "is_old": is_old,
        "age_days": age_days
    }

def extract_key_claims(text, limit=3):
    """
    Splits text into sentences and returns the first 'limit' sentences as key claims.
    """
    try:
        sentences = nltk.sent_tokenize(text)
        # Filter out very short sentences
        claims = [s for s in sentences if len(s.split()) > 4]
        return claims[:limit]
    except Exception as e:
        print(f"Error extracting claims: {e}")
        return [text[:200]] # Fallback to first 200 chars
