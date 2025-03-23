import React from 'react';
import { FaPlus } from 'react-icons/fa';
import './AddMilestone.css';

const AddMilestone = ({ 
  onClick, 
  disabled = false,
  className = '' 
}) => {
  return (
    <button
      className={`add-milestone-button ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <FaPlus className="icon" />
      Add Milestone
    </button>
  );
};

export default AddMilestone;