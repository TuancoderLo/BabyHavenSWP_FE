import React from "react";
import Sidebar from "../Doctor/Sidebar/Sidebar";
import Home from "./DashBoardDoctor/Home";
import Bio from "./DashBoardDoctor/Bio";
import Request from "./DashBoardDoctor/Request";
import Response from "./DashBoardDoctor/Response";
import RecordRequest from "./DashBoardDoctor/RecordRequest";
import DoctorBlog from "./DashBoardDoctor/DoctorBlog";
import { Routes, Route, Navigate } from "react-router-dom";
import "./Doctor.css";

function Doctor() {
  return (
    <div className="doctor-page">
      <Sidebar />
      <div className="doctor-main">
        <div className="doctor-main-content">
          <Routes>
            <Route path="/" element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="bio" element={<Bio />} />
            <Route path="request" element={<Request />} />
            <Route path="response" element={<Response />} />
            <Route path="record-request" element={<RecordRequest />} />
            <Route path="blog" element={<DoctorBlog />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Doctor;
