import React from 'react';
import { FaPlus } from 'react-icons/fa';
import './AddRecord.css';

const Confirm = ({ 
  onClick, 
  disabled = false,
  className = '' 
}) => {
  return (
    <button
      className={`confirm-button ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <FaPlus className="plus-icon" />
      Add Record
    </button>
  );
};

export default Confirm;