"""Database models for SigWire."""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text, ForeignKey
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    scraper_type = Column(String, nullable=False)  # "hn", "rss"
    active = Column(Boolean, default=True)
    last_scraped = Column(DateTime, nullable=True)

    articles = relationship("Article", back_populates="source")


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False, unique=True)
    summary = Column(Text, nullable=True)
    score_technical = Column(Float, nullable=True)
    score_market = Column(Float, nullable=True)
    score_novelty = Column(Float, nullable=True)
    score_overall = Column(Float, nullable=True)
    llm_rationale = Column(Text, nullable=True)
    scraped_at = Column(DateTime, default=datetime.utcnow)
    is_internal = Column(Boolean, default=False)

    source = relationship("Source", back_populates="articles")


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    external_url = Column(String, nullable=True)
    tags = Column(String, nullable=True)  # comma-separated for SQLite compat
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
