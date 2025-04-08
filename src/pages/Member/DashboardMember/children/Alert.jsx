import React, { useState } from "react";
import {
  Card,
  Button,
  Modal,
  Table,
  Tag,
  Space,
  Divider,
} from "antd";
import HealthReportGenerator from "../../../../services/HealthReportGenerator";

const Alert = ({ alert, alerts, member, child, growthRecords, onConsultDoctor, onSendConsultationRequest }) => {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  const [expandedAlertIndex, setExpandedAlertIndex] = useState(-1);

  const hasAlert = !!alert;

  const careTips = [
    "Ensure your child drinks enough water every day to stay healthy! 💧",
    "Adequate sleep is key to your child's healthy development—aim for 8-10 hours! 😴",
    "As the weather changes, keep your child warm to prevent colds! 🧣",
    "Add more veggies to your child's diet for vitamins and minerals! 🥕",
    "Encourage 30 minutes of daily activity for physical development! 🏃‍♂️",
    "Outdoor play boosts mood and health! 🌞",
    "A balanced meal with fruits, proteins, and grains strengthens immunity! 🍎",
  ];

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

  const handleLearnMore = () => {
    window.open("https://www.example.com/child-care-tips", "_blank");
  };

  const handleConsultDoctor = () => {
    const parsedMessage = parseAlertMessage(alert.message);
    onConsultDoctor({
      child,
      description: `
        <p><strong>Alert:</strong> ${parsedMessage.alert}</p>
        <p><strong>Disease Type:</strong> ${parsedMessage.diseaseType}</p>
        <p><strong>Symptoms:</strong> ${parsedMessage.symptoms}</p>
        <p><strong>Description:</strong> ${parsedMessage.description}</p>
        <p><strong>Notes:</strong> ${parsedMessage.notes}</p>
      `,
      urgency: alert.severityLevel?.toLowerCase() === "high" ? "High" : "Medium",
      category: parsedMessage.diseaseType !== "N/A" ? parsedMessage.diseaseType : "Health",
    });
  };

  const sortedAlerts =
    alerts && alerts.length > 0
      ? [...alerts].sort((a, b) => new Date(b.alertDate) - new Date(a.alertDate))
      : [];

  const dataSourceWithKeys = sortedAlerts.map((alert, index) => ({
    ...alert,
    key: index.toString(),
  }));

  const columns = [
    {
      title: "Date",
      dataIndex: "alertDate",
      key: "alertDate",
      render: (text) => formatDate(text),
    },
    {
      title: "Severity",
      dataIndex: "severityLevel",
      key: "severityLevel",
      render: (text) => (
        <Tag
          color={
            getSeverityClass(text) === "danger"
              ? "red"
              : getSeverityClass(text) === "warning"
              ? "orange"
              : "green"
          }
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (text) => parseAlertMessage(text).alert,
    },
  ];

  const expandedRowRender = (record) => {
    const parsedMessage = parseAlertMessage(record.message);
    return (
      <div style={{ padding: "10px", backgroundColor: "#ffffff" }}>
        <p style={{ margin: "5px 0", fontSize: 12 }}>
          <strong style={{ color: "#333" }}>Date:</strong> {formatDate(record.alertDate)}
        </p>
        <p style={{ margin: "5px 0", fontSize: 12 }}>
          <strong style={{ color: "#333" }}>Alert:</strong> {parsedMessage.alert}
        </p>
        <p style={{ margin: "5px 0", fontSize: 12 }}>
          <strong style={{ color: "#333" }}>Disease Type:</strong> {parsedMessage.diseaseType}
        </p>
        <p style={{ margin: "5px 0", fontSize: 12 }}>
          <strong style={{ color: "#333" }}>Symptoms:</strong> {parsedMessage.symptoms}
        </p>
        <p style={{ margin: "5px 0", fontSize: 12 }}>
          <strong style={{ color: "#333" }}>Recommended Treatment:</strong>{" "}
          {parsedMessage.recommendedTreatment}
        </p>
        <p style={{ margin: "5px 0", fontSize: 12 }}>
          <strong style={{ color: "#333" }}>Prevention Tips:</strong> {parsedMessage.preventionTips}
        </p>
        <p style={{ margin: "5px 0", fontSize: 12 }}>
          <strong style={{ color: "#333" }}>Description:</strong> {parsedMessage.description}
        </p>
        <p style={{ margin: "5px 0", fontSize: 12 }}>
          <strong style={{ color: "#333" }}>Notes:</strong> {parsedMessage.notes}
        </p>
        <p style={{ margin: "5px 0", fontSize: 12 }}>
          <strong style={{ color: "#333" }}>Trend Analysis:</strong> {parsedMessage.trendAnalysis}
        </p>
      </div>
    );
  };

  const toggleAlertDetails = (index) => {
    setExpandedAlertIndex(expandedAlertIndex === index ? -1 : index);
  };

  // Hàm xử lý khi nhấn nút "Send Consultation Request" trong Modal
  const handleSendConsultationRequest = () => {
    if (expandedAlertIndex >= 0) {
      const selectedAlert = sortedAlerts[expandedAlertIndex];
      const parsedMessage = parseAlertMessage(selectedAlert.message);
      const description = `
        <p><strong>Alert:</strong> ${parsedMessage.alert}</p>
        <p><strong>Disease Type:</strong> ${parsedMessage.diseaseType}</p>
        <p><strong>Symptoms:</strong> ${parsedMessage.symptoms}</p>
        <p><strong>Description:</strong> ${parsedMessage.description}</p>
        <p><strong>Notes:</strong> ${parsedMessage.notes}</p>
      `;
      onSendConsultationRequest({
        ...selectedAlert,
        message: description, // Gửi description đã được định dạng
      });
    }
  };

  return (
    <>
      {visible && (
        <Card
          className={`alert-card ${getSeverityClass(alert?.severityLevel)} ${additionalClass}`}
          style={{
            padding: "16px",
            borderRadius: "12px",
            minHeight: "150px",
            border: "2px solid transparent",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            ...(getSeverityClass(alert?.severityLevel) === "healthy" && {
              borderColor: "#00d0bc",
              background: "#e6f7f5",
            }),
            ...(getSeverityClass(alert?.severityLevel) === "warning" && {
              borderColor: "#f4e800",
              background: "#ffffff",
              ...(additionalClass && { borderBottom: "3px solid #f4e800" }),
            }),
            ...(getSeverityClass(alert?.severityLevel) === "danger" && {
              borderColor: "#ff6262",
              background: "#ffffff",
              ...(additionalClass && { borderBottom: "3px solid #ff6262" }),
            }),
          }}
          hoverable
        >
          <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
            <Space>
              <span style={{ fontSize: 28, marginRight: 12 }}>{alertIcon}</span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  lineHeight: 1.5,
                  color:
                    getSeverityClass(alert?.severityLevel) === "healthy"
                      ? "#006064"
                      : getSeverityClass(alert?.severityLevel) === "warning"
                      ? "#ef6c00"
                      : "#c62828",
                }}
              >
                {alertMessage}
              </span>
            </Space>
            <Space>
              {hasAlert ? (
                <>
                  <Button
                    type="link"
                    style={{ color: "#00d0bc" }}
                    onClick={() => setExpanded(true)}
                  >
                    View Details
                  </Button>
                  <Button
                    type="link"
                    danger
                    style={{ color: "#999" }}
                    onClick={() => setVisible(false)}
                  >
                    ×
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="link"
                    style={{ color: "#00d0bc" }}
                    onClick={() => setExpanded(true)}
                  >
                    View Alert History
                  </Button>
                  <Button
                    style={{
                      color: "#008cff",
                      border: "1px solid #008cff",
                      borderRadius: "6px",
                    }}
                    onClick={handleLearnMore}
                  >
                    Learn More
                  </Button>
                </>
              )}
            </Space>
          </Space>
        </Card>
      )}

      <Modal
        open={expanded}
        onCancel={() => {
          setExpanded(false);
          setExpandedAlertIndex(-1);
        }}
        footer={[
          <Button
            key="export"
            style={{
              border: "2px solid #3e34ff",
              color: "#3e34ff",
              background: "#ffffff",
              fontWeight: 600,
              borderRadius: "8px",
            }}
            onClick={exportToPDF}
          >
            Export PDF
          </Button>,
          // Thêm nút "Send Consultation Request" vào footer của Modal
          expandedAlertIndex >= 0 && sortedAlerts[expandedAlertIndex] && ["medium", "high"].includes(sortedAlerts[expandedAlertIndex]?.severityLevel?.toLowerCase()) && (
            <Button
              key="consult"
              type="primary"
              style={{ background: "#3e34ff", borderColor: "#3e34ff", marginLeft: "8px" }}
              onClick={handleSendConsultationRequest}
            >
              Send Consultation Request
            </Button>
          ),
          <Button
            key="close"
            style={{
              color: "#3e34ff",
              border: "2px solid #3e34ff",
              background: "#ffffff",
              marginLeft: "8px",
            }}
            onClick={() => {
              setExpanded(false);
              setExpandedAlertIndex(-1);
            }}
          >
            Close
          </Button>,
        ]}
        width={1200}
        style={{ top: 20 }}
        styles={{ body: { height: "70vh", overflowY: "auto" } }}
      >
        {sortedAlerts.length > 0 ? (
          <Table
            columns={columns}
            dataSource={dataSourceWithKeys}
            expandable={{
              expandedRowRender,
              expandedRowKeys: expandedAlertIndex >= 0 ? [expandedAlertIndex.toString()] : [],
              onExpand: (expanded, record) => toggleAlertDetails(parseInt(record.key)),
            }}
            pagination={false}
            rowClassName={(record) => getSeverityClass(record.severityLevel)}
            onRow={(record) => ({
              onClick: () => toggleAlertDetails(parseInt(record.key)),
            })}
          />
        ) : (
          <p>No alert history available.</p>
        )}
      </Modal>
    </>
  );
};

export default Alert;