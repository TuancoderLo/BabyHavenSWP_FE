import React,  { useState }  from "react";
import "./ChildrenPage.css";
import Logo from "../../../assets/logo.png"; // Logo biểu tượng
import Name from "../../../assets/NAME.png"; // Logo chữ "BabyHaven" (nếu cần)


function ChildrenPage() {
    // Ví dụ data tĩnh
    const [childrenList] = useState([
      { id: 1, name: "Child 1", dob: "5-Mar-2023", gender: "Male", age: "1 year" },
      { id: 2, name: "Child 2", dob: "5-May-2021", gender: "Female", age: "3 years" },
    ]);
  
    const [selectedChild, setSelectedChild] = useState(childrenList[0]);
  
    const handleSelectChild = (child) => {
      setSelectedChild(child);
    };
  
    return (
      <div className="children-page">
        {/* Sidebar */}
        <aside className="children-sidebar">
          <div className="children-sidebar-header">
            <img src={Logo} alt="Logo" className="sidebar-logo-icon" />
            <img src={Name} alt="BabyHaven" className="sidebar-logo-text" />
          </div>
  
          <nav className="children-sidebar-menu">
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
        <div className="children-main-content">
          {/* Topbar */}
          <header className="children-topbar">
            <div className="children-search-container">
              <input
                type="text"
                placeholder="Hinted search text"
                className="children-search-input"
              />
            </div>
            <div className="children-user-info">Hello, ABC</div>
          </header>
  
          {/* Body */}
          <div className="children-body">
            {/* Cột danh sách Child */}
            <div className="children-list-column">
              <h2 className="children-list-title">Children</h2>
              {childrenList.map((child) => (
                <div
                  key={child.id}
                  className={`child-card ${
                    selectedChild && selectedChild.id === child.id ? "active" : ""
                  }`}
                  onClick={() => handleSelectChild(child)}
                >
                  <span className="child-name">{child.name}</span>
                  <span className="child-dob">DOB: {child.dob}</span>
                </div>
              ))}
              <div className="child-card add-card">
                <i className="fas fa-plus"></i>
                <span>Add Child</span>
              </div>
            </div>

           {/* Cột chi tiết */}
           <div className="children-detail-column">
            {/* Thông tin Child */}
            <div className="child-info-card card">
              <h2>{selectedChild?.name}</h2>
              <p>Gender: {selectedChild?.gender}</p>
              <p>Date of Birth: {selectedChild?.dob}</p>
              <p>Age: {selectedChild?.age}</p>
            </div>

            {/* Alert */}
            <div className="child-alerts-card card">
              <div className="alert-box medium">
                <i className="fas fa-bell"></i>
                <span>Alert Medium level</span>
                <button>Contact to Doctor</button>
              </div>
              <div className="alert-box high">
                <i className="fas fa-bell"></i>
                <span>Alert High level</span>
                <button>Contact to Doctor</button>
              </div>
            </div>

            {/* Growth information */}
            <div className="growth-card card">
              <h3>Growth information</h3>
              <div className="chart-container">
                <p>Weight / Height chart goes here</p>
                <p>Line Chart Example</p>
              </div>
            </div>

            {/* Weight - Height riêng */}
            <div className="sub-charts">
              <div className="weight-card card">
                <h4>Weight</h4>
                <p>Chart for Weight</p>
              </div>
              <div className="height-card card">
                <h4>Height</h4>
                <p>Chart for Height</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChildrenPage;
