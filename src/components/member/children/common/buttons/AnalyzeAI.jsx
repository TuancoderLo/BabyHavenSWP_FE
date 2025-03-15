import React from 'react';
import { FaPlus } from 'react-icons/fa';
import './AnalyzeAI.css';

const AnalyzeAI = ({ 
  onClick, 
  disabled = false,
  className = '' 
}) => {
  return (
    <button
      className={`analyze-ai-button ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <FaPlus className="plus-icon" />
      Analyze with AI
    </button>
  );
};

export default AnalyzeAI;