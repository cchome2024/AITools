"""Service helpers that expose article analysis results.

The module keeps the service layer deliberately light-weight so that the same
logic can power a REST endpoint, background job, or command line tool.  The
primary entry point is :func:`generate_ranked_results` which loads stored
articles, runs the :class:`~backend.analysis.ArticleAnalyzer`, and serialises the
ranked output as JSON.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable, List, Sequence

from .analysis import AnalysisSummary, Article, ArticleAnalyzer


def load_articles_from_json(path: Path) -> List[Article]:
    """Load articles from a JSON array stored at *path*.

    The loader accepts either a list of dictionaries (one per article) or a
    dictionary with an ``"articles"`` key.  Any records that cannot be parsed
    into an :class:`Article` object are skipped to keep the pipeline resilient to
    malformed input.
    """

    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    if isinstance(payload, dict) and "articles" in payload:
        records = payload.get("articles", [])
    else:
        records = payload

    articles: List[Article] = []
    if not isinstance(records, Sequence):
        return articles

    for item in records:
        if not isinstance(item, dict):
            continue
        article = Article.from_dict(item)
        if not article.content:
            continue
        articles.append(article)

    return articles


def analyse_articles(articles: Iterable[Article]) -> AnalysisSummary:
    """Analyse *articles* and return a rich :class:`AnalysisSummary`."""

    analyzer = ArticleAnalyzer()
    return analyzer.analyze_articles(articles)


def generate_ranked_results(path: Path, top_n: int = 10) -> str:
    """Load articles from *path* and return ranked analysis as formatted JSON."""

    articles = load_articles_from_json(path)
    summary = analyse_articles(articles)
    return json.dumps(summary.to_serializable(top_n=top_n), indent=2)


def main(default_path: str = "data/articles.json", top_n: int = 10) -> None:
    """CLI entry point used for manual validation or cron jobs."""

    path = Path(default_path)
    if not path.exists():
        raise FileNotFoundError(f"Could not locate article store: {path}")

    print(generate_ranked_results(path, top_n=top_n))


if __name__ == "__main__":
    main()
