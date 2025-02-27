import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChildrenPage.css";
import api from "../../../config/axios.js";
import AddChild from "./AddChild";
function ChildrenPage() {
  const navigate = useNavigate();

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  // Lấy memberId từ localStorage
  const memberId = localStorage.getItem("memberId");

  // Kiểm tra memberId khi component mount
  useEffect(() => {
    if (!memberId) {
      console.error("No memberId found in localStorage");
      navigate("/member"); // hoặc trang thông báo lỗi nếu cần
    }
  }, [memberId, navigate]);

<<<<<<< HEAD
  // Lấy memberId từ localStorage
  const memberId =  localStorage.setItem("memberId", memberId); 
  console.log("Member ID:", memberId);

   // Gọi API
   useEffect(() => {
    api
      .get("/Children/member/{memberId}")
=======
  // Gọi API lấy danh sách trẻ em theo memberId
  useEffect(() => {
    if (!memberId) return;

    api.get(`/Children/member/${memberId}`)
>>>>>>> main
      .then((response) => {
        console.log("API response:", response.data);
        if (response.data && response.data.data) {
          const list = response.data.data;
          setChildrenList(list);
          if (list.length > 0) {
            setSelectedChild(list[0]);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching children:", error);
      });
  }, [memberId]);

  const handleSelectChild = (child) => {
    setSelectedChild(child);
  };
  // Hàm render Alert theo level
  const renderAlertBox = (level) => {
    const levels = {
      low: {
        text: "Alert low level",
        className: "low",
      },
      medium: {
        text: "Alert medium level",
        className: "medium",
      },
      high: {
        text: "Alert high level",
        className: "high",
      },
    };

    if (!levels[level]) return null;

    return (
      <div className={`alert-box ${levels[level].className}`}>
        <span>{levels[level].text}</span>
        <button>Contact to Doctor</button>
      </div>
    );
  };
  // Hàm chuyển sang trang thêm trẻ
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const handleAddChild = () => {
    setShowAddChildModal(true);
  };
  
  const closeOverlay = () => {
    setShowAddChildModal(false);
  };
  
  return (
    <div className="children-page-wrapper">
      {/* Cột bên trái */}
      <div className="left-section">
        <h2 className="section-title">Children</h2>
        <div className="children-list">
          {childrenList.map((child) => (
            <div
              key={child.id}
              className={`child-card ${
                selectedChild && selectedChild.id === child.id ? "active" : ""
              }`}
              onClick={() => handleSelectChild(child)}
            >
              <div className="child-card-name">{child.name}</div>
              <div className="child-card-dob">DOB: {child.dateOfBirth}</div>
            </div>
          ))}
          {/* Nút thêm trẻ */}
          <button className="add-child-btn" onClick={handleAddChild}>
            + Add Child
          </button>
        </div>
      </div>
  
      {/* Cột bên phải */}
      <div className="right-section">
        <div className="child-detail">
          {selectedChild ? (
            <div className="child-info">
              {/* Khối thông tin cơ bản */}
              <h1>{selectedChild.name}</h1>
              <div className="child-info-row">
                <div className="info-item">
                  <span className="label">Gender:</span>
                  <span>{selectedChild.gender}</span>
                </div>
                <div className="info-item">
                  <span className="label">Date of birth:</span>
                  <span>{selectedChild.dateOfBirth}</span>
                </div>
                <div className="info-item">
                  <span className="label">Age:</span>
                  <span>{selectedChild.age} years</span>
                </div>
                <div className="info-item">
                  <span className="label">Birth weight:</span>
                  <span>{selectedChild.birthWeight} kg</span>
                </div>
                <div className="info-item">
                  <span className="label">Birth height:</span>
                  <span>{selectedChild.birthHeight} cm</span>
                </div>
                <div className="info-item">
                  <span className="label">Blood type:</span>
                  <span>{selectedChild.bloodType}</span>
                </div>
                <div className="info-item">
                  <span className="label">Relationship:</span>
                  <span>{selectedChild.relationshipToMember}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-child-selected">
              Please select a child from the list.
            </div>
          )}
  
          {/* Alert nếu có */}
          {selectedChild?.alertLevel && (
            <div className="alert-section">
              {renderAlertBox(selectedChild.alertLevel)}
            </div>
          )}
  
          {/* Growth chart */}
          <div className="growth-section">
            <div className="growth-title">Growth chart</div>
            <div className="growth-chart">
              <p>Chart placeholder</p>
            </div>
          </div>
  
          {/* Các nút hành động */}
          <div className="actions-row">
            <button className="btn">Contact to doctor</button>
            <button className="btn">Add a record</button>
          </div>
  
          {/* Activities */}
          <div className="activities-section">
            <h2>Activities</h2>
            <p>List of activities or records here</p>
          </div>
        </div>
      </div>
      {showAddChildModal && <AddChild closeOverlay={closeOverlay} />}
    </div>
  );
}  
export default ChildrenPage;