import React from "react";
import "./TruncatedAlertList.css";

export default function TruncatedAlertList({ alerts, limit = 80 }) {
  // Hàm cắt ngắn chuỗi
  const truncate = (text) => {
    if (!text) return "";
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  if (!alerts || alerts.length === 0) {
    return <div className="health-alert-content healthy">Your child's health is in good condition</div>;
  }

  return (
    <div className="truncated-alert-list">
      {alerts.map((alert) => (
        <div key={alert.alertId} className={`health-alert-content fadeable`}>
          <p>{truncate(alert.message)}</p>
        </div>
      ))}
      {/* Lớp fade-overlay chung, che phần cuối */}
      <div className="fade-overlay-list"></div>
    </div>
  );
}
