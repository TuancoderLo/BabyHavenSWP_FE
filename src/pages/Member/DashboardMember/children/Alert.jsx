import React, { useState } from "react";
import "./Alert.css";
import HealthReportGenerator from "../../../../services/HealthReportGenerator";

// Array of child care tips
const careTips = [
  "Ensure your child drinks enough water every day to stay healthy! 💧",
  "Adequate sleep is key to your child's healthy development—aim for 8-10 hours! 😴",
  "As the weather changes, keep your child warm to prevent colds! 🧣",
  "Add more veggies to your child's diet for vitamins and minerals! 🥕",
  "Encourage 30 minutes of daily activity for physical development! 🏃‍♂️",
  "Outdoor play boosts mood and health! 🌞",
  "A balanced meal with fruits, proteins, and grains strengthens immunity! 🍎",
];

const Alert = ({ alert, alerts, member, child, growthRecords }) => {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  const [expandedAlertIndex, setExpandedAlertIndex] = useState(null);

  const openOverlay = () => setExpanded(true);
  const closeOverlay = () => setExpanded(false);
  const closeAlert = () => setVisible(false);

  const hasAlert = !!alert;

  // Get a random care tip
  const getRandomCareTip = () => {
    const randomIndex = Math.floor(Math.random() * careTips.length);
    return careTips[randomIndex];
  };

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

  const additionalClass =
    hasAlert && ["medium", "high"].includes(alert?.severityLevel?.toLowerCase())
      ? "fadeable"
      : "";

  const alertIcon = hasAlert
    ? alert.severityLevel?.toLowerCase() === "high"
      ? "🚨"
      : "🔔"
    : "🌟";

  const alertMessage = hasAlert
    ? `Child's health shows a ${alert.severityLevel} level warning`
    : getRandomCareTip();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const parseAlertMessage = (message) => {
    const fieldConfig = [
      { key: "alert", label: "Alert: " },
      { key: "diseaseType", label: "Disease Type: " },
      { key: "symptoms", label: "Symptoms: " },
      { key: "recommendedTreatment", label: "Recommended Treatment: " },
      { key: "preventionTips", label: "Prevention Tips: " },
      { key: "description", label: "Description: " },
      { key: "notes", label: "Notes: " },
      { key: "trendAnalysis", label: "Trend Analysis: " },
    ];

    const fields = {
      alert: "N/A",
      diseaseType: "N/A",
      symptoms: "N/A",
      recommendedTreatment: "N/A",
      preventionTips: "N/A",
      description: "N/A",
      notes: "N/A",
      trendAnalysis: "N/A",
    };

    if (!message || typeof message !== "string") {
      return fields;
    }

    fieldConfig.forEach(({ key, label }, i) => {
      const startIndex = message.indexOf(label);
      if (startIndex === -1) return;

      const contentStart = startIndex + label.length;
      let contentEnd;

      const nextField = fieldConfig[i + 1];
      if (nextField) {
        const nextLabelIndex = message.indexOf(nextField.label, contentStart);
        contentEnd = nextLabelIndex !== -1 ? nextLabelIndex : message.length;
      } else {
        contentEnd = message.endsWith(".") ? message.length - 1 : message.length;
      }

      const content = message.slice(contentStart, contentEnd).trim();
      if (content) {
        fields[key] = content;
      }
    });

    return fields;
  };

  const exportToPDF = () => {
    const latestGrowthRecord =
      growthRecords && growthRecords.length > 0
        ? growthRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        : null;

    const report = new HealthReportGenerator(member, child, alert, latestGrowthRecord);
    report.generatePDF();
  };

  const toggleAlertDetails = (index) => {
    setExpandedAlertIndex(expandedAlertIndex === index ? null : index);
  };

  const sortedAlerts =
    alerts && alerts.length > 0
      ? [...alerts].sort((a, b) => new Date(b.alertDate) - new Date(a.alertDate))
      : [];

  const handleLearnMore = () => {
    window.open("https://www.example.com/child-care-tips", "_blank");
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
                View Details
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
            <>
              <button className="alert-see-more" onClick={openOverlay}>
                View Alert History
              </button>
              <button className="alert-learn-more" onClick={handleLearnMore}>
                Learn More
              </button>
            </>
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
                                    <p>
                                      <strong>Date:</strong> {formatDate(item.alertDate)}
                                    </p>
                                    <p>
                                      <strong>Alert:</strong> {parsedMessage.alert}
                                    </p>
                                    <p>
                                      <strong>Disease Type:</strong> {parsedMessage.diseaseType}
                                    </p>
                                    <p>
                                      <strong>Symptoms:</strong> {parsedMessage.symptoms}
                                    </p>
                                    <p>
                                      <strong>Recommended Treatment:</strong> {parsedMessage.recommendedTreatment}
                                    </p>
                                    <p>
                                      <strong>Prevention Tips:</strong> {parsedMessage.preventionTips}
                                    </p>
                                    <p>
                                      <strong>Description:</strong> {parsedMessage.description}
                                    </p>
                                    <p>
                                      <strong>Notes:</strong> {parsedMessage.notes}
                                    </p>
                                    <p>
                                      <strong>Trend Analysis:</strong> {parsedMessage.trendAnalysis}
                                    </p>
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
                                  <p>
                                    <strong>Date:</strong> {formatDate(item.alertDate)}
                                  </p>
                                  <p>
                                    <strong>Alert:</strong> {parsedMessage.alert}
                                  </p>
                                  <p>
                                    <strong>Disease Type:</strong> {parsedMessage.diseaseType}
                                  </p>
                                  <p>
                                    <strong>Symptoms:</strong> {parsedMessage.symptoms}
                                  </p>
                                  <p>
                                    <strong>Recommended Treatment:</strong> {parsedMessage.recommendedTreatment}
                                  </p>
                                  <p>
                                    <strong>Prevention Tips:</strong> {parsedMessage.preventionTips}
                                  </p>
                                  <p>
                                    <strong>Description:</strong> {parsedMessage.description}
                                  </p>
                                  <p>
                                    <strong>Notes:</strong> {parsedMessage.notes}
                                  </p>
                                  <p>
                                    <strong>Trend Analysis:</strong> {parsedMessage.trendAnalysis}
                                  </p>
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
              Export PDF
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Alert;