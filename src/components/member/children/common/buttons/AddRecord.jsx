import React from 'react';
import { FaPlus } from 'react-icons/fa';
import './AddRecord.css';

const AddRecord = ({ 
  onClick, 
  disabled = false,
  className = '' 
}) => {
  return (
    <button
      type="button"
      className={`add-record-button ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <FaPlus className="plus-icon" />
      Add Record
    </button>
  );
};

export default AddRecord;