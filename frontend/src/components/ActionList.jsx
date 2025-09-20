import PropTypes from 'prop-types';

function ActionList({ actions }) {
  if (!actions || actions.length === 0) {
    return (
      <div className="action-list action-list--empty">
        <span>Review with coverage analyst</span>
      </div>
    );
  }

  return (
    <div className="action-list" aria-label="Recommended actions">
      {actions.map((action) => (
        <span key={action} className="action-list__pill">
          {action}
        </span>
      ))}
    </div>
  );
}

ActionList.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.string)
};

ActionList.defaultProps = {
  actions: []
};

export default ActionList;
