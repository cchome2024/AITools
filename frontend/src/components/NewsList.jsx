import PropTypes from 'prop-types';
import NewsCard from './NewsCard.jsx';

function NewsList({ items, loading }) {
  if (!loading && items.length === 0) {
    return (
      <div className="news-list news-list--empty">
        <p>No headlines available. Try refreshing the feed.</p>
      </div>
    );
  }

  return (
    <div className="news-list">
      {items.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}
      {loading && items.length === 0 && (
        <div className="news-card news-card--skeleton" aria-hidden="true">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--body" />
          <div className="skeleton skeleton--body" />
        </div>
      )}
    </div>
  );
}

NewsList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool
};

NewsList.defaultProps = {
  loading: false
};

export default NewsList;
