// DoctorCalendar.jsx
import React from "react";
import { Calendar } from "antd";
import "./DoctorCalendar.css";

const DoctorCalendar = () => {
  const onPanelChange = (value, mode) => {
    console.log("Calendar changed:", value.format("YYYY-MM-DD"), mode);
  };

  // Render cell, ví dụ: highlight ngày
  const dateCellRender = (value) => {
    // Giả sử highlight ngày 15
    if (value.date() === 15) {
      return <div style={{ color: "red", fontWeight: "bold" }}>●</div>;
    }
    return null;
  };

  return (
    <div className="small-calendar">
      <Calendar
        fullscreen={false}
        onPanelChange={onPanelChange}
        dateCellRender={dateCellRender}
      />
    </div>
  );
};

export default DoctorCalendar;
