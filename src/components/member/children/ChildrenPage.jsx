import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChildrenPage.css";

import AddMilestone from "./AddMilestone.jsx";

import GrowthChart from "./GrowthChart.jsx";
import childApi from "../../../services/childApi";
import AddChild from "./AddChild";
import AddRecord from "./AddRecord"; // Import the AddRecord component at the top
import ExpertAdvice from "../../../services/expertAdviceData";
import AddRecordButton from './common/buttons/AddRecord';
import AddMilestoneButton from './common/buttons/AddMilestone';
import AddChildButton from './common/buttons/AddChild';
import memberShipApi from "../../../services/memberShipApi";
import alertApi from "../../../services/alertApi";

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

  //const alert 
  const [latestAlert, setLatestAlert] = useState(null);
  
  function AlertItem({ alert }) {
    const [expanded, setExpanded] = useState(false);
    const limit = 80;
    const truncate = (text) => {
      if (!text) return "";
      return text.length > limit ? text.slice(0, limit) + "..." : text;
    };
  
    const messageShort = truncate(alert.message);
  
    const openOverlay = () => setExpanded(true);
    const closeOverlay = () => setExpanded(false);
  
    // Xác định lớp CSS dựa theo severityLevel
    function getSeverityClass(level) {
      switch (level?.toLowerCase()) {
        case "low":
          return "healthy";
        case "medium":
          return "warning";
        case "high":
          return "alert-high";
        default:
          return "healthy";
      }
    }
  
    // Nếu severity là medium hoặc high, áp dụng thêm lớp fadeable
    const additionalClass =
      ["medium", "high"].includes(alert.severityLevel?.toLowerCase())
        ? "fadeable"
        : "";
  
    return (
      <>
        <div
          className={`health-alert-content ${getSeverityClass(
            alert.severityLevel
          )} ${additionalClass}`}
          onClick={openOverlay}
          style={{ cursor: "pointer" }}
        >
          <p>{messageShort}</p>
        </div>
  
        {expanded && (
          <div className="modal-overlay" onClick={closeOverlay}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeOverlay}>
                ×
              </button>
              <h2>Full Alert Message</h2>
              <p>{alert.message}</p>
            </div>
          </div>
        )}
      </>
    );
  }
  
  
  // Lấy memberId từ localStorage
  const memberId = localStorage.getItem("memberId");

 // Gọi alert khi thay đổi selectedChild
 useEffect(() => {
  if (selectedChild && memberId) {
    alertApi
      .getAlert(selectedChild.name, selectedChild.dateOfBirth, memberId)
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) {
          const alerts = res.data.data;

          // 1) Sắp xếp theo alertDate giảm dần
          alerts.sort((a, b) => new Date(b.alertDate) - new Date(a.alertDate));

          // 2) Tìm alert đầu tiên có isRead = false
          const newestUnread = alerts.find((alert) => alert.isRead === false);

          // 3) Nếu không có, set null
          setLatestAlert(newestUnread || null);
        } else {
          setLatestAlert(null);
        }
      })
      .catch((err) => {
        console.error(err);
        setLatestAlert(null);
      });
  } else {
    setLatestAlert(null);
  }
}, [selectedChild, memberId]);


  // Kiểm tra memberId khi component mount
  useEffect(() => {
    if (!memberId) {
      console.error("No memberId found in localStorage");
      navigate("/member"); // hoặc trang thông báo lỗi nếu cần
    }
  }, [memberId, navigate]);

  // Gọi API lấy danh sách trẻ em theo memberId
  // Add isLoading state
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  
  // Update the useEffect that fetches children data
  useEffect(() => {
    if (!memberId) return;
  
    setIsLoading(true);
    childApi.getByMember(memberId)
      .then((response) => {
        console.log("API response:", response.data);
        if (response.data && response.data.data) {
          const list = response.data.data;
          setChildrenList(list);
          if (list.length > 0) {
            handleSelectChild(list[0]); // Tự động chọn trẻ đầu tiên
          } else {
            setShowWelcomeMessage(true);
          }
        } else {
          setShowWelcomeMessage(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching children:", error);
        setShowWelcomeMessage(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
    }, [memberId]);
  
  // Update the handleSelectChild function
  const handleSelectChild = async (child) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };
  // Hàm chuyển sang trang thêm trẻ
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  const handleAddChild = async () => {
    try {
      // 1) Gọi API lấy thông tin gói membership
      const membershipRes = await memberShipApi.getMemberMembership(memberId);
      const membershipData = membershipRes.data?.data;
  
      // 2) Giả sử membershipData có trường membershipPackageName = 'Free' | 'Standard' | 'Premium'
      const membershipPackage = membershipData?.packageName; 
      // Hoặc tuỳ API trả về, bạn thay đổi key cho đúng
  
      // 3) Xác định giới hạn trẻ
      let maxChildren = 1; // Mặc định Free = 1
      if (membershipPackage === "Standard") {
        maxChildren = 2;
      } else if (membershipPackage === "Premium") {
        maxChildren = 6;
      }
      // (Nếu membershipPackage là "Free", maxChildren giữ nguyên = 1)
  
      // 4) Kiểm tra số trẻ hiện tại
      if (childrenList.length >= maxChildren) {
        alert(`You have reached the limit of ${maxChildren} children for the ${membershipPackage} plan. Please upgrade your plan.`);

        return; // Không cho thêm
      }
  
      // 5) Nếu còn slot, mở modal thêm trẻ
      setShowAddChildModal(true);
  
    } catch (error) {
      console.error("Error checking membership plan:", error);
      // Tuỳ ý xử lý thêm, ví dụ alert
      alert("Unable to check membership package. Please try again.");
    }
  };
  

  const closeOverlay = () => {
    setShowAddChildModal(false);
  };

  const [selectedTool, setSelectedTool] = useState("BMI");
 

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
        <button 
            className="connect-doctor-button" 
            onClick={() => navigate("/member/doctor-consultation")}
          >
            <i className="fas fa-stethoscope"></i>
            Connect to doctor
          </button>
        <button className="analyze-ai-btn" onClick={() => console.log('AI Analysis coming soon')}>
          <i className="fas fa-robot"></i>
          Analyze with AI
        </button>
      </div>
    );
  };

  return (
    <div className="parent">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      ) : childrenList.length === 0 ? (
        <div className="no-children-container">
          <div className="welcome-message">
            <h2>Welcome to <span className="highlight">BabyHaven</span>, let's start</h2>
            <h2>your journey here with your baby.</h2>
          </div>
          <button 
            className="add-first-child-button" 
            onClick={handleAddChild}
          >
            Add your first child's informations
          </button>
        </div>
      ) : (
        <>
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
                  className={`child-slot child-slot-${slotNumber} ${!child ? 'empty' : ''} 
                  ${selectedChild && selectedChild.name === child?.name ? 'selected' : ''} 
                  ${child?.gender?.toLowerCase() || ''}`}
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
                    <AddChildButton
                      onClick={handleAddChild}
                      className="add-child-slot-button"
                    />
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
          <AddMilestoneButton
            onClick={handleShowMilestoneModal}
            disabled={!selectedChild}
          />
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
              <AddRecordButton
                onClick={handleAddRecord}
                disabled={!selectedChild}
              />
            </div>
          </div>

{/* Health Alert Section */}
<div className="health-alert-section">
  <div className="health-alert-title">Health Alert</div>

  {latestAlert ? (
    <AlertItem alert={latestAlert} />
  ) : (
    <div className="health-alert-content healthy">
      Your child's health is in good condition
    </div>
  )}
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

          {/* Action buttons
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
          </button> */}
        </>
      )}

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
  <AddMilestone
    child={selectedChild}
    memberId={memberId}
    closeOverlay={closeMilestoneOverlay}
    onSuccess={() => {
      // refresh dữ liệu nếu cần
    }}
  />
)}
    </div>
  );  
}

export default ChildrenPage;