import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./Sidebar.css";
import Logo from "../../../assets/logo.png";
import Name from "../../../assets/NAME.png";

function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Ví dụ sign out => navigate("/login") hoặc gì đó
    navigate("/login");
  };

  return (
    <aside className="children-sidebar">
      <div className="children-sidebar-header">
        <img src={Logo} alt="Logo" className="sidebar-logo-icon" />
        <img src={Name} alt="BabyHaven" className="sidebar-logo-text" />
      </div>

      <nav className="children-sidebar-nav">
        <ul>
          <li className="menu-item active">
            <i className="fas fa-child"></i>
            <span>Children</span>
          </li>
          <li className="menu-item">
            <i className="fas fa-stethoscope"></i>
            <span>Consultation</span>
          </li>
          <li className="menu-item">
            <i className="fas fa-heartbeat"></i>
            <span>Health Analyst</span>
          </li>
          <li className="menu-item">
            <i className="fas fa-user-md"></i>
            <span>Doctor</span>
          </li>
          <li className="menu-item">
            <i className="fas fa-bell"></i>
            <span>Notifications</span>
          </li>
          <li className="menu-item">
            <i className="fas fa-cog"></i>
            <span>Settings</span>
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

export default Sidebar;
