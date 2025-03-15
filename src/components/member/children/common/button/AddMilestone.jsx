import React from 'react';
import { FaFlag } from 'react-icons/fa';
import './AddMilestone.css';

const AddMilestone = ({ 
  onClick, 
  disabled = false,
  className = '' 
}) => {
  return (
    <button
      type="button"
      className={`add-milestone-button ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <FaFlag className="milestone-icon" />
      Add Milestone
    </button>
  );
};

export default AddMilestone;