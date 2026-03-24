"""LLM-based article ranking using Anthropic Claude."""

import json
import logging

import anthropic

from openaxis.sigwire.config import settings

logger = logging.getLogger(__name__)

RANKING_PROMPT = """You are a senior AI/software engineer and financial analyst. Score each article 1-10 on three dimensions:

1. Technical Depth — does it contain implementation details, code, or architecture?
2. Market Impact — could this move a stock, sector, or funding round?
3. Novelty — is this genuinely new information vs. rehashed takes?

Weighting rules:
- 2x weight if the article mentions: latency optimization, RAG, agentic workflows,
  fine-tuning, token economics, regulatory changes, or open-source model releases
- 0.5x weight if the article is purely about AI company valuations or
  "AI will replace X" opinion pieces with no technical substance

Return ONLY valid JSON array:
[{"title": "...", "url": "...", "score_technical": N, "score_market": N,
  "score_novelty": N, "score_overall": N, "rationale": "..."}]"""


async def rank_articles(articles: list[dict]) -> list[dict]:
    """Score a batch of articles using Claude.

    Falls back to heuristic scoring if no API key is configured.
    """
    if not articles:
        return []

    if not settings.llm_api_key:
        logger.warning("No LLM_API_KEY set — using heuristic scoring")
        return _heuristic_rank(articles)

    article_text = "\n".join(
        f"- Title: {a['title']}\n  URL: {a['url']}\n  Summary: {a.get('summary', 'N/A')}"
        for a in articles
    )

    try:
        client = anthropic.AsyncAnthropic(api_key=settings.llm_api_key)
        message = await client.messages.create(
            model=settings.llm_model,
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": f"{RANKING_PROMPT}\n\nArticles to score:\n{article_text}",
                }
            ],
        )
        response_text = message.content[0].text
        scored = json.loads(response_text)
        return scored
    except (json.JSONDecodeError, anthropic.APIError, KeyError, IndexError) as e:
        logger.error("LLM ranking failed: %s — falling back to heuristic", e)
        return _heuristic_rank(articles)


def _heuristic_rank(articles: list[dict]) -> list[dict]:
    """Simple keyword-based scoring when LLM is unavailable."""
    boost_keywords = [
        "rag", "agentic", "fine-tun", "token", "open-source", "open source",
        "regulatory", "latency", "benchmark", "model release", "llm", "gpu",
    ]
    penalize_keywords = [
        "will replace", "valuation", "funding round only", "opinion",
    ]

    scored = []
    for article in articles:
        text = f"{article['title']} {article.get('summary', '')}".lower()

        base = 5.0
        for kw in boost_keywords:
            if kw in text:
                base += 0.5
        for kw in penalize_keywords:
            if kw in text:
                base -= 0.5
        base = max(1.0, min(10.0, base))

        scored.append({
            "title": article["title"],
            "url": article["url"],
            "score_technical": round(base, 1),
            "score_market": round(base * 0.8, 1),
            "score_novelty": round(base * 0.9, 1),
            "score_overall": round(base, 1),
            "rationale": "Heuristic scoring (no LLM API key configured)",
        })

    scored.sort(key=lambda x: x["score_overall"], reverse=True)
    return scored
