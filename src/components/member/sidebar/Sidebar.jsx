import React from "react";
import { useState } from "react";
import {Link, useNavigate} from "react-router-dom"; 
import "./Sidebar.css";
import Logo from "../../../assets/logo.png";
import Name from "../../../assets/NAME.png";

function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate("/login");
  };
  const [activePath, setActivePath] = useState(location.pathname);


  return (
    <aside className="children-sidebar">
      <div className="children-sidebar-header">
        <img src={Logo} alt="Logo" className="sidebar-logo-icon" />
        <img src={Name} alt="BabyHaven" className="sidebar-logo-text" />
      </div>

      <nav className="children-sidebar-nav">
        <ul>
        <li className={activePath === "/member/home" ? "active" : ""} onClick={() => setActivePath("/member/home")}>
        <Link to="/member/home" className="menu-item">
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
          </li>

          <li className={activePath === "/member/children" ? "active" : ""} onClick={() => setActivePath("/member/children")}>
          <Link to = "/member/children" className="menu-item ">
            <i className="fas fa-child"></i>
            <span>Children</span>
            </Link>
          </li>

        <li className={activePath === "/member/doctor-consultation" ? "active" : ""} onClick={() => setActivePath("/member/doctor-consultation")}> 
          <Link to = "/member/doctor-consultation" className="menu-item">
            <i className="fas fa-stethoscope"></i>
            <span>Consultation</span>
            </Link>
          </li>
         
          <li className={activePath === "/member/health-analyst" ? "active" : ""} onClick={() => setActivePath("/member/health-analyst")}>
            <Link to = "/member/health-analyst" className="menu-item">
            <i className="fas fa-heartbeat"></i>
            <span>Health Analyst</span>
            </Link>
          </li>

          <li className={activePath === "/member/doctor" ? "active" : ""} onClick={() => setActivePath("/member/doctor")}>
            <Link to = "/member/doctor-consultation" className="menu-item">
            <i className="fas fa-user-md"></i>
            <span>Doctor</span>
            </Link>
          </li>

          <li className={activePath === "/member/notifications" ? "active" : ""} onClick={() => setActivePath("/member/notifications")}>            <Link to = "/member/notifications" className="menu-item">
            <i className="fas fa-bell"></i>
            <span>Notifications</span>
            </Link>
          </li>

          <li className={activePath === "/member/settings" ? "active" : ""} onClick={() => setActivePath("/member/settings")}>
            <Link to = "/member/settings" className="menu-item">
            <i className="fas fa-cog"></i>
            <span>Settings</span>
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

export default Sidebar;
