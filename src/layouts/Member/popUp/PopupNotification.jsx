// PopupNotification.jsx
import React from "react";
import PropTypes from "prop-types";
import "./PopupNotification.css"; // Đảm bảo CSS đồng nhất (hoặc dùng Account.css)

const PopupNotification = ({ type, message, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-header">
          <h3 style={{ color: type === "success" ? "#28a745" : "#ff5252" }}>
            {type === "success" ? "Success" : "Error"}
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="success-modal-body">
          <p>{message}</p>
        </div>
        <div className="success-modal-footer">
          <button className="success-modal-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

PopupNotification.propTypes = {
  type: PropTypes.oneOf(["success", "error"]).isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PopupNotification;
