import PropTypes from 'prop-types';
import ActionList from './ActionList.jsx';
import SentimentPill from './SentimentPill.jsx';
import TickerChips from './TickerChips.jsx';

function formatPublishedAt(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return 'Time unknown';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function NewsCard({ item }) {
  return (
    <article className="news-card">
      <header className="news-card__header">
        <div className="news-card__headline">
          {item.url && item.url !== '#' ? (
            <a href={item.url} target="_blank" rel="noreferrer">
              {item.headline}
            </a>
          ) : (
            item.headline
          )}
        </div>
        <SentimentPill sentiment={item.sentiment} />
      </header>

      {item.summary && <p className="news-card__summary">{item.summary}</p>}

      <TickerChips tickers={item.tickers} />

      <ActionList actions={item.actions} />

      <footer className="news-card__footer">
        <span>{item.source}</span>
        <span>{formatPublishedAt(item.publishedAt)}</span>
      </footer>
    </article>
  );
}

NewsCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    headline: PropTypes.string.isRequired,
    summary: PropTypes.string,
    tickers: PropTypes.arrayOf(PropTypes.string),
    actions: PropTypes.arrayOf(PropTypes.string),
    sentiment: PropTypes.string,
    source: PropTypes.string,
    publishedAt: PropTypes.string,
    url: PropTypes.string
  }).isRequired
};

export default NewsCard;
