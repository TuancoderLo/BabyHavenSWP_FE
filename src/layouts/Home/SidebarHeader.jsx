import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SidebarHeader.css";
import avatar_LOGO from "../../assets/avatar_LOGO.jpg";

function SidebarHeader({ userData, handleLogout }) {
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState(location.pathname);

  return (
    <aside className="sidebar right-sidebar">
      <div className="sidebar-header">
        <div className="user-profile">
          <img
            src={userData?.profilePicture || avatar_LOGO}
            alt="User"
            className="user-avatar"
          />
          <span className="user-name">{userData ? userData.name : "User"}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li
            className={activePath === "/homepage" ? "active" : ""}
            onClick={() => setActivePath("/homepage")}
          >
            <Link to="/homepage" className="menu-item">
              <i className="fas fa-home"></i>
              <span>Home</span>
            </Link>
          </li>

          <li
            className={activePath === "/member/children" ? "active" : ""}
            onClick={() => setActivePath("/member/children")}
          >
            <Link to="/member/children" className="menu-item">
              <i className="fas fa-baby"></i>
              <span>Children</span>
            </Link>
          </li>

          <li
            className={
              activePath === "/member/doctor-consultation" ? "active" : ""
            }
            onClick={() => setActivePath("/member/doctor-consultation")}
          >
            <Link to="/member/doctor-consultation" className="menu-item">
              <i className="fas fa-stethoscope"></i>
              <span>Consultation</span>
            </Link>
          </li>

          <li
            className={activePath === "/member/transactions" ? "active" : ""}
            onClick={() => setActivePath("/member/transactions")}
          >
            <Link to="/member/transactions" className="menu-item">
              <i className="fas fa-money-check-alt"></i>
              <span>Transaction</span>
            </Link>
          </li>

          <li
            className={activePath === "/member/membership" ? "active" : ""}
            onClick={() => setActivePath("/member/membership")}
          >
            <Link to="/member/membership" className="menu-item">
              <i className="fas fa-id-card"></i>
              <span>Membership</span>
            </Link>
          </li>

          <li
            className={activePath === "/member/notifications" ? "active" : ""}
            onClick={() => setActivePath("/member/notifications")}
          >
            <Link to="/member/notifications" className="menu-item">
              <i className="fas fa-bell"></i>
              <span>Notifications</span>
            </Link>
          </li>

          <li
            className={activePath === "/member/account" ? "active" : ""}
            onClick={() => setActivePath("/member/account")}
          >
            <Link to="/member/account" className="menu-item">
              <i className="fas fa-user-cog"></i>
              <span>Account</span>
            </Link>
          </li>

          <li className="menu-item" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default SidebarHeader;
