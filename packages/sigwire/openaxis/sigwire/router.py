"""API routes for SigWire."""

import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc, func, or_, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from openaxis.sigwire.db import get_session
from openaxis.sigwire.models import Article, Source, BlogPost
from openaxis.sigwire.scraper import scrape_all
from openaxis.sigwire.ranker import rank_articles
from openaxis.sigwire.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


# --- Schemas ---

class ArticleOut(BaseModel):
    id: int
    title: str
    url: str
    summary: str | None = None
    score_technical: float | None = None
    score_market: float | None = None
    score_novelty: float | None = None
    score_overall: float | None = None
    llm_rationale: str | None = None
    source_name: str | None = None
    scraped_at: datetime | None = None
    is_internal: bool = False

    model_config = {"from_attributes": True}


class BlogPostCreate(BaseModel):
    title: str
    content: str | None = None
    external_url: str | None = None
    tags: str | None = None


class BlogPostOut(BaseModel):
    id: int
    title: str
    content: str | None = None
    external_url: str | None = None
    tags: str | None = None
    is_published: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class HealthResponse(BaseModel):
    status: str
    node: str
    version: str


# --- Health ---

@router.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok", node="sigwire", version="0.1.0")


# --- Articles ---

@router.get("/articles", response_model=list[ArticleOut])
async def list_articles(
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    min_score: float = Query(default=0.0),
    session: AsyncSession = Depends(get_session),
):
    """Return ranked articles, highest score first."""
    stmt = (
        select(Article)
        .options(selectinload(Article.source))
        .where(Article.score_overall >= min_score)
        .order_by(desc(Article.score_overall))
        .offset(offset)
        .limit(limit)
    )
    result = await session.execute(stmt)
    articles = result.scalars().all()

    out = []
    for a in articles:
        source_name = None
        if a.source_id and a.source:
            source_name = a.source.name
        out.append(ArticleOut(
            id=a.id,
            title=a.title,
            url=a.url,
            summary=a.summary,
            score_technical=a.score_technical,
            score_market=a.score_market,
            score_novelty=a.score_novelty,
            score_overall=a.score_overall,
            llm_rationale=a.llm_rationale,
            source_name=source_name,
            scraped_at=a.scraped_at,
            is_internal=a.is_internal,
        ))
    return out


@router.get("/articles/search", response_model=list[ArticleOut])
async def search_articles(
    q: str = Query(min_length=1),
    limit: int = Query(default=20, le=100),
    session: AsyncSession = Depends(get_session),
):
    """Keyword search across article titles and summaries."""
    pattern = f"%{q.lower()}%"
    stmt = (
        select(Article)
        .options(selectinload(Article.source))
        .where(
            or_(
                func.lower(Article.title).like(pattern),
                func.lower(Article.summary).like(pattern),
            )
        )
        .order_by(desc(Article.score_overall))
        .limit(limit)
    )
    result = await session.execute(stmt)
    articles = result.scalars().all()
    out = []
    for a in articles:
        source_name = a.source.name if (a.source_id and a.source) else None
        out.append(ArticleOut(
            id=a.id, title=a.title, url=a.url, summary=a.summary,
            score_technical=a.score_technical, score_market=a.score_market,
            score_novelty=a.score_novelty, score_overall=a.score_overall,
            llm_rationale=a.llm_rationale, source_name=source_name,
            scraped_at=a.scraped_at, is_internal=a.is_internal,
        ))
    return out


@router.get("/articles/{article_id}", response_model=ArticleOut)
async def get_article(article_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Article).options(selectinload(Article.source)).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleOut.model_validate(article)


# --- Scrape + Rank ---

@router.post("/scrape")
async def trigger_scrape(session: AsyncSession = Depends(get_session)):
    """Manually trigger a scrape + rank cycle."""
    raw_articles = await scrape_all(hn_enabled=settings.hn_enabled)

    if not raw_articles:
        return {"message": "No articles scraped", "count": 0}

    # Deduplicate against existing URLs
    existing_urls_result = await session.execute(select(Article.url))
    existing_urls = {row[0] for row in existing_urls_result.all()}
    new_articles = [a for a in raw_articles if a["url"] not in existing_urls]

    if not new_articles:
        return {"message": "No new articles found", "count": 0}

    # Ensure sources exist
    source_cache = {}
    for a in new_articles:
        sname = a["source_name"]
        if sname not in source_cache:
            result = await session.execute(select(Source).where(Source.name == sname))
            source = result.scalar_one_or_none()
            if not source:
                source = Source(
                    name=sname,
                    url=a["url"],
                    scraper_type="hn" if sname == "Hacker News" else "rss",
                )
                session.add(source)
                await session.flush()
            source_cache[sname] = source

    # Rank with LLM
    scored = await rank_articles(new_articles)
    scored_map = {s["url"]: s for s in scored}

    saved = 0
    for a in new_articles:
        scores = scored_map.get(a["url"], {})
        source = source_cache.get(a["source_name"])
        article = Article(
            source_id=source.id if source else None,
            title=a["title"],
            url=a["url"],
            summary=a.get("summary"),
            score_technical=scores.get("score_technical"),
            score_market=scores.get("score_market"),
            score_novelty=scores.get("score_novelty"),
            score_overall=scores.get("score_overall"),
            llm_rationale=scores.get("rationale"),
            scraped_at=a.get("scraped_at", datetime.utcnow()),
        )
        session.add(article)
        saved += 1

    await session.commit()
    logger.info("Saved %d new articles", saved)
    return {"message": f"Scraped and ranked {saved} new articles", "count": saved}


# --- Blog ---

@router.get("/blog", response_model=list[BlogPostOut])
async def list_blog_posts(
    limit: int = Query(default=20, le=100),
    session: AsyncSession = Depends(get_session),
):
    stmt = (
        select(BlogPost)
        .where(BlogPost.is_published.is_(True))
        .order_by(desc(BlogPost.created_at))
        .limit(limit)
    )
    result = await session.execute(stmt)
    return result.scalars().all()


@router.post("/blog", response_model=BlogPostOut)
async def create_blog_post(
    payload: BlogPostCreate,
    session: AsyncSession = Depends(get_session),
):
    post = BlogPost(
        title=payload.title,
        content=payload.content,
        external_url=payload.external_url,
        tags=payload.tags,
        is_published=True,
    )
    session.add(post)
    await session.commit()
    await session.refresh(post)
    return post
