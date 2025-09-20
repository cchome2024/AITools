import PropTypes from 'prop-types';

function PaginationControls({ page, totalPages, onPageChange }) {
  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination__button"
        onClick={() => onPageChange('prev')}
        disabled={page === 0}
      >
        ← Previous
      </button>
      <span className="pagination__status">
        Page {page + 1} of {totalPages}
      </span>
      <button
        type="button"
        className="pagination__button"
        onClick={() => onPageChange('next')}
        disabled={page >= totalPages - 1}
      >
        Next →
      </button>
    </div>
  );
}

PaginationControls.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired
};

export default PaginationControls;
