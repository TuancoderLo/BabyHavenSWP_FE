// src/components/admin/Topbar.jsx
import React from "react";
import { FaSearch } from "react-icons/fa";
import "./Topbar.css";

function Topbar() {
    return (
        <div className="topbar-container">
            <div className="topbar-left">
                <h3>Dashboard</h3>
            </div>

            <div className="topbar-search">
                <FaSearch className="search-icon" />
                <input type="text" placeholder="Hinted search text" />
            </div>

            <div className="topbar-right">
                <span>Hello, MasterChef</span>
            </div>
        </div>
    );
}

export default Topbar;
