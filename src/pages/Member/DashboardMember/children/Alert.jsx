import React, { useState } from "react";
import "./Alert.css";

const Alert = ({ alert, alerts }) => {
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

  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      {visible && (
        <div
          className={`alert-item ${getSeverityClass(alert?.severityLevel)} ${additionalClass}`}
        >
          <span className="alert-icon">{alertIcon}</span>
          <div className="alert-message">
            <p>{alertMessage}</p>
          </div>
          {hasAlert ? (
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
          ) : (
            <button className="alert-see-more" onClick={openOverlay}>
              View Alert History
            </button>
          )}
        </div>
      )}

      {expanded && (
        <div className="modal-overlay" onClick={closeOverlay}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeOverlay}>
              ×
            </button>
            <h2>{hasAlert ? "Alert Details" : "Alert History"}</h2>
            {hasAlert ? (
              <>
                <p><strong>Message:</strong> {alert?.message || "No additional details available."}</p>
                <p><strong>Date:</strong> {alert?.alertDate ? formatDate(alert.alertDate) : "N/A"}</p>
                <h3>All Alerts</h3>
                {alerts && alerts.length > 0 ? (
                  <ul className="alert-history-list">
                    {alerts.map((item, index) => (
                      <li key={index} className={`alert-history-item ${getSeverityClass(item.severityLevel)}`}>
                        <span>{formatDate(item.alertDate)} - {item.severityLevel} - {item.message}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No alert history available.</p>
                )}
              </>
            ) : (
              alerts && alerts.length > 0 ? (
                <ul className="alert-history-list">
                  {alerts.map((item, index) => (
                    <li key={index} className={`alert-history-item ${getSeverityClass(item.severityLevel)}`}>
                      <span>{formatDate(item.alertDate)} - {item.severityLevel} - {item.message}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No alert history available.</p>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Alert;