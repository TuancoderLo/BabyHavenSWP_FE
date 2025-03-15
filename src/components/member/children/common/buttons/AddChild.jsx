import React from 'react';
import { FaPlus } from 'react-icons/fa';
import './AddChild.css';

const AddChild = ({ 
  onClick, 
  disabled = false,
  className = '' 
}) => {
  return (
    <button
      type="button"
      className={`add-child-button ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <FaPlus className="add-child-icon" />
      Add Child
    </button>
  );
};

export default AddChild;