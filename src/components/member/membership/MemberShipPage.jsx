import React,  { useState }  from "react";
import "./MemberShipPage.css";
import Logo from "../../../assets/logo.png"; // Logo biểu tượng
import Name from "../../../assets/NAME.png"; // Logo chữ "BabyHaven" (nếu cần)


function MemberShipPage() {  
    return (
      <div className="membership-page">
        {/* Sidebar */}
        <aside className="membership-sidebar">
          <div className="membership-sidebar-header">
            <img src={Logo} alt="Logo" className="sidebar-logo-icon" />
            <img src={Name} alt="BabyHaven" className="sidebar-logo-text" />
          </div>
  
          <nav className="membership-sidebar-menu">
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
              <li className="menu-item">
                <i className="fas fa-sign-out-alt"></i>
                <span>Sign Out</span>
              </li>
            </ul>
          </nav>
        </aside>
  
        {/* Main content */}
        <div className="membership-main-content">
          {/* Topbar */}
          <header className="membership-topbar">
            <div className="membership-search-container">
              <input
                type="text"
                placeholder="Hinted search text"
                className="membership-search-input"
              />
            </div>
            <div className="membership-user-info">Hello, ABC</div>
          </header>

          
  {/* Body */}
  <div className="membership-body">
            {/* Membership Details */}
            <div className="card membership-details">
              <h3>Membership details:</h3>
              <ul>
                <li>Feature 1</li>
                <li>Feature 2</li>
                <li>Feature 3</li>
                <li>Feature 4</li>
                <li>Feature 5</li>
              </ul>
            </div>

            {/* Current Plan */}
            <div className="card membership-plan">
              <h3>Your current plan</h3>
              <p><strong>Price:</strong> 379.000 VND</p>
              <p><strong>Start date:</strong> 19-02-2025</p>
              <p><strong>Expire date:</strong> 19-05-2025</p>
              <p><strong>Description:</strong> Standard membership with additional features</p>
              <p><strong>Promotion:</strong> Not allowed</p>
              <p><strong>Overall:</strong> 379.000 VND</p>
              <button className="membership-button standard">STANDARD</button>
            </div>
          </div>

          {/* Upgrade Section */}
          <div className="membership-upgrade">
            <p>Update to <span className="premium-text">Premium</span> to unlock more powerful features</p>
            <button className="membership-button premium">TRY NOW</button>
          </div>


        </div>
      </div>
  );
}

export default MemberShipPage;
