"""Utilities for ingesting U.S. financial news articles.

This module provides a small service object that downloads news content from
an external provider, filters the results for U.S. market related topics, and
persists a cleaned subset of the articles into a local SQLite cache. The cache
is intended to support same-day lookups so that subsequent requests do not need
re-fetch news that was already seen earlier in the day.

Example
-------
    >>> from backend.news_ingestion import NewsIngestionService
    >>> service = NewsIngestionService()
    >>> articles = service.fetch_and_store()
    >>> print(f"Stored {len(articles)} new articles")

The code uses the NewsAPI schema by default, but it can be adapted to other
providers (Finnhub, etc.) by adjusting :attr:`NewsIngestionService.api_url` and
by tweaking :meth:`NewsIngestionService._normalize_article` accordingly.
"""

from __future__ import annotations

import os
import sqlite3
from dataclasses import dataclass
from datetime import UTC, datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import requests
from dotenv import load_dotenv

load_dotenv()

DEFAULT_API_URL = "https://newsapi.org/v2/everything"
US_MARKET_KEYWORDS = {
    "u.s.",
    "us",
    "united states",
    "american",
    "dow",
    "s&p",
    "nasdaq",
    "wall street",
    "stock",
    "stocks",
    "equities",
    "market",
    "markets",
    "treasury",
    "federal reserve",
}


@dataclass
class Article:
    """Normalized representation of a news article."""

    timestamp: str
    headline: str
    summary: str
    url: str
    source: str


