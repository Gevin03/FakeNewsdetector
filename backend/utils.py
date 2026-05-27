from newspaper import Article, Config
from datetime import datetime, timezone
import nltk
import httpx

# Ensure NLTK data is downloaded
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

import cloudscraper
import requests

def extract_article(url):
    config = Config()
    config.browser_user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    config.request_timeout = 15
    config.follow_redirects = True
    
    try:
        article = Article(url, config=config)
        article.download()
        
        # Check if download was successful
        if article.download_state == 2: # Success
            article.parse()
            if not article.text or len(article.text) < 50:
                 # Try again with a different UA if text is empty
                 config.browser_user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
                 article = Article(url, config=config)
                 article.download()
                 article.parse()
        
        if not article.text:
            raise Exception("No content could be extracted.")

    except Exception as e:
        print(f"Error during extraction from {url}: {e}")
        return {
            "title": "Extraction Failed",
            "text": f"This website is protected against automated reading. Please copy and paste the article text directly into the 'Analyze Text' box instead.",
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
