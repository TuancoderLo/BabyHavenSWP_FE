import React from "react";
import PropTypes from "prop-types";
import "./CompareChildPopup.css";

const CompareChildPopup = ({ childrenList, selectedChild, onSelect, onClose }) => {
  const availableChildren = childrenList.filter(
    (child) => child.name !== selectedChild?.name
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="compare-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="compare-modal-header">
          <h3>Select a Child to Compare</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="compare-modal-body">
          {availableChildren.length > 0 ? (
            <ul className="compare-child-list">
              {availableChildren.map((child) => (
                <li
                  key={child.name}
                  className="compare-child-item"
                  onClick={() => onSelect(child)}
                >
                  {child.name} ({calculateAge(child.dateOfBirth)})
                </li>
              ))}
            </ul>
          ) : (
            <p>No other children available to compare.</p>
          )}
        </div>
        <div className="compare-modal-footer">
          <button className="compare-modal-button cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return "0 days";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    const diffTime = Math.abs(today - birthDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years === 0 && months === 0) return `${diffDays} days`;
    if (years < 1) return `${months} months`;
    return `${years} years`;
  }
};

CompareChildPopup.propTypes = {
  childrenList: PropTypes.array.isRequired,
  selectedChild: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CompareChildPopup;