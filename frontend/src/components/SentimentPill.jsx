import PropTypes from 'prop-types';

const SENTIMENT_COLORS = {
  positive: 'sentiment-pill--positive',
  negative: 'sentiment-pill--negative',
  neutral: 'sentiment-pill--neutral'
};

function SentimentPill({ sentiment }) {
  if (!sentiment) {
    return <span className="sentiment-pill sentiment-pill--neutral">Neutral</span>;
  }

  const key = sentiment.toLowerCase();
  const pillClass = SENTIMENT_COLORS[key] || SENTIMENT_COLORS.neutral;

  return (
    <span className={`sentiment-pill ${pillClass}`} aria-label={`Sentiment ${sentiment}`}>
      {sentiment}
    </span>
  );
}

SentimentPill.propTypes = {
  sentiment: PropTypes.string
};

SentimentPill.defaultProps = {
  sentiment: 'Neutral'
};

export default SentimentPill;
