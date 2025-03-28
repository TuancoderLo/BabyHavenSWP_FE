import React, { useState } from "react";
import "./Alert.css";
import HealthReportGenerator from "../../../../services/HealthReportGenerator";

const Alert = ({ alert, alerts, member, child, growthRecords }) => {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  const [expandedAlertIndex, setExpandedAlertIndex] = useState(null); // State để theo dõi alert nào đang mở dropdown

  const openOverlay = () => setExpanded(true);
  const closeOverlay = () => setExpanded(false);
  const closeAlert = () => setVisible(false);

  // Thông điệp tích cực khi không có alert
  const goodConditionMessage = "Your child's health is in great condition! Keep up the amazing care!";

  // Xác định có alert hay không
  const hasAlert = !!alert;

  // Determine CSS class based on severityLevel
  function getSeverityClass(level) {
    if (!hasAlert) return "healthy";
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

  // Xác định icon và thông điệp
  const alertIcon = hasAlert
    ? alert.severityLevel?.toLowerCase() === "high"
      ? "🚨"
      : "🔔"
    : "🌟";
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

  // Hàm phân tách chuỗi alert.message thành các trường
  const parseAlertMessage = (message) => {
    if (!message) return {};

    const fields = {
      alert: message.match(/^Alert: (.*?)(?=\. Date:|$)/)?.[1] || "N/A",
      diseaseType: message.match(/Disease Type: (.*?)(?=\. Symptoms:|$)/)?.[1] || "N/A",
      symptoms: message.match(/Symptoms: (.*?)(?=\. Recommended Treatment:|$)/)?.[1] || "N/A",
      recommendedTreatment: message.match(/Recommended Treatment: (.*?)(?=\. Prevention Tips:|$)/)?.[1] || "N/A",
      preventionTips: message.match(/Prevention Tips: (.*?)(?=\. Description:|$)/)?.[1] || "N/A",
      description: message.match(/Description: (.*?)(?=\. Notes:|$)/)?.[1] || "N/A",
      notes: message.match(/Notes: (.*?)(?=\. Trend Analysis:|$)/)?.[1] || "N/A",
      trendAnalysis: message.match(/Trend Analysis: (.*)/)?.[1] || "N/A",
    };

    return fields;
  };

  // Hàm export PDF với alert và record mới nhất
  const exportToPDF = () => {
    const latestGrowthRecord = growthRecords && growthRecords.length > 0
      ? growthRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
      : null;

    const report = new HealthReportGenerator(member, child, alert, latestGrowthRecord);
    report.generatePDF();
  };

  // Hàm toggle dropdown cho alert
  const toggleAlertDetails = (index) => {
    setExpandedAlertIndex(expandedAlertIndex === index ? null : index);
  };

  // Sắp xếp alerts theo ngày giảm dần
  const sortedAlerts = alerts && alerts.length > 0
    ? [...alerts].sort((a, b) => new Date(b.alertDate) - new Date(a.alertDate))
    : [];

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
                {sortedAlerts.length > 0 ? (
                  <table className="alert-history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Severity</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAlerts.map((item, index) => {
                        const parsedMessage = parseAlertMessage(item.message);
                        return (
                          <React.Fragment key={index}>
                            <tr
                              className={`alert-history-item ${getSeverityClass(item.severityLevel)}`}
                              onClick={() => toggleAlertDetails(index)}
                            >
                              <td>{formatDate(item.alertDate)}</td>
                              <td>{item.severityLevel}</td>
                              <td>{parsedMessage.alert}</td>
                            </tr>
                            {expandedAlertIndex === index && (
                              <tr className="alert-details">
                                <td colSpan="3">
                                  <div className="alert-details-content">
                                    <p><strong>Date:</strong> {formatDate(item.alertDate)}</p>
                                    <p><strong>Disease Type:</strong> {parsedMessage.diseaseType}</p>
                                    <p><strong>Symptoms:</strong> {parsedMessage.symptoms}</p>
                                    <p><strong>Recommended Treatment:</strong> {parsedMessage.recommendedTreatment}</p>
                                    <p><strong>Prevention Tips:</strong> {parsedMessage.preventionTips}</p>
                                    <p><strong>Description:</strong> {parsedMessage.description}</p>
                                    <p><strong>Notes:</strong> {parsedMessage.notes}</p>
                                    <p><strong>Trend Analysis:</strong> {parsedMessage.trendAnalysis}</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p>No alert history available.</p>
                )}
              </>
            ) : (
              sortedAlerts.length > 0 ? (
                <table className="alert-history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Severity</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAlerts.map((item, index) => {
                      const parsedMessage = parseAlertMessage(item.message);
                      return (
                        <React.Fragment key={index}>
                          <tr
                            className={`alert-history-item ${getSeverityClass(item.severityLevel)}`}
                            onClick={() => toggleAlertDetails(index)}
                          >
                            <td>{formatDate(item.alertDate)}</td>
                            <td>{item.severityLevel}</td>
                            <td>{parsedMessage.alert}</td>
                          </tr>
                          {expandedAlertIndex === index && (
                            <tr className="alert-details">
                              <td colSpan="3">
                                <div className="alert-details-content">
                                  <p><strong>Date:</strong> {formatDate(item.alertDate)}</p>
                                  <p><strong>Disease Type:</strong> {parsedMessage.diseaseType}</p>
                                  <p><strong>Symptoms:</strong> {parsedMessage.symptoms}</p>
                                  <p><strong>Recommended Treatment:</strong> {parsedMessage.recommendedTreatment}</p>
                                  <p><strong>Prevention Tips:</strong> {parsedMessage.preventionTips}</p>
                                  <p><strong>Description:</strong> {parsedMessage.description}</p>
                                  <p><strong>Notes:</strong> {parsedMessage.notes}</p>
                                  <p><strong>Trend Analysis:</strong> {parsedMessage.trendAnalysis}</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p>No alert history available.</p>
              )
            )}
            <button className="export-pdf-btn" onClick={exportToPDF}>
              Export to PDF
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Alert;