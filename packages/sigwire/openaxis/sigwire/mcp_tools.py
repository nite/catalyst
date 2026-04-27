"""MCP tools and resources for SigWire.

Registers get_top_articles, search_articles tools and the
openaxis://sigwire/trending resource.  Requires openaxis-core to be
installed (pip install openaxis-sigwire[mcp]). When core is absent the
decorators become no-ops and the tools are simply not exposed.
"""

import logging

from sqlalchemy import desc, func, or_, select

from openaxis.sigwire.db import async_session
from openaxis.sigwire.models import Article

logger = logging.getLogger(__name__)

try:
    from openaxis.core.mcp.decorators import mcp_resource, mcp_tool
except ImportError:  # pragma: no cover
    logger.warning("openaxis-core not installed — MCP tools disabled")

    def mcp_tool(*args, **kwargs):  # type: ignore[misc]
        def decorator(func):
            return func

        return decorator

    def mcp_resource(*args, **kwargs):  # type: ignore[misc]
        def decorator(func):
            return func

        return decorator


@mcp_tool(name="get_top_articles", description="Returns top-ranked AI/tech articles from SigWire")
async def get_top_articles(limit: int = 10, min_score: float = 0.0) -> list:
    """Return the highest-scoring articles from the SigWire database.

    Args:
        limit: Maximum number of articles to return (default 10).
        min_score: Only return articles with score_overall >= this value.
    """
    async with async_session() as session:
        stmt = (
            select(Article)
            .where(Article.score_overall >= min_score)
            .order_by(desc(Article.score_overall))
            .limit(limit)
        )
        result = await session.execute(stmt)
        articles = result.scalars().all()
        return [
            {
                "id": a.id,
                "title": a.title,
                "url": a.url,
                "score_overall": a.score_overall,
                "score_technical": a.score_technical,
                "score_market": a.score_market,
                "score_novelty": a.score_novelty,
                "rationale": a.llm_rationale,
                "summary": a.summary,
                "is_internal": a.is_internal,
            }
            for a in articles
        ]


@mcp_tool(name="search_articles", description="Search SigWire articles by keyword")
async def search_articles(query: str, limit: int = 20) -> list:
    """Full-text keyword search across article titles and summaries.

    Args:
        query: Keyword or phrase to search for.
        limit: Maximum number of results (default 20).
    """
    async with async_session() as session:
        pattern = f"%{query}%"
        stmt = (
            select(Article)
            .where(
                or_(
                    func.lower(Article.title).like(pattern.lower()),
                    func.lower(Article.summary).like(pattern.lower()),
                )
            )
            .order_by(desc(Article.score_overall))
            .limit(limit)
        )
        result = await session.execute(stmt)
        articles = result.scalars().all()
        return [
            {
                "id": a.id,
                "title": a.title,
                "url": a.url,
                "score_overall": a.score_overall,
                "summary": a.summary,
            }
            for a in articles
        ]


@mcp_resource("openaxis://sigwire/trending")
async def trending_articles():
    """Returns today's top 10 articles as an MCP resource."""
    return await get_top_articles(limit=10, min_score=0.0)
