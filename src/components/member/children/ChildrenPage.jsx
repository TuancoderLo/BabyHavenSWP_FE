import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChildrenPage.css";
import api from "../../../config/axios.js";
import GrowthChart from "./GrowthChart.jsx";
import childApi from "../../../services/childApi";
import AddChild from "./AddChild";
import AddRecord from "./AddRecord"; // Import the AddRecord component at the top
import ExpertAdvice from "../../../services/expertAdviceData";

function ChildrenPage() {
  const navigate = useNavigate();

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  //set chiều cao và cân nặng dựa vào record
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Thêm state để trigger refresh

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
            handleSelectChild(list[0]); // Tự động chọn trẻ đầu tiên
          } else {
            handleAddChild();
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
      
      // Lấy dữ liệu growth record mới nhất
      try {
        const growthRecordsResponse = await childApi.getGrowthRecords(child.name, memberId);
        if (growthRecordsResponse.data && Array.isArray(growthRecordsResponse.data)) {
          // Sắp xếp theo thời gian gần nhất
          const sortedRecords = growthRecordsResponse.data.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          if (sortedRecords.length > 0) {
            // Lấy record mới nhất
            const latestRecord = sortedRecords[0];
            setSelectedRecord(latestRecord);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu growth record:", error);
      }
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
  // Trigger refresh khi đóng modal thêm record
  setRefreshTrigger(prev => prev + 1);
  
  // Refresh growth record data if a child is selected
  if (selectedChild) {
    handleSelectChild(selectedChild);
  }
};

  // Hàm tính tuổi và trả về chuỗi phù hợp
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '0 days';
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    // Tính số ngày
    const diffTime = Math.abs(today - birthDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    // Nếu chưa đủ 1 tháng, hiển thị số ngày
    if (years === 0 && months === 0) {
      return `${diffDays} days`;
    }
    
    // Nếu chưa đủ 1 tuổi, hiển thị số tháng
    if (years < 1) {
      return `${months} months`;
    }
    
    return `${years} years old`;
  };

  const getAgeInMonths = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months += today.getMonth() - birthDate.getMonth();
    
    if (today.getDate() < birthDate.getDate()) {
      months--;
    }
    
    return months;
  };

  const renderExpertAdvice = () => {
    if (!selectedChild || !selectedChild.dateOfBirth) {
      return (
        <div className="no-advice">
          <p>Select a child to view advice</p>
        </div>
      );
    }

    const ageInMonths = getAgeInMonths(selectedChild.dateOfBirth);
    const advice = ExpertAdvice.getAdviceForAge(ageInMonths);

    return (
      <div className="advice-sections">
        <div className="advice-section">
          <h4>Nutrition</h4>
          <ul>
            {advice.nutrition.map((item, index) => (
              <li key={`nutrition-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="advice-section">
          <h4>Development</h4>
          <ul>
            {advice.development.map((item, index) => (
              <li key={`development-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="advice-section">
          <h4>Health</h4>
          <ul>
            {advice.health.map((item, index) => (
              <li key={`health-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="parent">
      <div className="children-page-title">Children Page</div>

      {/* Child slots container */}
      <div className="child-slots-container">
        {/* Child slots */}
        {[1, 2, 3, 4, 5, 6].map((slotNumber) => {
          const child = childrenList[slotNumber - 1];
          const showAddChild = !child && childrenList.length < 6 && slotNumber === childrenList.length + 1;
          
          if (!child && !showAddChild) return null;
          
          return (
            <div 
              key={slotNumber}
              className={`child-slot child-slot-${slotNumber} ${!child ? 'empty' : ''} ${selectedChild && selectedChild.name === child?.name ? 'selected' : ''}`}
              onClick={() => child ? handleSelectChild(child) : handleAddChild()}
            >
              {child ? (
                <div className="child-info">
                  <span className="child-name">{child.name}</span>
                  <span className="child-age">
                    <i className="fas fa-calendar-alt" style={{ marginRight: '4px' }}></i>
                    {calculateAge(child.dateOfBirth)}
                  </span>
                  <i className={`fas ${child.gender === 'Male' ? 'fa-mars' : 'fa-venus'} gender-icon ${child.gender.toLowerCase()}`}></i>
                </div>
              ) : showAddChild ? (
                <div>
                  <i className="fas fa-plus"></i>
                  <span>Add Child</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Child details section */}
      <div className="child-details-section">
        {selectedChild ? (
          <>
            <h2>{selectedChild.name}'s Details</h2>
            <div className="child-details-content">
              <div className="detail-row">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{calculateAge(selectedChild.dateOfBirth)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date of Birth:</span>
                <span className="detail-value">{selectedChild.dateOfBirth || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Gender:</span>
                <span className="detail-value">{selectedChild.gender || 'Not set'}</span>
              </div>
            </div>
          </>
        ) : (
          <p>Select a child to view details</p>
        )}
      </div>

      {/* Latest Record Section */}
      <div className="latest-record-section">
        <h3 className="latest-record-title">Latest Growth Record</h3>
        <div className="latest-record-content">
          <div className="record-info">
            <div className="record-row">
              <span className="record-label">Height:</span>
              <span className="record-value">
                {selectedRecord ? `${selectedRecord.height || '--'} cm` : '-- cm'}
              </span>
            </div>
            <div className="record-row">
              <span className="record-label">Weight:</span>
              <span className="record-value">
                {selectedRecord ? `${selectedRecord.weight || '--'} kg` : '-- kg'}
              </span>
            </div>
          </div>
          <button 
            className="add-record-btn" 
            onClick={handleAddRecord}
            disabled={!selectedChild}
            style={{ opacity: selectedChild ? 1 : 0.6, cursor: selectedChild ? 'pointer' : 'not-allowed' }}
          >
            Add Growth Record
          </button>
        </div>
      </div>

      {/* Growth chart section */}
      <div className="growth-chart-section">
        <h2>
          Growth chart
          <div className="chart-filters">
            <span 
              className={`filter-item ${selectedTool === 'BMI' ? 'active' : ''}`}
              onClick={() => setSelectedTool('BMI')}
            >
              BMI
            </span>
            <span 
              className={`filter-item ${selectedTool === 'Head measure' ? 'active' : ''}`}
              onClick={() => setSelectedTool('Head measure')}
            >
              Head measure
            </span>
            <span 
              className={`filter-item ${selectedTool === 'Global std' ? 'active' : ''}`}
              onClick={() => setSelectedTool('Global std')}
            >
              Global std
            </span>
            <span 
              className={`filter-item ${selectedTool === 'Milestone' ? 'active' : ''}`}
              onClick={() => setSelectedTool('Milestone')}
            >
              Milestone
            </span>
          </div>
        </h2>
        <div className="chart-area">
          {selectedChild ? (
            <>
              <GrowthChart
                childName={selectedChild.name}
                selectedTool={selectedTool}
                onRecordSelect={setSelectedRecord}
                refreshTrigger={refreshTrigger}
              />
            </>
          ) : (
            <div className="no-child-selected">
              <p>Please select a child to view their growth chart</p>
            </div>
          )}
        </div>
      </div>

      {/* Expert advice section */}
      <div className="expert-advice-section">
        <h3>Expert Advice</h3>
        <div className="advice-content">
          {renderExpertAdvice()}
        </div>
      </div>

      {/* Action buttons */}
      <button className="action-button child-education-section">
        Child Education
      </button>

      <button className="action-button analyze-ai-section">
        Analyze with AI
      </button>

      <button 
        className="action-button connect-doctor-section"
        onClick={() => handleConnectDoctor()}
      >
        Connect to Doctor
      </button>

      <button 
        className="action-button add-record-section"
        onClick={handleAddRecord}
      >
        Add Growth Record
      </button>

      {/* Modals */}
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