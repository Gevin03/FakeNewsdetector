from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
from datetime import datetime

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=True)
    content = Column(String)
    title = Column(String, nullable=True)
    verdict = Column(String)
    realness_score = Column(Float)
    bias_label = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
