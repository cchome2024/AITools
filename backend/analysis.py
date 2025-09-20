"""Utilities for analysing financial news articles.

This module provides lightweight natural language processing routines to score
articles for their relevance and potential market impact.  The pipeline is
composed of three stages:

* Keyword and buzz metrics quantify how intensely an article discusses topics
  that tend to move markets.
* A rule-based sentiment analyser classifies the tone of the article using a
  configurable lexicon of positive and negative finance terms.
* Extracted ticker symbols are aggregated so that the equities most affected by
  the news can be ranked and paired with an investment suggestion.

The goal of the implementation is to offer a transparent baseline that can be
swapped out for more sophisticated services (machine-learning APIs, knowledge
bases, etc.) while still being fully deterministic and suitable for unit tests.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
import math
import re
from collections import Counter, defaultdict
from typing import Any, Dict, Iterable, List, Mapping, MutableMapping, Optional, Sequence, Tuple


_TICKER_STOPWORDS = {
    "CEO",
    "CFO",
    "GDP",
    "SEC",
    "FOMC",
    "FED",
    "EPS",
    "ETF",
    "IPO",
    "USA",
    "UK",
    "EU",
    "USD",
    "NYSE",
    "NASDAQ",
    "Dow",
}


@dataclass
class Article:
    """Represents an article pulled from storage or an external API."""

    id: str
    title: str
    content: str
    tickers: List[str] = field(default_factory=list)
    keywords: Optional[Sequence[str]] = None
    social_shares: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: Mapping[str, Any]) -> "Article":
        """Create an :class:`Article` instance from a mapping.

        The loader is intentionally forgiving and will normalise common field
        names provided by external APIs.
        """

        # Normalise identifier and content fields.
        identifier = str(data.get("id") or data.get("article_id") or data.get("uuid") or "")
        title = str(data.get("title") or data.get("headline") or "").strip()
        content = str(data.get("content") or data.get("body") or data.get("summary") or "").strip()

        # Accumulate tickers from the payload if explicitly provided.
        ticker_values: Sequence[str] = data.get("tickers") or data.get("symbols") or []  # type: ignore[assignment]
        metadata = {key: value for key, value in data.items() if key not in {"id", "article_id", "uuid", "title", "headline", "content", "body", "summary", "tickers", "symbols", "keywords", "social_shares"}}

        # Some providers embed social metrics under a nested object.
        social_shares = int(
            data.get("social_shares")
            or (data.get("social") or {}).get("shares")  # type: ignore[call-arg]
            or (data.get("engagement") or {}).get("shares")  # type: ignore[call-arg]
            or 0
        )

        keywords = data.get("keywords")  # type: ignore[assignment]

        tickers: List[str] = []
        for value in ticker_values:
            if isinstance(value, str):
                ticker = value.strip().upper()
                if ticker and ticker not in tickers:
                    tickers.append(ticker)

        return cls(
            id=identifier or data.get("url", ""),
            title=title,
            content=content,
            tickers=tickers,
            keywords=keywords,
            social_shares=social_shares,
            metadata=metadata,
        )


@dataclass
class ArticleAnalysis:
    """Detailed metrics for a single analysed article."""

    article: Article
    keyword_hits: Dict[str, int]
    keyword_score: float
    sentiment_score: float
    social_score: float
    impact_score: float
    tickers: List[str]
    recommended_action: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "article_id": self.article.id,
            "title": self.article.title,
            "tickers": self.tickers,
            "sentiment_score": round(self.sentiment_score, 3),
            "keyword_score": round(self.keyword_score, 3),
            "social_score": round(self.social_score, 3),
            "impact_score": round(self.impact_score, 3),
            "keyword_hits": self.keyword_hits,
            "recommended_action": self.recommended_action,
        }


@dataclass
class TickerImpact:
    """Aggregated impact metrics for a ticker symbol."""

    ticker: str
    impact_score: float
    avg_sentiment: float
    avg_social: float
    article_ids: List[str]
    recommended_action: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ticker": self.ticker,
            "impact_score": round(self.impact_score, 3),
            "avg_sentiment": round(self.avg_sentiment, 3),
            "avg_social": round(self.avg_social, 3),
            "articles": self.article_ids,
            "recommended_action": self.recommended_action,
        }


@dataclass
class AnalysisSummary:
    """Container for all analysis artefacts."""

    articles: List[ArticleAnalysis]
    tickers: List[TickerImpact]
    generated_at: datetime = field(default_factory=datetime.utcnow)

    def top_articles(self, top_n: int = 10) -> List[ArticleAnalysis]:
        return sorted(self.articles, key=lambda result: result.impact_score, reverse=True)[:top_n]

    def top_tickers(self, top_n: int = 10) -> List[TickerImpact]:
        return sorted(self.tickers, key=lambda ticker: abs(ticker.impact_score), reverse=True)[:top_n]

    def to_serializable(self, top_n: int = 10) -> Dict[str, Any]:
        return {
            "generated_at": self.generated_at.isoformat() + "Z",
            "top_articles": [result.to_dict() for result in self.top_articles(top_n)],
            "top_tickers": [ticker.to_dict() for ticker in self.top_tickers(top_n)],
        }


class ArticleAnalyzer:
    """Scores articles and produces investment suggestions.

    The analyser is intentionally rule-based to keep the implementation
    transparent and reproducible.  It can be extended by injecting custom
    keyword weights or sentiment lexicons.
    """

    keyword_weights: MutableMapping[str, float]
    positive_words: Sequence[str]
    negative_words: Sequence[str]
    keyword_reference_score: float
    social_reference: float

    def __init__(
        self,
        keyword_weights: Optional[Mapping[str, float]] = None,
        positive_words: Optional[Sequence[str]] = None,
        negative_words: Optional[Sequence[str]] = None,
        keyword_reference_score: float = 6.0,
        social_reference: float = 5000.0,
    ) -> None:
        self.keyword_weights = {
            "growth": 1.5,
            "earnings": 2.0,
            "revenue": 1.7,
            "guidance": 1.4,
            "merger": 2.5,
            "acquisition": 2.5,
            "regulation": 2.0,
            "downgrade": 2.2,
            "upgrade": 2.2,
            "lawsuit": 2.3,
            "partnership": 1.6,
            "buyback": 2.0,
        }
        if keyword_weights:
            for keyword, weight in keyword_weights.items():
                if weight > 0:
                    self.keyword_weights[keyword.lower()] = float(weight)

        self.positive_words = [
            "beat",
            "beats",
            "bullish",
            "exceed",
            "exceeds",
            "gain",
            "gains",
            "growth",
            "improve",
            "improves",
            "optimistic",
            "outperform",
            "positive",
            "profit",
            "rally",
            "record",
            "resilient",
            "surge",
            "upgrade",
            "upside",
            "win",
        ]
        if positive_words:
            self.positive_words = list({*self.positive_words, *[word.lower() for word in positive_words]})

        self.negative_words = [
            "bearish",
            "cut",
            "cuts",
            "decline",
            "downgrade",
            "drop",
            "drops",
            "fall",
            "falls",
            "lawsuit",
            "loss",
            "miss",
            "misses",
            "negative",
            "plunge",
            "regulation",
            "slump",
            "slowdown",
            "volatility",
            "warning",
        ]
        if negative_words:
            self.negative_words = list({*self.negative_words, *[word.lower() for word in negative_words]})

        self.keyword_reference_score = keyword_reference_score
        self.social_reference = max(social_reference, 1.0)

        self._keyword_pattern = re.compile(r"\b([a-zA-Z][a-zA-Z\-]+)\b")
        self._ticker_cash_pattern = re.compile(r"\$([A-Z]{1,5})\b")
        self._ticker_upper_pattern = re.compile(r"\b([A-Z]{2,5})\b")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def analyze_articles(self, articles: Iterable[Article]) -> AnalysisSummary:
        article_results: List[ArticleAnalysis] = []
        ticker_accumulator: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
            "impact_sum": 0.0,
            "sentiment_sum": 0.0,
            "social_sum": 0.0,
            "articles": [],
        })

        for article in articles:
            analysis = self._analyze_single_article(article)
            article_results.append(analysis)

            for ticker in analysis.tickers:
                bucket = ticker_accumulator[ticker]
                bucket["impact_sum"] += analysis.impact_score
                bucket["sentiment_sum"] += analysis.sentiment_score
                bucket["social_sum"] += analysis.social_score
                bucket["articles"].append(analysis.article.id)

        ticker_impacts: List[TickerImpact] = []
        for ticker, data in ticker_accumulator.items():
            article_count = max(len(data["articles"]), 1)
            avg_sentiment = data["sentiment_sum"] / article_count
            avg_social = data["social_sum"] / article_count
            impact_score = data["impact_sum"] / article_count
            action = self._action_from_score(avg_sentiment, impact_score, avg_social)
            ticker_impacts.append(
                TickerImpact(
                    ticker=ticker,
                    impact_score=impact_score,
                    avg_sentiment=avg_sentiment,
                    avg_social=avg_social,
                    article_ids=list(data["articles"]),
                    recommended_action=action,
                )
            )

        return AnalysisSummary(articles=article_results, tickers=ticker_impacts)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _analyze_single_article(self, article: Article) -> ArticleAnalysis:
        tickers = self._extract_tickers(article)
        keyword_score, keyword_hits = self._score_keywords(article)
        sentiment_score = self._score_sentiment(article.content)
        social_score = self._score_social(article)
        impact_score = self._combine_scores(sentiment_score, keyword_score, social_score)
        action = self._action_from_score(sentiment_score, impact_score, social_score)

        return ArticleAnalysis(
            article=article,
            keyword_hits=keyword_hits,
            keyword_score=keyword_score,
            sentiment_score=sentiment_score,
            social_score=social_score,
            impact_score=impact_score,
            tickers=tickers,
            recommended_action=action,
        )

    def _extract_tickers(self, article: Article) -> List[str]:
        tickers = {ticker for ticker in article.tickers if ticker and ticker.isupper()}

        # Extract cashtag tickers like $AAPL
        for match in self._ticker_cash_pattern.finditer(article.content):
            tickers.add(match.group(1))

        # Extract uppercase words while filtering known stop words.
        for match in self._ticker_upper_pattern.finditer(article.content):
            candidate = match.group(1)
            if candidate in _TICKER_STOPWORDS:
                continue
            if 1 < len(candidate) <= 5:
                tickers.add(candidate)

        # Metadata may contain a preferred ticker symbol.
        metadata_ticker = article.metadata.get("primary_ticker")
        if isinstance(metadata_ticker, str):
            tickers.add(metadata_ticker.upper())

        return sorted(tickers)

    def _score_keywords(self, article: Article) -> Tuple[float, Dict[str, int]]:
        if article.keywords:
            keywords = [keyword.lower() for keyword in article.keywords]
        else:
            keywords = list(self.keyword_weights.keys())

        tokens = [token.lower() for token in self._keyword_pattern.findall(article.content.lower())]
        frequencies = Counter(tokens)

        keyword_hits: Dict[str, int] = {}
        weighted_sum = 0.0
        for keyword in keywords:
            count = frequencies.get(keyword, 0)
            if count <= 0:
                continue
            keyword_hits[keyword] = count
            weight = self.keyword_weights.get(keyword, 1.0)
            weighted_sum += weight * count

        # Normalise into [0, 1]
        keyword_score = min(weighted_sum / max(self.keyword_reference_score, 1.0), 1.0)
        return keyword_score, keyword_hits

    def _score_sentiment(self, text: str) -> float:
        if not text:
            return 0.0

        tokens = [token.lower() for token in self._keyword_pattern.findall(text.lower())]
        positive = sum(1 for token in tokens if token in self.positive_words)
        negative = sum(1 for token in tokens if token in self.negative_words)
        total = positive + negative
        if total == 0:
            return 0.0
        score = (positive - negative) / total
        # Clamp to [-1, 1]
        return max(min(score, 1.0), -1.0)

    def _score_social(self, article: Article) -> float:
        shares = article.social_shares
        # Allow additional social metrics from metadata (likes, comments, etc.)
        social_meta = article.metadata.get("social") or {}
        if isinstance(social_meta, Mapping):
            shares += int(social_meta.get("likes") or 0)
            shares += 2 * int(social_meta.get("comments") or 0)
        engagement_meta = article.metadata.get("engagement") or {}
        if isinstance(engagement_meta, Mapping):
            shares += int(engagement_meta.get("retweets") or 0)
            shares += int(engagement_meta.get("mentions") or 0)

        if shares <= 0:
            return 0.0

        normalized = math.log1p(shares) / math.log1p(self.social_reference)
        return max(0.0, min(normalized, 1.0))

    def _combine_scores(self, sentiment: float, keyword: float, social: float) -> float:
        # Sentiment drives direction while keyword intensity and social buzz
        # modulate conviction.
        influence = 0.6 + 0.25 * keyword + 0.15 * social
        score = sentiment * influence
        return max(min(score, 1.0), -1.0)

    def _action_from_score(self, sentiment: float, impact: float, social: float) -> str:
        intensity = abs(impact)
        if impact >= 0.6:
            return "buy"
        if impact >= 0.25:
            return "hold"
        if impact <= -0.6:
            return "sell"
        if impact <= -0.25:
            return "watch"
        # For low conviction scenarios fall back to social buzz and sentiment
        if intensity < 0.15:
            return "watch"
        if sentiment > 0.1 and social >= 0.3:
            return "hold"
        if sentiment < -0.1 and social >= 0.3:
            return "sell"
        return "watch"
