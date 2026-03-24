"""Scrapers for Hacker News and RSS feeds."""

import logging
from datetime import datetime

import feedparser
import httpx

logger = logging.getLogger(__name__)

HN_TOP_URL = "https://hacker-news.firebaseio.com/v0/topstories.json"
HN_ITEM_URL = "https://hacker-news.firebaseio.com/v0/item/{}.json"

RSS_FEEDS = [
    {"name": "Simon Willison", "url": "https://simonwillison.net/atom/everything/", "type": "rss"},
    {"name": "TLDR AI", "url": "https://tldr.tech/ai/rss", "type": "rss"},
    {"name": "Latent Space", "url": "https://www.latent.space/feed", "type": "rss"},
]


async def scrape_hn(limit: int = 30) -> list[dict]:
    """Fetch top stories from Hacker News API."""
    articles = []
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(HN_TOP_URL)
            resp.raise_for_status()
            story_ids = resp.json()[:limit]
        except httpx.HTTPError as e:
            logger.error("Failed to fetch HN top stories: %s", e)
            return []

        for story_id in story_ids:
            try:
                item_resp = await client.get(HN_ITEM_URL.format(story_id))
                item_resp.raise_for_status()
                item = item_resp.json()
                if not item or item.get("type") != "story":
                    continue
                url = item.get("url", f"https://news.ycombinator.com/item?id={story_id}")
                articles.append({
                    "title": item.get("title", ""),
                    "url": url,
                    "summary": f"HN score: {item.get('score', 0)} | {item.get('descendants', 0)} comments",
                    "source_name": "Hacker News",
                    "scraped_at": datetime.utcnow(),
                })
            except httpx.HTTPError as e:
                logger.warning("Failed to fetch HN item %s: %s", story_id, e)
                continue

    return articles


async def scrape_rss(feed_name: str, feed_url: str, limit: int = 20) -> list[dict]:
    """Fetch articles from an RSS/Atom feed."""
    articles = []
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        try:
            resp = await client.get(feed_url)
            resp.raise_for_status()
        except httpx.HTTPError as e:
            logger.error("Failed to fetch RSS feed %s: %s", feed_name, e)
            return []

    feed = feedparser.parse(resp.text)
    for entry in feed.entries[:limit]:
        articles.append({
            "title": entry.get("title", ""),
            "url": entry.get("link", ""),
            "summary": entry.get("summary", "")[:500] if entry.get("summary") else None,
            "source_name": feed_name,
            "scraped_at": datetime.utcnow(),
        })

    return articles


async def scrape_all_rss() -> list[dict]:
    """Scrape all configured RSS feeds."""
    all_articles = []
    for feed in RSS_FEEDS:
        articles = await scrape_rss(feed["name"], feed["url"])
        all_articles.extend(articles)
    return all_articles


async def scrape_all(hn_enabled: bool = True) -> list[dict]:
    """Run all scrapers and return combined articles."""
    all_articles = []
    if hn_enabled:
        hn_articles = await scrape_hn()
        all_articles.extend(hn_articles)
        logger.info("Scraped %d articles from HN", len(hn_articles))

    rss_articles = await scrape_all_rss()
    all_articles.extend(rss_articles)
    logger.info("Scraped %d articles from RSS feeds", len(rss_articles))

    return all_articles
