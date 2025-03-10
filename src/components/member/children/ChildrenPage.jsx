import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChildrenPage.css";
import api from "../../../config/axios.js";
import GrowthChart from "./GrowthChart.jsx";
import childApi from "../../../services/childApi";
import AddChild from "./AddChild";
import AddRecord from "./AddRecord"; // Import the AddRecord component at the top

function ChildrenPage() {
  const navigate = useNavigate();

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  //set chiều cao và cân nặng dựa vào record
  const [selectedRecord, setSelectedRecord] = useState(null);

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
          // if (list.length > 0) {
          //   setSelectedChild(list[0]);
          // }
          if (list.length === 0) {
            handleAddChild()
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching children:", error);
      });
  }, [memberId]);

  const handleSelectChild = async (child) => {
    try {
      const response = await childApi.getChildByName(child, memberId);
      console.log("Child: " + response)
      console.log("Lấy thông tin chi tiết của trẻ:", response.data);
      setSelectedChild(response.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin trẻ:", error);
      setSelectedChild(child);
    }
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

  // State to control the AddRecord overlay
const [showAddRecordModal, setShowAddRecordModal] = useState(false);

const handleAddRecord = () => {
  if (!selectedChild) {
    console.error("Please select a child first.");
    return;
  }
  setShowAddRecordModal(true);
};

const closeRecordOverlay = () => {
  setShowAddRecordModal(false);
};

  return (
    <div className="children-page-container">
      {/* Khối chính: gồm cột bên trái (Children) và phần còn lại */}
      <div className="top-bar-member">
  <h2 className="class= section-title-child">Children</h2>
  <div className="feature-buttons">
    <div className="child-education">
    <button>Child Education</button>
    </div>
    <div className="analyze-AI">
    <button>Analyze with AI</button>
    </div>
  </div>
</div>

      <div className="main-content">
        {/* Box 1: Danh sách Children */}
        
        <div className="children-box-card">
          {childrenList.map((child) => (
            <div
              key={child.name}
              className={`child-item ${
                selectedChild && selectedChild.name === child.name ? "active" : "" 
              }`} 
              onClick={() => handleSelectChild(child)}
            >
              <span className="child-name">{child.name}</span>
              {/* <span className="child-dob">DOB: {child.dateOfBirth}</span> */}
            </div>
          ))}
<button className="add-child-btn" onClick={handleAddChild} title="Add Child">
  <i className="fas fa-plus"></i>
</button>
        </div>

        {/* Box 2: Chi tiết Child + Alert */}
<div className="child-detail-box-around">
        <div className="child-detail-box-card">
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
        <div className="add-milestones-card">
        <button className="add-milestones-btn">Add Milestones</button>
        </div>
        </div>


        {/* Box 3: Growth chart */}
        <div className="growth-chart-box-around">
          <div className="growth-chart-box-card">
            <div className="chart-header">
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
            <div className="chart-box">
              <div className="chart-area">
                {selectedChild && selectedChild.name && (
                  <GrowthChart
                    childName={selectedChild.name}
                    selectedTool={selectedTool}
                    onRecordSelect={(record) => {
                      console.log("Parent got record:", record);
                      setSelectedRecord(record);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
                  {/* Box 4: Thông tin Weight, Height, Connect to doctor, Add a record */}
                  <div className="growth-info-box-card">
            {selectedRecord ? (
              <>
                <p>Height: {selectedRecord.height || "--"} cm</p>
                <p>Weight: {selectedRecord.weight || "--"} kg</p>
              </>
            ) : (
              <>
                <p>Height: -- cm</p>
                <p>Weight: -- kg</p>
                <p>No record selected</p>
              </>
            )}
            <div className="action-buttons">
            <div className="connect-doctor">
             <button>Connect to doctor</button>
            </div>
            <div className="add-record">
            <button onClick={handleAddRecord}>Add a record</button>
            </div>
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
      {showAddRecordModal && (
  <AddRecord 
    child={selectedChild}
    memberId={memberId} 
    closeOverlay={closeRecordOverlay} 
  /> 
)}
    </div>
  );
}

export default ChildrenPage;