import concurrent.futures
from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from model_loader import predict_fake_news
from credibility import credibility_score
from reddit_service import search_reddit
from utils import extract_article, extract_key_claims
from live_news_service import get_live_news
from veracity_engine import calculate_veracity, verify_claims
from bias_service import detect_bias
from wikipedia_service import search_wikipedia

import models
from database import SessionLocal, engine

from contextlib import asynccontextmanager
import nltk

# Create tables
models.Base.metadata.create_all(bind=engine)

# Global thread pool for parallel tasks
executor = concurrent.futures.ThreadPoolExecutor(max_workers=5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("Initializing TruthGuard AI neural services...")
    for pkg in ['punkt', 'punkt_tab']:
        try:
            nltk.data.find(f'tokenizers/{pkg}')
        except LookupError:
            print(f"Downloading NLTK package: {pkg}...")
            nltk.download(pkg, quiet=True)
    yield
    # Shutdown logic
    print("Shutting down TruthGuard AI thread executor...")
    executor.shutdown()

app = FastAPI(lifespan=lifespan)

# Dependency for database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NewsRequest(BaseModel):
    text: str

class URLRequest(BaseModel):
    url: str

@app.get("/")
def home():
    return {"message": "Fake News Detector API"}

@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    articles = db.query(models.Article).order_by(models.Article.timestamp.desc()).limit(10).all()
    return articles

@app.post("/analyze-text")
def analyze_text(data: NewsRequest, db: Session = Depends(get_db)):
    try:
        # Run independent tasks in parallel
        with concurrent.futures.ThreadPoolExecutor() as exec:
            future_prediction = exec.submit(predict_fake_news, data.text)
            future_bias = exec.submit(detect_bias, data.text)
            future_live_news = exec.submit(get_live_news, data.text[:100])
            future_wiki = exec.submit(search_wikipedia, data.text[:100])
            
            prediction = future_prediction.result()
            bias = future_bias.result()
            live_news = future_live_news.result()
            wiki_data = future_wiki.result()

        veracity_result = calculate_veracity(prediction, live_news, data.text)

        # Topic-by-Topic Claims Breakdown
        claims = extract_key_claims(data.text)
        claims_breakdown = verify_claims(claims, get_live_news, prediction)

        # Save to DB
        new_article = models.Article(
            content=data.text[:500],
            verdict=veracity_result["verdict"],
            realness_score=veracity_result["realness_percentage"],
            bias_label=bias["top_label"]
        )
        db.add(new_article)
        db.commit()

        return {
            "success": True,
            "prediction": {
                "label": veracity_result["label"],
                "score": veracity_result["score"],
                "realness_score": veracity_result["realness_percentage"],
                "verdict": veracity_result["verdict"]
            },
            "bias": bias,
            "live_news": live_news,
            "wikipedia_references": wiki_data,
            "claims_breakdown": claims_breakdown,
            "reddit_discussions": []
        }
    except Exception as e:
        print(f"Error during text analysis: {e}")
        return {"success": False, "error": str(e)}

@app.post("/analyze-url")
def analyze_url(data: URLRequest, db: Session = Depends(get_db)):
    try:
        article = extract_article(data.url)
        
        if article.get("title") == "Extraction Failed":
             return {
                "success": False,
                "error": article.get("text"),
                "title": "Extraction Failed"
            }

        # Run independent tasks in parallel
        with concurrent.futures.ThreadPoolExecutor() as exec:
            future_prediction = exec.submit(predict_fake_news, article["text"])
            future_bias = exec.submit(detect_bias, article["text"])
            future_reddit = exec.submit(search_reddit, article["title"])
            future_live_news = exec.submit(get_live_news, article["title"])
            future_credibility = exec.submit(credibility_score, data.url)
            future_wiki = exec.submit(search_wikipedia, article["title"])

            prediction = future_prediction.result()
            bias = future_bias.result()
            reddit_data = future_reddit.result()
            live_news = future_live_news.result()
            credibility = future_credibility.result()
            wiki_data = future_wiki.result()
        
        veracity_result = calculate_veracity(prediction, live_news, article["title"])

        # Topic-by-Topic Claims Breakdown
        claims = extract_key_claims(article["text"])
        claims_breakdown = verify_claims(claims, get_live_news, prediction)

        # Save to DB
        db_article = models.Article(
            url=data.url,
            title=article["title"],
            content=article["text"][:500],
            verdict=veracity_result["verdict"],
            realness_score=veracity_result["realness_percentage"],
            bias_label=bias["top_label"]
        )
        db.add(db_article)
        db.commit()

        return {
            "success": True,
            "title": article["title"],
            "prediction": {
                "label": veracity_result["label"],
                "score": veracity_result["score"],
                "realness_score": veracity_result["realness_percentage"],
                "verdict": veracity_result["verdict"]
            },
            "bias": bias,
            "credibility": credibility,
            "reddit_discussions": reddit_data,
            "live_news": live_news,
            "wikipedia_references": wiki_data,
            "is_old": article["is_old"],
            "age_days": article["age_days"],
            "publish_date": article["publish_date"],
            "claims_breakdown": claims_breakdown
        }
    except Exception as e:
        print(f"Error during URL analysis: {e}")
        return {"success": False, "error": str(e)}

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    return {
        "filename": file.filename,
        "message": "Image upload working"
    }

@app.delete("/history/{article_id}")
def delete_history_item(article_id: int, db: Session = Depends(get_db)):
    try:
        article = db.query(models.Article).filter(models.Article.id == article_id).first()
        if not article:
            return {"success": False, "error": "Article not found"}
        db.delete(article)
        db.commit()
        return {"success": True, "message": "Article deleted successfully"}
    except Exception as e:
        print(f"Error deleting article: {e}")
        return {"success": False, "error": str(e)}

@app.delete("/history")
def delete_all_history(db: Session = Depends(get_db)):
    try:
        db.query(models.Article).delete()
        db.commit()
        return {"success": True, "message": "All history deleted successfully"}
    except Exception as e:
        print(f"Error clearing history: {e}")
        return {"success": False, "error": str(e)}
