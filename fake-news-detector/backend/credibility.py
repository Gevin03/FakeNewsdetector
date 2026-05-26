from urllib.parse import urlparse

# A more comprehensive database of news sources with bias and credibility ratings
# Based on common media bias charts (Ad Fontes Media, AllSides)
SOURCE_METRICS = {
    "reuters.com": {"trust": 95, "bias": "Center"},
    "apnews.com": {"trust": 95, "bias": "Center"},
    "bbc.com": {"trust": 90, "bias": "Center"},
    "nytimes.com": {"trust": 85, "bias": "Left-Center"},
    "wsj.com": {"trust": 85, "bias": "Right-Center"},
    "theguardian.com": {"trust": 80, "bias": "Left"},
    "foxnews.com": {"trust": 60, "bias": "Right"},
    "cnn.com": {"trust": 65, "bias": "Left"},
    "breitbart.com": {"trust": 30, "bias": "Extreme Right"},
    "infowars.com": {"trust": 5, "bias": "Extreme Right / Conspiracy"},
    "dailykos.com": {"trust": 40, "bias": "Extreme Left"},
    "theonion.com": {"trust": 100, "bias": "Satire"}, # Trusted as satire
    "economictimes.indiatimes.com": {"trust": 85, "bias": "Center"},
    "ndtv.com": {"trust": 80, "bias": "Left-Center"},
    "timesofindia.indiatimes.com": {"trust": 75, "bias": "Center"},
    "hindustantimes.com": {"trust": 75, "bias": "Center"},
}

BLACKLIST = [
    "fake-news-example.com",
    "abcnews.com.co", # Famous fake abc news site
    "naturalnews.com",
    "worldnewsdailyreport.com"
]

def get_domain(url):
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    if domain.startswith("www."):
        domain = domain[4:]
    return domain

def credibility_score(url):
    domain = get_domain(url)
    
    # Default values for unknown sources
    score = 70
    bias = "Unknown"
    
    # Check blacklist
    if domain in BLACKLIST:
        return {
            "domain": domain,
            "credibility_score": 0,
            "political_bias": "Malicious / Fake",
            "status": "Blacklisted"
        }

    # Check known metrics
    if domain in SOURCE_METRICS:
        metrics = SOURCE_METRICS[domain]
        score = metrics["trust"]
        bias = metrics["bias"]
    else:
        # Heuristic checks for unknown domains
        if any(ext in domain for ext in [".gov", ".edu"]):
            score = 95
            bias = "Center/Official"
        elif "blog" in domain or domain.count(".") > 2:
            score = 40
            bias = "User Generated / Unverified"

    # HTTPS check
    if "https" not in url:
        score -= 15

    return {
        "domain": domain,
        "credibility_score": max(0, score),
        "political_bias": bias,
        "status": "Verified Source" if domain in SOURCE_METRICS else "Unknown Source"
    }
