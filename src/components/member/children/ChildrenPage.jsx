import React,  { useState, useEffect }  from "react";
import { useNavigate } from "react-router-dom"; // import useNavigate
import "./ChildrenPage.css";
import Sidebar from "../sidebar/Sidebar.jsx";
import NavBar from "../navbar/NavBar.jsx";
import api from "../../../config/axios.js";
import AddChild from "./AddChild.jsx";



function ChildrenPage() {
  const navigate = useNavigate();

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showAddChild, setShowAddChild] = useState(false);

  // Bấm “Add Child” => mở modal
  const handleAddChild = () => {
    setShowAddChild(true);
  };

  // Đóng modal
  const closeAddChildModal = () => {
    setShowAddChild(false);
  };

   // Gọi API
   useEffect(() => {
    api
      .get("/Children")
      .then((response) => {
        console.log("API response:", response.data);
        if (response.data && response.data.data) {
          const list = response.data.data;
          setChildrenList(list); // dùng setChildrenList
          if (list.length > 0) {
            setSelectedChild(list[0]);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching children:", error);
      });
  }, []);
  
    const handleSelectChild = (child) => {
      setSelectedChild(child);
    };
 
  return (
    <div className="children-page">
      {/* Gọi Sidebar */}
      <Sidebar />

      {/* Khu vực bên phải */}
      <div className="children-main-content">
        {/* Gọi NavBar */}
        <NavBar />

          {/* Body */}
          <div className="children-body">
 {/* Danh sách Child */}
 <div className="children-list-column">
            <h2 className="children-list-title">Children</h2>

            {/* Hiển thị danh sách lấy từ API */}
            {childrenList.map((child) => (
              <div
                key={child.id}
                className={`child-card ${
                  selectedChild && selectedChild.id === child.id ? "active" : ""
                }`}
                onClick={() => handleSelectChild(child)}
              >
                <span className="child-name">{child.name}</span>
                <span className="child-dob">DOB: {child.dateOfBirth}</span>
              </div>
            ))}

            <div className="child-card add-card" onClick={handleAddChild}>
              <i className="fas fa-plus"></i>
              <span>Add Child</span>
            </div>
          </div>

                {/* CỘT CHI TIẾT: 2 cột cho thông tin, gói trong 1 .card */}
          <div className="children-detail-column card">
            {selectedChild ? (
              <>
                <h2>{selectedChild.name}</h2>
                <div className="child-info-grid">
                  <div className="info-item">
                    <span className="info-label">Date of Birth:</span>
                    <span className="info-value">{selectedChild.dateOfBirth}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Age:</span>
                    <span className="info-value">{selectedChild.age}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Gender:</span>
                    <span className="info-value">{selectedChild.gender}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Birth Weight:</span>
                    <span className="info-value">{selectedChild.birthWeight}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Birth Height:</span>
                    <span className="info-value">{selectedChild.birthHeight}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Blood Type:</span>
                    <span className="info-value">{selectedChild.bloodType}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Relationship:</span>
                    <span className="info-value">
                      {selectedChild.relationshipToMember}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p>Please select a child from the list.</p>
            )}
          </div>
        </div>
          {/* Hiển thị modal AddChild nếu showAddChild = true */}
            {showAddChild && (
                      <AddChild
                        // Truyền props closeOverlay để AddChild đóng modal
                        closeOverlay={closeAddChildModal}
                      />
                    )}

        {/* PHẦN ALERT TÁCH RIÊNG - Chỉ hiển thị khi có alertLevel */}
        {selectedChild && selectedChild.alertLevel && (
          <div className="child-alerts">
            {selectedChild.alertLevel === "medium" && (
              <div className="alert-box medium">
                <i className="fas fa-bell"></i>
                <span>Alert Medium level</span>
                <button>Contact to Doctor</button>
              </div>
            )}
            {selectedChild.alertLevel === "high" && (
              <div className="alert-box high">
                <i className="fas fa-bell"></i>
                <span>Alert High level</span>
                <button>Contact to Doctor</button>
              </div>
            )}
          </div>
        )}

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
  );
}

export default ChildrenPage;
