import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChildrenPage.css";
import api from "../../../config/axios.js";
import calculateBMI from "../../../services/bmiUtils.js";
import childApi from "../../../services/childApi";
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

  // Gọi API lấy danh sách trẻ em theo memberId
  useEffect(() => {
    if (!memberId) return;

    childApi.getByMember(memberId)
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

  const [selectedTool, setSelectedTool] = useState("BMI");
    const handleToolChange  = (e) => {
    setSelectedTool(e.target.value);
  };

  return (
    <div className="children-page-container">
      {/* Khối chính: gồm cột bên trái (Children) và phần còn lại */}
      <div className="main-content">
        {/* Box 1: Danh sách Children */}
        <div className="children-box card">
          <h2 className="section-title">Children</h2>
          {childrenList.map((child) => (
            <div
              key={child.id}
              className={`child-item ${
                selectedChild && selectedChild.id === child.id ? "active" : ""
              }`}
              onClick={() => handleSelectChild(child)}
            >
              <span className="child-name">{child.name}</span>
              <span className="child-dob">DOB: {child.dateOfBirth}</span>
            </div>
          ))}
          <button className="add-child-btn" onClick={handleAddChild}>
            + Add Child</button>
        </div>

        {/* Box 2: Chi tiết Child + Alert */}
<div className="child-detail-box-card">
        <div className="child-detail-box card">
          {selectedChild ? (
            <>
              <h3 className="child-title">{selectedChild.name}</h3>
              <p>Gender: {selectedChild.gender}</p>
              <p>Date of birth: {selectedChild.dateOfBirth}</p>
              <p>Age: {selectedChild.age} year(s)</p>
              <p>Birth weight: {selectedChild.birthWeight}</p>
              <p>Birth height: {selectedChild.birthHeight}</p>
              <p>Blood type: {selectedChild.bloodType}</p>
              <p>Relationship: {selectedChild.relationshipToMember}</p> 
              {/* Alert nếu có */}
              {renderAlertBox(selectedChild.alertLevel)}
            </>
          ) : (
            <p>Please select a child.</p>
          )}
          </div>
        <div className="add-milestones card">
        <button className="add-milestones-btn">Add Milestones</button>
        </div>
        </div>

        {/* Box 3: Growth chart */}
        <div className="growth-chart-box card">
           {/* Nút Child Education + Analyze with AI */}
      <div className="feature-buttons">
        <button className="feature-btn">Child Education</button>
        <button className="feature-btn">Analyze with AI</button>
          </div>
          <div className="growth-chart-box card">
            <div className ="chart-header">
          <h3>Growth chart</h3>
            <div className="chart-toolbar">
          <select
            className="toolbar-select"
            value={selectedTool}
            onChange={handleToolChange}
          >
            <option value="BMI">BMI</option>
            <option value="Head measure">Head measure</option>
            <option value="Global std">Global std</option>
            <option value="Milestone">Milestone</option>
          </select>
              </div>
              </div>
            <div className="chart-area">[ Chart placeholder ]</div>
            </div>
                  {/* Box 4: Thông tin Weight, Height, Connect to doctor, Add a record */}
        <div className="growth-info-box card">
          <p>Height: 80 cm</p>
          <p>Weight: 30 kg</p>
            <p>Feb 15, 2025</p>
            <div className="action-buttons">
            <button>Connect to doctor</button>
            <button>Add a record</button>
          </div>
          </div>
           
        </div>
      </div>

      {/* Box 5: Activities */}
      <div className="activities-box card">
        <h2>Activities</h2>
        <p>List of activities or records here...</p>
      </div>
      {showAddChildModal && <AddChild closeOverlay={closeOverlay} />}
    </div>
  );
}

export default ChildrenPage;