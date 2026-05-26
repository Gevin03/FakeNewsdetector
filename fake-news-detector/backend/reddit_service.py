import praw
import os
from dotenv import load_dotenv

load_dotenv()

def search_reddit(keyword):
    try:
        client_id = os.getenv("REDDIT_CLIENT_ID")
        client_secret = os.getenv("REDDIT_CLIENT_SECRET")
        
        if not client_id or not client_secret:
            print("Reddit API credentials missing in .env")
            return []

        reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent="fake-news-detector"
        )
        posts = []

        for submission in reddit.subreddit("news").search(keyword, limit=5):
            posts.append({
                "title": submission.title,
                "score": submission.score,
                "url": submission.url
            })

        return posts
    except Exception as e:
        print(f"Reddit API Error: {e}")
        return []
