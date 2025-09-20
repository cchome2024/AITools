import PropTypes from 'prop-types';

function RefreshButton({ onClick, loading }) {
  return (
    <button type="button" className="refresh-button" onClick={onClick} disabled={loading}>
      {loading ? 'Refreshing…' : 'Refresh feed'}
    </button>
  );
}

RefreshButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

RefreshButton.defaultProps = {
  loading: false
};

export default RefreshButton;
