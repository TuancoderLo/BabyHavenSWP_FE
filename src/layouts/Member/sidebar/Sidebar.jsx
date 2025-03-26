import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import Logo from "../../../assets/Logo.png";
import Name from "../../../assets/Name.png";

function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/login");
  };
  const [activePath, setActivePath] = useState(location.pathname);

  return (
    <aside className="children-sidebar">
      <div
        className="children-sidebar-header"
        onClick={() => navigate("/homepage")}
        style={{ cursor: "pointer" }}
      >
        <img src={Logo} alt="Logo" className="sidebar-logo-icon" />
        <img src={Name} alt="BabyHaven" className="sidebar-logo-text" />
      </div>

      <nav className="children-sidebar-nav">
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
              {/* Hoặc fas fa-child nếu thích */}
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
              {/* Hoặc fas fa-credit-card */}
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
