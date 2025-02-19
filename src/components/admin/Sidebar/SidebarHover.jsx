// src/components/admin/SidebarHover.jsx
import React, { useState } from "react";
import {
  FaHome,
  FaChartLine,
  FaUsers,
  FaBox,
  FaEnvelope,
  FaBell,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import "./SidebarHover.css";
import { MdArticle } from "react-icons/md"; // ví dụ cho Blog
import { useNavigate, Link } from "react-router-dom";
import Logo from "../../../assets/Logo.png";
import Name from "../../../assets/Name.png";

function SidebarHover() {
  // State: khi hover (hoặc di chuột vào logo) => expanded = true
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleMouseEnter = () => setExpanded(true);
  const handleMouseLeave = () => setExpanded(false);

  const handleLogout = () => {
    console.log("Sign out clicked");
    localStorage.clear();
    navigate("/login"); // hoặc navigate("/")
  };
  return (
    <div
      className={`admin-sidebar-hover ${expanded ? "expanded" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <img src={Logo} alt="BabyHaven" />
      </div>

      {/* Menu */}
      <ul className="admin-sidebar-menu">
        <li>
          <Link to="/admin/home">
            <FaHome className="admin-icon" />
            {expanded && <span>Home</span>}
          </Link>
        </li>
        <li>
          <Link to="/admin">
            <FaChartLine className="admin-icon" />
            {expanded && <span>Dashboard</span>}
          </Link>
        </li>
        <li>
          <Link to="/admin/blog">
            <MdArticle className="admin-icon" />
            {expanded && <span>Blog</span>}
          </Link>
        </li>
        <li>
          <Link to="/admin/members">
            <FaUsers className="admin-icon" />
            {expanded && <span>Members</span>}
          </Link>
        </li>
        <li>
          <Link to="/admin/packages">
            <FaBox className="admin-icon" />
            {expanded && <span>Packages</span>}
          </Link>
        </li>
        <li>
          <Link to="/admin/inbox">
            <FaEnvelope className="admin-icon" />
            {expanded && <span>Inbox</span>}
          </Link>
        </li>
        <li>
          <Link to="/admin/notifications">
            <FaBell className="admin-icon" />
            {expanded && <span>Notifications</span>}
          </Link>
        </li>
        <li>
          <Link to="/admin/settings">
            <FaCog className="admin-icon" />
            {expanded && <span>Settings</span>}
          </Link>
        </li>
        <li onClick={handleLogout}>
          <FaSignOutAlt className="admin-icon-signout" />
          {expanded && <span>Sign Out</span>}
        </li>
      </ul>
    </div>
  );
}

export default SidebarHover;
