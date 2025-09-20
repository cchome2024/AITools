import PropTypes from 'prop-types';

function TickerChips({ tickers }) {
  if (!tickers || tickers.length === 0) {
    return null;
  }

  return (
    <div className="ticker-chips" aria-label="Impacted tickers">
      {tickers.map((ticker) => (
        <span key={ticker} className="ticker-chips__chip">
          {ticker}
        </span>
      ))}
    </div>
  );
}

TickerChips.propTypes = {
  tickers: PropTypes.arrayOf(PropTypes.string)
};

TickerChips.defaultProps = {
  tickers: []
};

export default TickerChips;