class NewsIngestionService:
    """Fetch, filter, normalize, and store financial news articles.

    Parameters
    ----------
    api_key:
        API key for the upstream provider. When omitted, the value is read from
        the ``NEWSAPI_API_KEY`` environment variable (loaded via ``python-dotenv``
        when available).
    api_url:
        Base URL of the provider endpoint. By default this is the NewsAPI
        ``/v2/everything`` endpoint, but any API returning a list of articles
        with similar fields can be used.
    db_path:
        Location of the SQLite database that caches the normalized articles.
    page_size:
        Amount of articles to request per API call.
    http_timeout:
        Timeout, in seconds, for HTTP requests.
    """

    def __init__(
        self,
        *,
        api_key: Optional[str] = None,
        api_url: str = DEFAULT_API_URL,
        db_path: str | os.PathLike[str] = "data/news_cache.db",
        page_size: int = 50,
        http_timeout: int = 10,
    ) -> None:
        self.api_key = api_key or os.getenv("NEWSAPI_API_KEY")
        self.api_url = api_url
        self.page_size = page_size
        self.http_timeout = http_timeout

        if not self.api_key:
            raise RuntimeError(
                "NEWSAPI_API_KEY is not configured. Create a .env file or set the "
                "environment variable before instantiating NewsIngestionService."
            )

        self._session = requests.Session()
        self._db_path = Path(db_path)
        self._ensure_database()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def fetch_and_store(self) -> List[Article]:
        """Fetch articles from the API, filter, normalize, and persist them.

        Returns
        -------
        list[Article]
            Normalized articles that were inserted (or already present) in the
            SQLite cache for the current day.
        """

        raw_articles = self._fetch_articles()
        filtered = [
            self._normalize_article(article)
            for article in raw_articles
            if self._is_us_market_related(article)
        ]

        normalized = [article for article in filtered if article is not None]

        if not normalized:
            return []

        with sqlite3.connect(self._db_path) as conn:
            conn.row_factory = sqlite3.Row
            self._cleanup_old_articles(conn)
            for article in normalized:
                self._upsert_article(conn, article)

        return normalized

    def get_articles_for_day(self, day: Optional[datetime] = None) -> List[Article]:
        """Return articles from the local cache for the specified date.

        Parameters
        ----------
        day:
            Date to query. When ``None`` (default) the function returns articles
            for the current day in UTC.
        """

        target_date = (day or datetime.now(UTC)).date().isoformat()
        with sqlite3.connect(self._db_path) as conn:
            cursor = conn.execute(
                """
                SELECT published_at, headline, summary, url, source
                  FROM articles
                 WHERE published_date = ?
                 ORDER BY published_at DESC
                """,
                (target_date,),
            )
            rows = cursor.fetchall()

        return [
            Article(
                timestamp=row["published_at"],
                headline=row["headline"],
                summary=row["summary"],
                url=row["url"],
                source=row["source"],
            )
            for row in rows
        ]

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _fetch_articles(self) -> List[Dict[str, Any]]:
        """Call the upstream API and return the raw article payload."""

        query = (
            "(\"United States\" OR U.S. OR US) AND "
            "(stock OR stocks OR market OR markets OR \"Federal Reserve\" OR "
            "equities OR \"Wall Street\")"
        )
        params = {
            "q": query,
            "language": "en",
            "sortBy": "publishedAt",
            "pageSize": self.page_size,
        }
        headers = {"X-Api-Key": self.api_key}

        response = self._session.get(
            self.api_url, params=params, headers=headers, timeout=self.http_timeout
        )
        response.raise_for_status()
        payload = response.json()

        articles = payload.get("articles")
        if not isinstance(articles, Iterable):
            raise RuntimeError("Unexpected payload format from news API")

        return list(articles)

    def _is_us_market_related(self, article: Dict[str, Any]) -> bool:
        """Return ``True`` when an article references the U.S. market."""

        text_fragments = [
            str(article.get("title") or ""),
            str(article.get("description") or ""),
            str(article.get("content") or ""),
            str((article.get("source") or {}).get("name") or ""),
        ]
        haystack = " ".join(text_fragments).lower()

        return any(keyword in haystack for keyword in US_MARKET_KEYWORDS)

    def _normalize_article(self, article: Dict[str, Any]) -> Optional[Article]:
        """Normalize an article dictionary into an :class:`Article`.

        Articles not published on the current UTC day are dropped to keep the
        cache focused on same-day access.
        """

        raw_timestamp: Optional[str | int | float] = (
            article.get("publishedAt")
            or article.get("datetime")
            or article.get("published_at")
        )
        timestamp = self._coerce_timestamp(raw_timestamp)
        if timestamp is None:
            return None

        published_date = datetime.fromisoformat(timestamp).date()
        if published_date != datetime.now(UTC).date():
            return None

        headline = str(article.get("title") or article.get("headline") or "").strip()
        summary = str(article.get("description") or article.get("summary") or "").strip()
        url = str(article.get("url") or article.get("link") or "").strip()
        source = str((article.get("source") or {}).get("name") or "").strip()

        if not headline or not url:
            return None

        return Article(
            timestamp=timestamp,
            headline=headline,
            summary=summary,
            url=url,
            source=source,
        )

    def _coerce_timestamp(self, raw: Optional[str | int | float]) -> Optional[str]:
        """Convert raw timestamp formats to an ISO-8601 string in UTC."""

        if raw is None:
            return None

        if isinstance(raw, (int, float)):
            dt = datetime.fromtimestamp(float(raw), tz=UTC)
            return dt.isoformat()

        if isinstance(raw, str):
            cleaned = raw.strip()
            if not cleaned:
                return None

            for fmt in ("%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d %H:%M:%S"):
                try:
                    dt = datetime.strptime(cleaned, fmt).replace(tzinfo=UTC)
                    return dt.isoformat()
                except ValueError:
                    continue

            try:
                # Support offsets such as "+00:00" or fractional seconds.
                dt = datetime.fromisoformat(
                    cleaned.replace("Z", "+00:00")
                )
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt.astimezone(UTC).isoformat()
            except ValueError:
                return None

        return None

    def _ensure_database(self) -> None:
        """Create the SQLite database and table when necessary."""

        if self._db_path.parent != Path(""):
            self._db_path.parent.mkdir(parents=True, exist_ok=True)

        with sqlite3.connect(self._db_path) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS articles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    published_date TEXT NOT NULL,
                    published_at TEXT NOT NULL,
                    headline TEXT NOT NULL,
                    summary TEXT,
                    url TEXT NOT NULL UNIQUE,
                    source TEXT,
                    inserted_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
                )
                """
            )

    def _cleanup_old_articles(self, conn: sqlite3.Connection) -> None:
        """Remove cached articles that are older than the current day."""

        today = datetime.now(UTC).date().isoformat()
        conn.execute("DELETE FROM articles WHERE published_date < ?", (today,))

    def _upsert_article(self, conn: sqlite3.Connection, article: Article) -> None:
        """Insert the article into the database if it is not already cached."""

        conn.execute(
            """
            INSERT OR IGNORE INTO articles (
                published_date,
                published_at,
                headline,
                summary,
                url,
                source
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                datetime.fromisoformat(article.timestamp).date().isoformat(),
                article.timestamp,
                article.headline,
                article.summary,
                article.url,
                article.source,
            ),
        )


def _demo() -> None:
    """Minimal command line demonstration."""

    try:
        service = NewsIngestionService()
    except RuntimeError as exc:  # pragma: no cover - helper for manual runs
        print(exc)
        return

    try:
        articles = service.fetch_and_store()
    except requests.HTTPError as exc:  # pragma: no cover
        print(f"HTTP error while contacting the news API: {exc}")
        return

    print(f"Cached {len(articles)} article(s) for today.")
    for article in articles:
        print(f"- {article.headline} ({article.source})")


if __name__ == "__main__":  # pragma: no cover - manual execution helper
    _demo()
