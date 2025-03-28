import React, { useState } from "react";
import "./Alert.css";

const Alert = ({ alert }) => {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);

  const openOverlay = () => setExpanded(true);
  const closeOverlay = () => setExpanded(false);
  const closeAlert = () => setVisible(false);

  // Thông điệp tích cực khi không có alert
  const goodConditionMessage = "Your child's health is in great condition! Keep up the amazing care!";

  // Xác định có alert hay không
  const hasAlert = !!alert;

  // Determine CSS class based on severityLevel
  function getSeverityClass(level) {
    if (!hasAlert) return "healthy"; // Nếu không có alert, luôn dùng class "healthy"
    switch (level?.toLowerCase()) {
      case "low":
        return "healthy";
      case "medium":
        return "warning";
      case "high":
        return "danger";
      default:
        return "healthy";
    }
  }

  // Apply fadeable class for medium or high severity
  const additionalClass = hasAlert && ["medium", "high"].includes(alert?.severityLevel?.toLowerCase())
    ? "fadeable"
    : "";

  // Xác định icon và thông điệp dựa trên việc có alert hay không
  const alertIcon = hasAlert
    ? alert.severityLevel?.toLowerCase() === "high"
      ? "🚨"
      : "🔔"
    : "🌟"; // Icon tích cực khi không có alert
  const alertMessage = hasAlert
    ? `Your child's health has a ${alert.severityLevel} level alert`
    : goodConditionMessage;

  return (
    <>
      <div
        className={`alert-item ${getSeverityClass(alert?.severityLevel)} ${additionalClass}`}
      >
        <span className="alert-icon">{alertIcon}</span>
        <div className="alert-message">
          <p>{alertMessage}</p>
        </div>
        {hasAlert && (
          <>
            <button className="alert-see-more" onClick={openOverlay}>
              See More
            </button>
            <button
              className="alert-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                closeAlert();
              }}
            >
              ×
            </button>
          </>
        )}
      </div>

      {expanded && hasAlert && (
        <div className="modal-overlay" onClick={closeOverlay}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeOverlay}>
              ×
            </button>
            <h2>Alert Details</h2>
            <p>{alert?.message || "No additional details available."}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Alert;