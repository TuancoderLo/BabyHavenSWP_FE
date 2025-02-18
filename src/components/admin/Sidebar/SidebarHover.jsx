// src/components/admin/SidebarHover.jsx
import React, { useState } from "react";
import {
    FaHome, FaChartLine, FaUsers, FaBox, FaEnvelope, FaBell, FaCog, FaSignOutAlt
} from "react-icons/fa";
import "./SidebarHover.css";
import { MdArticle } from "react-icons/md"; // ví dụ cho Blog
import { useNavigate } from "react-router-dom";
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
                    <FaHome className="admin-icon" />
                    {expanded && <span>Home</span>}
                </li>
                <li>
                    <FaChartLine className="admin-icon" />
                    {expanded && <span>Analysis</span>}
                </li>
                <li>
                    <FaUsers className="admin-icon" />
                    {expanded && <span>Members</span>}
                </li>
                <li>
                    <FaBox className="admin-icon" />
                    {expanded && <span>Packages</span>}
                </li>
                <li>
                    <FaEnvelope className="admin-icon" />
                    {expanded && <span>Inbox</span>}
                </li>
                <li>
                    <FaBell className="admin-icon" />
                    {expanded && <span>Notifications</span>}
                </li>
                <li>
                    <FaCog className="admin-icon" />
                    {expanded && <span>Settings</span>}
                </li>
                <li>
                    <MdArticle className="admin-icon" />
                    {expanded && <span>Blog</span>}
                </li>
                <li onClick={handleLogout}>
                    <FaSignOutAlt className="admin-icon" />
                    {expanded && <span>Sign Out</span>}
                </li>
            </ul>
        </div>
    );
}

export default SidebarHover;