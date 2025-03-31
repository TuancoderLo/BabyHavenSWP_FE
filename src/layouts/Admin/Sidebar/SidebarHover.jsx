// src/components/admin/SidebarHover.jsx
import React, { useState } from "react";
import {
  FaHome,
  FaChartLine,
  FaUsers,
  FaBox,
  FaSignOutAlt,
  FaStar,
} from "react-icons/fa";
import "./SidebarHover.css";
import { MdArticle } from "react-icons/md"; // ví dụ cho Blog
import { useNavigate, Link } from "react-router-dom";
import Logo from "../../../assets/Logo.png";

function SidebarHover() {
  const [activeItem, setActiveItem] = useState(window.location.pathname);
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Sign out clicked");
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-sidebar-hover">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src={Logo} alt="BabyHaven" />
      </div>

      {/* Menu */}
      <ul className="admin-sidebar-menu">
        <li className={activeItem === "/homepage" ? "active" : ""}>
          <Link to="/homepage" onClick={() => setActiveItem("/homepage")}>
            <FaHome className="admin-icon" />
            <span>Home</span>
          </Link>
        </li>
        <li className={activeItem === "/admin" ? "active" : ""}>
          <Link to="/admin" onClick={() => setActiveItem("/admin")}>
            <FaChartLine className="admin-icon" />
            <span>Dashboard</span>
          </Link>
        </li>
        <li className={activeItem === "/admin/blog" ? "active" : ""}>
          <Link to="/admin/blog" onClick={() => setActiveItem("/admin/blog")}>
            <MdArticle className="admin-icon" />
            <span>Blogs</span>
          </Link>
        </li>
        <li className={activeItem === "/admin/members" ? "active" : ""}>
          <Link
            to="/admin/members"
            onClick={() => setActiveItem("/admin/members")}
          >
            <FaUsers className="admin-icon" />
            <span>Members</span>
          </Link>
        </li>
        <li className={activeItem === "/admin/packages" ? "active" : ""}>
          <Link
            to="/admin/packages"
            onClick={() => setActiveItem("/admin/packages")}
          >
            <FaBox className="admin-icon" />
            <span>Service Packages</span>
          </Link>
        </li>
        <li className={activeItem === "/admin/ratings" ? "active" : ""}>
          <Link
            to="/admin/ratings"
            onClick={() => setActiveItem("/admin/ratings")}
          >
            <FaStar className="admin-icon" />
            <span>Đánh Giá</span>
          </Link>
        </li>
        <li className="signout-item" onClick={handleLogout}>
          <FaSignOutAlt className="admin-icon-signout" />
          <span>Sign Out</span>
        </li>
      </ul>
    </div>
  );
}

export default SidebarHover;
