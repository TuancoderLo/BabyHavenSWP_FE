import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import Logo from "../../../assets/Logo.png";
import Name from "../../../assets/Name.png";

function Sidebar() {
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState(location.pathname);

  const handleSignOut = () => {
    navigate("/login");
  };

  return (
    <aside className="doctor-sidebar-doctor">
      <div
        className="doctor-sidebar-header"
        onClick={() => navigate("/doctor/home")}
        style={{ cursor: "pointer" }}
      >
        <img src={Logo} alt="Logo" className="sidebar-logo-icon" />
        <img src={Name} alt="DoctorApp" className="sidebar-logo-text" />
      </div>

      <nav className="doctor-sidebar-nav">
        <ul>
          <li
            className={activePath === "/doctor/home" ? "active" : ""}
            onClick={() => setActivePath("/doctor/home")}
          >
            <Link to="/doctor/home" className="doctor-menu-item">
              <i className="fas fa-home"></i>
              <span>Home</span>
            </Link>
          </li>

          <li
            className={activePath === "/doctor/bio" ? "active" : ""}
            onClick={() => setActivePath("/doctor/bio")}
          >
            <Link to="/doctor/bio" className="doctor-menu-item">
              <i className="fas fa-user"></i>
              <span>Bio</span>
            </Link>
          </li>

          <li
            className={activePath === "/doctor/request" ? "active" : ""}
            onClick={() => setActivePath("/doctor/request")}
          >
            <Link to="/doctor/request" className="doctor-menu-item">
              <i className="fas fa-file-alt"></i>
              <span>Request</span>
            </Link>
          </li>

          <li
            className={activePath === "/doctor/response" ? "active" : ""}
            onClick={() => setActivePath("/doctor/response")}
          >
            <Link to="/doctor/response" className="doctor-menu-item">
              <i className="fas fa-reply"></i>
              <span>Response</span>
            </Link>
          </li>

          <li
            className={activePath === "/doctor/record-request" ? "active" : ""}
            onClick={() => setActivePath("/doctor/record-request")}
          >
            <Link to="/doctor/record-request" className="doctor-menu-item">
              <i className="fas fa-notes-medical"></i>
              <span>Record Request</span>
            </Link>
          </li>

          <li
            className={activePath === "/doctor/blog" ? "active" : ""}
            onClick={() => setActivePath("/doctor/blog")}
          >
            <Link to="/doctor/blog" className="doctor-menu-item">
              <i className="fas fa-blog"></i>
              <span>Doctor Blog</span>
            </Link>
          </li>

          <li className="doctor-menu-item" onClick={handleSignOut}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
