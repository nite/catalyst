"""Tests for heuristic ranker (LLM ranking tested manually)."""

from openaxis.sigwire.ranker import _heuristic_rank


def test_heuristic_rank_boosts_keywords():
    articles = [
        {"title": "New open-source LLM benchmark released", "url": "https://a.com", "summary": "RAG improvements"},
        {"title": "AI will replace all jobs", "url": "https://b.com", "summary": "opinion piece"},
    ]
    scored = _heuristic_rank(articles)
    assert scored[0]["url"] == "https://a.com"
    assert scored[0]["score_overall"] > scored[1]["score_overall"]


def test_heuristic_rank_clamps_scores():
    articles = [{"title": "x", "url": "https://x.com", "summary": ""}]
    scored = _heuristic_rank(articles)
    assert 1.0 <= scored[0]["score_overall"] <= 10.0


def test_heuristic_rank_empty():
    assert _heuristic_rank([]) == []
