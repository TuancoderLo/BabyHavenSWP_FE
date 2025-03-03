import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Logo.png";
import Name from "../../assets/Name.png";
import avatar_LOGO from "../../assets/avatar_LOGO.jpg";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const nameFromLocal = localStorage.getItem("name");
    if (nameFromLocal) {
      setUserData({ name: nameFromLocal });
    }
  }, []);

  const handleMouseEnter = () => {
    setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="homepage-header">
      <nav>
        <div className="logo">
          <img src={Logo} alt="Logo" />
          <img src={Name} alt="Name" />
        </div>

        <div className="nav-links">
          <div className="dropdown">
            <a href="#getting-pregnant">Getting Pregnant</a>
            <div className="dropdown-content">
              <a href="#fertility">Fertility</a>
              <a href="#ovulation">Ovulation</a>
              <a href="#preparation">Preparation</a>
            </div>
          </div>
          <div className="dropdown">
            <a href="#pregnancy">Pregnancy</a>
            <div className="dropdown-content">
              <a href="#first-trimester">First Trimester</a>
              <a href="#second-trimester">Second Trimester</a>
              <a href="#third-trimester">Third Trimester</a>
            </div>
          </div>
          <div className="dropdown">
            <a href="#baby">Baby</a>
            <div className="dropdown-content">
              <a href="#newborn">Newborn</a>
              <a href="#development">Development</a>
              <a href="#care">Baby Care</a>
            </div>
          </div>
          <div className="dropdown">
            <a href="#toddler">Toddler</a>
            <div className="dropdown-content">
              <a href="#development">Development</a>
              <a href="#nutrition">Nutrition</a>
              <a href="#activities">Activities</a>
            </div>
          </div>
          <div className="dropdown">
            <a href="#child">Child</a>
            <div className="dropdown-content">
              <a href="#education">Education</a>
              <a href="#health">Health</a>
              <a href="#activities">Activities</a>
            </div>
          </div>
          <a href="#community">Community</a>
          <a href="#tools-features">Features</a>
        </div>

        <div
          className="avatar-sidebar-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="avatar-chip-img">
            <img
              src={userData?.profilePicture || avatar_LOGO}
              alt="User Avatar"
            />
          </div>
          <span className="avatar-chip-text">
            {userData ? userData.name : "Name"}
          </span>
          {menuOpen && (
            <div className="overlay" onClick={() => setMenuOpen(false)}></div>
          )}
          <div className={`sidebar-menu ${menuOpen ? "open" : ""}`}>
            <div className="sidebar-header">
              <i className="fas fa-user-circle"></i>
              <span>{userData ? userData.name : "User"}</span>
            </div>
            <hr />
            <div className="sidebar-section">
              <h4>Activity</h4>
              <p>Growth tracker</p>
              <p>Doctor consultation</p>
              <p>Health Analysis</p>
            </div>
            <hr />
            <div className="sidebar-section">
              <h4>Profile</h4>
              <p onClick={() => navigate("/member/children")}>My children</p>
              <p>My children's milestones</p>
              <p>My membership plans</p>
              <p>My requests</p>
            </div>
            <hr />
            <div className="sidebar-section">
              <h4>Setting</h4>
              <p>Profile setting</p>
              <p onClick={handleLogout}>Log out</p>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
