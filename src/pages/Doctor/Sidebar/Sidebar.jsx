import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import Logo from "../../../assets/Logo.png";
import Name from "../../../assets/Name.png";

function DoctorSidebar() {
  const navigate = useNavigate();
  
  // State để điều khiển việc mở/đóng sidebar
  const [isOpen, setIsOpen] = useState(true);
  const [activePath, setActivePath] = useState(location.pathname);

  // Hàm để xử lý mở/đóng sidebar khi nhấp vào sidebar
  const handleSidebarClick = () => {
    setIsOpen(prevState => !prevState);  // Đổi trạng thái giữa mở và đóng
  };

  const handleSignOut = () => {
    navigate("/login");
  };

  return (
    <aside
      className={`children-sidebar ${isOpen ? "open" : "closed"}`}
      onClick={handleSidebarClick}  // Khi nhấp vào sidebar, sẽ chuyển trạng thái mở/đóng
    >
      <div
        className="children-sidebar-header"
        onClick={() => navigate("/doctor/home")}
        style={{ cursor: "pointer" }}
      >
        <img src={Logo} alt="Logo" className="sidebar-logo-icon" />
        <img src={Name} alt="DoctorApp" className="sidebar-logo-text" />
      </div>

      <nav className="children-sidebar-nav">
        <ul>
          <li
            className={activePath === "/doctor/home" ? "active" : ""}
            onClick={() => setActivePath("/doctor/home")}
          >
            <Link to="/doctor/home" className="menu-item">
              <i className="fas fa-home"></i>
              <span>Home</span>
            </Link>
          </li>

          <li
            className={activePath === "/doctor/bio" ? "active" : ""}
            onClick={() => setActivePath("/doctor/bio")}
          >
            <Link to="/doctor/bio" className="menu-item">
              <i className="fas fa-user"></i>
              <span>Bio</span>
            </Link>
          </li>

          <li
            className={activePath === "/doctor/request" ? "active" : ""}
            onClick={() => setActivePath("/doctor/request")}
          >
            <Link to="/doctor/request" className="menu-item">
              <i className="fas fa-file-alt"></i>
              <span>Request</span>
            </Link>
          </li>

          <li
            className={activePath === "/doctor/response" ? "active" : ""}
            onClick={() => setActivePath("/doctor/response")}
          >
            <Link to="/doctor/response" className="menu-item">
              <i className="fas fa-reply"></i>
              <span>Response</span>
            </Link>
          </li>

          <li
            className={activePath === "/doctor/record-request" ? "active" : ""}
            onClick={() => setActivePath("/doctor/record-request")}
          >
            <Link to="/doctor/record-request" className="menu-item">
              <i className="fas fa-notes-medical"></i>
              <span>Record Request</span>
            </Link>
          </li>

          <li
            className={activePath === "/doctor/blog" ? "active" : ""}
            onClick={() => setActivePath("/doctor/blog")}
          >
            <Link to="/doctor/blog" className="menu-item">
              <i className="fas fa-blog"></i>
              <span>Doctor Blog</span>
            </Link>
          </li>

          <li className="menu-item" onClick={handleSignOut}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default DoctorSidebar;
