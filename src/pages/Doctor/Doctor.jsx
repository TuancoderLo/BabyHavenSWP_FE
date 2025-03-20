import React from "react";
import Sidebar from "../Doctor/Sidebar/Sidebar";
import Home from "./DashBoardDoctor/Home";
import Bio from "./DashBoardDoctor/Bio";
import Consultation from "./DashBoardDoctor/Consultation";
import DoctorBlog from "./DashBoardDoctor/DoctorBlog";
import { Routes, Route, Navigate } from "react-router-dom";
import "./Doctor.css";

function Doctor() {
  return (
    <div className="doctor-page-doctor">
      <Sidebar />
      <div className="doctor-main-doctor">
        <div className="doctor-main-content-doctor">
          <Routes>
            <Route path="/" element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="consultation" element={<Consultation />} />
            <Route path="bio" element={<Bio />} />
            <Route path="blog" element={<DoctorBlog />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Doctor;
