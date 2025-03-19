// Doctor.jsx
import React, { useState, useEffect } from "react";
import { Typography, Badge, Spin, message } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// Các component con
import Home from "./DashBoardDoctor/Home";
import Bio from "./DashBoardDoctor/Bio";
import Request from "./DashBoardDoctor/Request";
import Response from "./DashBoardDoctor/Response";
import RecordRequest from "./DashBoardDoctor/RecordRequest";
import DoctorBlog from "./DashBoardDoctor/DoctorBlog";

// Import Sidebar
import Sidebar from "../Doctor/Sidebar/Sidebar";

import "./Doctor.css";

const { Title, Text } = Typography;

const Doctor = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home"); // Mặc định "home"
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [doctorInfo, setDoctorInfo] = useState({
    name: "",
    specialty: "",
    profilePicture: "",
    notifications: 0,
  });

  useEffect(() => {
    // Kiểm tra role
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("role");

    if (!isAuthenticated || role !== "2") {
      message.error("Bạn không có quyền truy cập trang này!");
      navigate("/login");
      return;
    }

    //lấy thông tin doctor từ localStorage
    const name = localStorage.getItem("name") || "Doctor Strange";
    const profilePicture = localStorage.getItem("profilePicture") || "";

    setDoctorInfo({
      name,
      specialty: "Pediatrics",
      profilePicture,
      notifications: 3,
    });
  }, [navigate]);

  // Đổi tab
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Đóng/mở sidebar
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={`doctor-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* SIDEBAR */}
      <Sidebar
        doctorInfo={doctorInfo}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        handleLogout={handleLogout}
        collapsed={collapsed}
        toggleCollapse={toggleCollapse}
      />

      {/* MAIN */}
      <main className="doctor-main">
        {/* Content */}
        <section className="doctor-dashboard">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <>
              {activeTab === "home" && <Home doctorInfo={doctorInfo} />}
              {activeTab === "bio" && <Bio />}
              {activeTab === "requests" && <Request />}
              {activeTab === "responses" && <Response />}
              {activeTab === "record" && <RecordRequest />}
              {activeTab === "blog" && <DoctorBlog />}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Doctor;