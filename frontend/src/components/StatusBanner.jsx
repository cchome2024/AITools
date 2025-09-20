import PropTypes from 'prop-types';

function StatusBanner({ loading, error }) {
  if (!loading && !error) {
    return null;
  }

  return (
    <div
      className={`status-banner ${error ? 'status-banner--warning' : 'status-banner--info'}`}
      role="status"
      aria-live="polite"
    >
      {loading && <span>Loading latest headlines…</span>}
      {error && <span>{error}</span>}
    </div>
  );
}

StatusBanner.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.string
};

StatusBanner.defaultProps = {
  loading: false,
  error: ''
};

export default StatusBanner;
