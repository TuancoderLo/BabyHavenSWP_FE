import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChildrenPage.css";

import AddMilestone from "./AddMilestone.jsx";

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
  const [growthRecords, setGrowthRecords] = useState([]); // Thêm state mới

  //show add milestone
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const handleShowMilestoneModal = () => {
    setShowAddMilestoneModal(true);
  };

  const closeMilestoneOverlay = () => {
    setShowAddMilestoneModal(false);
  };

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
        const parentName = localStorage.getItem("name");
        const growthRecordsResponse = await childApi.getGrowthRecords(child.name, parentName);
        console.log("Growth Records Response:", growthRecordsResponse);

        if (growthRecordsResponse.data) {
          let records = Array.isArray(growthRecordsResponse.data)
            ? growthRecordsResponse.data
            : [growthRecordsResponse.data];

          // Lọc bỏ các record không có weight hoặc height
          records = records.filter(record => record && (record.weight || record.height));

          // Sắp xếp theo thời gian gần nhất
          records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setGrowthRecords(records); // Cập nhật state growthRecords

          if (records.length > 0) {
            // Lấy record mới nhất
            const latestRecord = records[0];
            console.log("Latest Growth Record:", latestRecord);
            setSelectedRecord(latestRecord);
          } else {
            setSelectedRecord(null);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu growth record:", error);
        setSelectedRecord(null);
        setGrowthRecords([]); // Reset growth records khi có lỗi
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin trẻ:", error);
      setSelectedChild(child);
      setSelectedRecord(null);
      setGrowthRecords([]); // Reset growth records khi có lỗi
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
  const handleToolChange = (e) => {
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

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    // Chuyển height từ cm sang m
    const heightInMeters = height / 100;
    // Tính BMI = weight / (height * height)
    return weight / (heightInMeters * heightInMeters);
  };

  const calculateGrowthChange = (records) => {
    if (!records || records.length < 2) return null;

    const latest = records[0];
    const previous = records[1];

    // Tính BMI cho cả record mới nhất và record trước đó
    const latestBMI = calculateBMI(latest.weight, latest.height);
    const previousBMI = calculateBMI(previous.weight, previous.height);

    return {
      weight: {
        change: (latest.weight - previous.weight).toFixed(1),
        trend: latest.weight > previous.weight ? 'increase' : 'decrease'
      },
      height: {
        change: (latest.height - previous.height).toFixed(1),
        trend: latest.height > previous.height ? 'increase' : 'decrease'
      },
      bmi: {
        change: latestBMI && previousBMI ? (latestBMI - previousBMI).toFixed(1) : 'N/A',
        trend: latestBMI > previousBMI ? 'increase' : 'decrease'
      }
    };
  };

  const renderGrowthAnalysis = () => {
    if (!selectedChild || !selectedRecord) return null;

    // Lấy 2 record gần nhất từ state growthRecords
    const records = growthRecords.slice(0, 2);

    const changes = calculateGrowthChange(records);
    if (!changes) return null;

    return (
      <div className="growth-analysis-section">
        <h3>Growth Analysis</h3>
        <div className="analysis-content">
          <div className={`analysis-item ${changes.weight.trend}`}>
            <span className="analysis-label">Weight Change:</span>
            <span className="analysis-value">
              {changes.weight.change > 0 ? '+' : ''}{changes.weight.change} kg
            </span>
          </div>
          <div className={`analysis-item ${changes.height.trend}`}>
            <span className="analysis-label">Height Change:</span>
            <span className="analysis-value">
              {changes.height.change > 0 ? '+' : ''}{changes.height.change} cm
            </span>
          </div>
          <div className={`analysis-item ${changes.bmi.trend}`}>
            <span className="analysis-label">BMI Change:</span>
            <span className="analysis-value">
              {changes.bmi.change !== 'N/A' ? (changes.bmi.change > 0 ? '+' : '') + changes.bmi.change : 'N/A'}
            </span>
          </div>
        </div>
        <button className="analyze-ai-btn" onClick={() => console.log('AI Analysis coming soon')}>
          <i className="fas fa-robot"></i>
          Analyze with AI
        </button>
      </div>
    );
  };

  return (
    <div className="parent">
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
            <h2>{selectedChild.name}</h2>
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

      {/* Milestone section */}
      <div className="milestone-section">
      <div className="milestone-content">
        Want to track every precious milestone of your little one?
      </div>
      <button className="add-milestone-button" onClick={handleShowMilestoneModal}>
        Add Milestone
      </button>
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
            <div className="record-row">
              <span className="record-label">BMI:</span>
              <span className="record-value">
                {selectedRecord && selectedRecord.height && selectedRecord.weight
                  ? (selectedRecord.weight / Math.pow(selectedRecord.height / 100, 2)).toFixed(1)
                  : '--'}
              </span>
            </div>
          </div>
          <button
            className="add-record-btn"
            onClick={handleAddRecord}
            disabled={!selectedChild}
          >
            Add Record
          </button>
        </div>
      </div>

      {/* Health Alert Section */}
      <div className="health-alert-section">
        <div className="health-alert-title">
          Health Alert
        </div>
        <div className={`health-alert-content ${selectedChild?.healthAlert ? 'warning' : 'healthy'}`}>
          {selectedChild?.healthAlert || "Your child's health is in good condition"}
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

      {/* Growth Analysis Section */}
      {renderGrowthAnalysis()}

      {/* Expert advice section */}
      <div className="expert-advice-section">
        <h3>Expert Advice for your child</h3>
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
       {showAddMilestoneModal && (
        <AddMilestone closeOverlay={closeMilestoneOverlay} onSuccess={() => { /* refresh data nếu cần */ }} />
      )}
    </div>
  );  
}

export default ChildrenPage;