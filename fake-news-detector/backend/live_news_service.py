import feedparser
from urllib.parse import quote

def get_live_news(query):
    """
    Fetches live news from Google News RSS feed based on a query.
    """
    try:
        encoded_query = quote(query)
        url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"
        feed = feedparser.parse(url)
        
        live_articles = []
        for entry in feed.entries[:5]:
            live_articles.append({
                "title": entry.title,
                "url": entry.link,
                "published": entry.published,
                "source": entry.source.title if hasattr(entry, 'source') else "Google News"
            })
        return live_articles
    except Exception as e:
        print(f"Error fetching live news: {e}")
        return []
