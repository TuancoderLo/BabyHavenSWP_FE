import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChildrenPage.css";
import AddMilestone from "./AddMilestone.jsx";
import GrowthChart from "./GrowthChart.jsx";
import childApi from "../../../../services/childApi";
import AddChild from "./AddChild";
import AddRecord from "./AddRecord";
import ExpertAdvice from "../../../../services/expertAdviceData";
import AddRecordButton from "../../../../components/common/buttons/AddRecord";
import AddMilestoneButton from "../../../../components/common/buttons/AddMilestone";
import AddChildButton from "../../../../components/common/buttons/AddChild";
import memberShipApi from "../../../../services/memberShipApi";
import alertApi from "../../../../services/alertApi";
import AIChat from "./AIChat.jsx";
import Alert from "./Alert.jsx";
import PopupNotification from "../../../../layouts/Member/popUp/PopupNotification";


function ChildrenPage() {
  const navigate = useNavigate();

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [growthRecords, setGrowthRecords] = useState([]);
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [selectedTool, setSelectedTool] = useState("BMI");
  const [latestAlert, setLatestAlert] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("error"); // default dùng kiểu error
  
  const memberId = localStorage.getItem("memberId");

  // Gọi danh sách alert hiện có khi thay đổi selectedChild
  useEffect(() => {
    if (selectedChild && memberId) {
      alertApi
        .getAlertsByChild(
          selectedChild.name,
          selectedChild.dateOfBirth,
          memberId
        )
        .then((res) => {
          if (res.data && Array.isArray(res.data.data)) {
            const alertsData = res.data.data;
            alertsData.sort(
              (a, b) => new Date(b.alertDate) - new Date(a.alertDate)
            );
            setAlerts(alertsData || null);
            const newestUnread = alertsData.find((alert) => !alert.isRead);
            setLatestAlert(newestUnread || alertsData[0] || null); // Lấy alert chưa đọc hoặc mới nhất
          } else {
            setAlerts(null);
            setLatestAlert(null);
          }
        })
        .catch((err) => {
          console.error("Error fetching alerts:", err);
          setAlerts(null);
          setLatestAlert(null);
        });
    } else {
      setAlerts(null);
      setLatestAlert(null);
    }
  }, [selectedChild, memberId]);

  // Kiểm tra memberId khi component mount
  useEffect(() => {
    if (!memberId) {
      console.error("No memberId found in localStorage");
      navigate("/member");
    }
  }, [memberId, navigate]);

  // Gọi API lấy danh sách trẻ em theo memberId
  useEffect(() => {
    if (!memberId) return;

    setIsLoading(true);
    childApi
      .getByMember(memberId)
      .then((response) => {
        console.log("API response:", response.data);
        if (response.data && response.data.data) {
          const list = response.data.data;
          setChildrenList(list);
          if (list.length > 0) {
            handleSelectChild(list[0]);
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

  const handleSelectChild = async (child) => {
    setIsLoading(true);
    try {
      const response = await childApi.getChildByName(child, memberId);
      setSelectedChild(response.data.data);

      try {
        const parentName = localStorage.getItem("name");
        const growthRecordsResponse = await childApi.getGrowthRecords(
          child.name,
          parentName
        );
        if (growthRecordsResponse.data) {
          let records = Array.isArray(growthRecordsResponse.data)
            ? growthRecordsResponse.data
            : [growthRecordsResponse.data];

          records = records.filter(
            (record) => record && (record.weight || record.height)
          );
          records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setGrowthRecords(records);

          if (records.length > 0) {
            setSelectedRecord(records[0]);
          } else {
            setSelectedRecord(null);
          }
        }
      } catch (error) {
        console.error("Error fetching growth records:", error);
        setSelectedRecord(null);
        setGrowthRecords([]);
      }
    } catch (error) {
      console.error("Error fetching child info:", error);
      setSelectedChild(child);
      setSelectedRecord(null);
      setGrowthRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddChild = async () => {
    try {
      const membershipRes = await memberShipApi.getMemberMembership(memberId);
      const membershipData = membershipRes.data?.data;
      console.log("Membership data:", membershipData);
  
      const activeMembership = Array.isArray(membershipData)
        ? membershipData.find(
            (membership) =>
              membership.status === "Active" && membership.isActive === true
          )
        : membershipData?.status === "Active" && membershipData?.isActive === true
        ? membershipData
        : null;
  
      console.log("Active membership:", activeMembership);
      if (!activeMembership) {
        // Thay vì alert, hiển thị popup lỗi
        setPopupType("error");
        setPopupMessage("No active membership found. Please activate a membership plan.");
        setShowPopup(true);
        return;
      }
  
      const membershipPackage = activeMembership.packageName;
      let maxChildren = 1;
      if (membershipPackage === "Standard") {
        maxChildren = 2;
      } else if (membershipPackage === "Premium") {
        maxChildren = 6;
      }
  
      if (childrenList.length >= maxChildren) {
        setPopupType("error");
        setPopupMessage(
          `You have reached the limit of ${maxChildren} children for the ${membershipPackage} plan. Please upgrade your plan.`
        );
        setShowPopup(true);
        return;
      }
  
      setShowAddChildModal(true);
    } catch (error) {
      console.error("Error checking membership plan:", error);
      setPopupType("error");
      setPopupMessage("Unable to check membership package. Please try again.");
      setShowPopup(true);
    }
  };
  

  const closeOverlay = () => {
    setShowAddChildModal(false);
  };

  const handleShowMilestoneModal = () => {
    setShowAddMilestoneModal(true);
  };

  const closeMilestoneOverlay = () => {
    setShowAddMilestoneModal(false);
  };

  const handleAddRecord = () => {
    if (!selectedChild) {
      console.error("Please select a child first.");
      return;
    }
    setShowAddRecordModal(true);
  };

  const closeRecordOverlay = () => {
    setShowAddRecordModal(false);
    setRefreshTrigger((prev) => prev + 1);
    if (selectedChild) {
      handleSelectChild(selectedChild); // Refresh lại dữ liệu, bao gồm alerts
    }
  };

  const handleOpenChat = () => {
    if (!selectedChild) {
      alert("Please select a child to chat with AI.");
      return;
    }
    setShowChatModal(true);
  };

  const handleCloseChat = () => {
    setShowChatModal(false);
  };

  const calculateAge = (dateOfBirth) => {
    // Logic giữ nguyên
    if (!dateOfBirth) return "0 days";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    const diffTime = Math.abs(today - birthDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years === 0 && months === 0) return `${diffDays} days`;
    if (years < 1) return `${months} months`;
    return `${years} years old`;
  };

  const getAgeInMonths = (dateOfBirth) => {
    // Logic giữ nguyên
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

  const getAgeInYears = (ageInMonths) => {
    return Math.floor(ageInMonths / 12);
  };

  const renderExpertAdvice = () => {
    // Logic giữ nguyên
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
    // Logic giữ nguyên
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const calculateGrowthChange = (records) => {
    // Logic giữ nguyên
    if (!records || records.length < 2) return null;
    const latest = records[0];
    const previous = records[1];
    const latestBMI = calculateBMI(latest.weight, latest.height);
    const previousBMI = calculateBMI(previous.weight, previous.height);
    return {
      weight: {
        change: (latest.weight - previous.weight).toFixed(1),
        trend: latest.weight > previous.weight ? "increase" : "decrease",
      },
      height: {
        change: (latest.height - previous.height).toFixed(1),
        trend: latest.height > previous.height ? "increase" : "decrease",
      },
      bmi: {
        change:
          latestBMI && previousBMI
            ? (latestBMI - previousBMI).toFixed(1)
            : "N/A",
        trend: latestBMI > previousBMI ? "increase" : "decrease",
      },
    };
  };

  const renderGrowthAnalysis = () => {
    // Logic giữ nguyên
    const records = growthRecords.slice(0, 2);
    let changes = calculateGrowthChange(records);
    if (!changes) {
      changes = {
        weight: { change: "N/A", trend: null },
        height: { change: "N/A", trend: null },
        bmi: { change: "N/A", trend: null },
      };
    }
    return (
      <div className="growth-analysis-section">
        <h3>Growth Analysis</h3>
        <div className="analysis-content">
          <div
            className={`analysis-item ${
              changes.weight.trend !== null ? changes.weight.trend : "--"
            }`}
          >
            <span className="analysis-label">Weight Change:</span>
            <span className="analysis-value">
              {changes.weight.change !== "N/A" && changes.weight.change > 0
                ? "+"
                : ""}
              {changes.weight.change} kg
            </span>
          </div>
          <div
            className={`analysis-item ${
              changes.height.trend !== null ? changes.height.trend : "--"
            }`}
          >
            <span className="analysis-label">Height Change:</span>
            <span className="analysis-value">
              {changes.height.change !== "N/A" && changes.height.change > 0
                ? "+"
                : ""}
              {changes.height.change} cm
            </span>
          </div>
          <div
            className={`analysis-item ${
              changes.bmi.trend !== null ? changes.bmi.trend : "--"
            }`}
          >
            <span className="analysis-label">BMI Change:</span>
            <span className="analysis-value">
              {changes.bmi.change !== "N/A"
                ? (changes.bmi.change > 0 ? "+" : "") + changes.bmi.change
                : "N/A"}
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
      </div>
    );
  };

  const renderAnalyzeWithAI = () => {
    // Logic giữ nguyên
    return (
      <div className="analyze-ai-section">
        <div className="analyze-ai-title">
          Discover <span className="highlight">BabyHaven AI</span>: Your Partner
          in Parenting!
        </div>
        <button
          className="analyze-ai-btn"
          onClick={handleOpenChat}
          disabled={!selectedChild}
        >
          <i className="fas fa-robot"></i>
          Analyze with AI
        </button>
        <AIChat
          isOpen={showChatModal}
          onClose={handleCloseChat}
          selectedChild={selectedChild}
        />
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
            <h2>
              Welcome to <span className="highlight">BabyHaven</span>, let's
              start
            </h2>
            <h2>your journey here with your baby.</h2>
          </div>
          <button className="add-first-child-button" onClick={handleAddChild}>
            Add your first child's informations
          </button>
        </div>
      ) : (
        <>
          <div className="child-slots-container">
            {[1, 2, 3, 4, 5, 6].map((slotNumber) => {
              const child = childrenList[slotNumber - 1];
              const showAddChild =
                !child &&
                childrenList.length < 6 &&
                slotNumber === childrenList.length + 1;

              if (!child && !showAddChild) return null;

              return (
                <div
                  key={slotNumber}
                  className={`child-slot child-slot-${slotNumber} ${
                    !child ? "empty" : ""
                  } 
                  ${
                    selectedChild && selectedChild.name === child?.name
                      ? "selected"
                      : ""
                  } 
                  ${child?.gender?.toLowerCase() || ""}`}
                  onClick={() =>
                    child ? handleSelectChild(child) : handleAddChild()
                  }
                >
                  {child ? (
                    <div className="child-info">
                      <span className="child-name">{child.name}</span>
                      <span className="child-age">
                        <i
                          className="fas fa-calendar-alt"
                          style={{ marginRight: "4px" }}
                        ></i>
                        {calculateAge(child.dateOfBirth)}
                      </span>
                      <i
                        className={`fas ${
                          child.gender === "Male" ? "fa-mars" : "fa-venus"
                        } gender-icon ${child.gender.toLowerCase()}`}
                      ></i>
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

          <div className="child-details-section">
            {selectedChild ? (
              <>
                <h2
                  className={`child-name ${
                    selectedChild.gender === "Male" ? "male" : "female"
                  }`}
                >
                  {selectedChild.name}
                </h2>
                <div className="child-details-content">
                  <div className="detail-row">
                    <span className="detail-label">Age:</span>
                    <span className="detail-value">
                      {calculateAge(selectedChild.dateOfBirth)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date of Birth:</span>
                    <span className="detail-value">
                      {selectedChild.dateOfBirth
                        ? new Date(
                            selectedChild.dateOfBirth
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "Not set"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Gender:</span>
                    <span className="detail-value">
                      {selectedChild.gender || "Not set"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p>Select a child to view details</p>
            )}
          </div>

          <div className="milestone-section">
            <div className="milestone-content">
              Want to track every precious milestone of your little one?
            </div>
            <AddMilestoneButton
              onClick={handleShowMilestoneModal}
              disabled={!selectedChild}
            />
            <button
              className="show-milestone-button"
              onClick={() => navigate("/member/milestone")}
              disabled={!selectedChild}
            >
              Show Milestones
            </button>
          </div>

          <div className="latest-record-section">
            <h3 className="latest-record-title">Latest Growth Record</h3>
            <div className="latest-record-content">
              <div className="record-info">
                <div className="record-row">
                  <span className="record-label">Height:</span>
                  <span className="record-value">
                    {selectedRecord
                      ? `${selectedRecord.height || "--"} cm`
                      : "-- cm"}
                  </span>
                </div>
                <div className="record-row">
                  <span className="record-label">Weight:</span>
                  <span className="record-value">
                    {selectedRecord
                      ? `${selectedRecord.weight || "--"} kg`
                      : "-- kg"}
                  </span>
                </div>
                <div className="record-row">
                  <span className="record-label">BMI:</span>
                  <span className="record-value">
                    {selectedRecord &&
                    selectedRecord.height &&
                    selectedRecord.weight
                      ? (
                          selectedRecord.weight /
                          Math.pow(selectedRecord.height / 100, 2)
                        ).toFixed(1)
                      : "--"}
                  </span>
                </div>
              </div>
              <AddRecordButton
                onClick={handleAddRecord}
                disabled={!selectedChild}
              />
            </div>
          </div>

          <div className="alert-item-section">
            <Alert
              alert={latestAlert}
              alerts={alerts}
              member={{
                memberId: memberId,
                name: localStorage.getItem("name"),
                email: localStorage.getItem("name"),
              }}
              child={selectedChild}
              growthRecords={growthRecords}
            />
          </div>

          <div className="growth-chart-section">
          <h2>
  Growth chart
  <div className="chart-filters">
    <span className={`filter-item ${selectedTool === "BMI" ? "active" : ""}`} onClick={() => setSelectedTool("BMI")}>BMI</span>
    <span className={`filter-item ${selectedTool === "Height" ? "active" : ""}`} onClick={() => setSelectedTool("Height")}>Height</span>
    <span className={`filter-item ${selectedTool === "Weight" ? "active" : ""}`} onClick={() => setSelectedTool("Weight")}>Weight</span>
    <span className={`filter-item ${selectedTool === "ALL" ? "active" : ""}`} onClick={() => setSelectedTool("ALL")}>All</span>
  </div>
</h2>
            <div className="chart-area">
              {selectedChild ? (
                <>
                  {(() => {
                    const ageInMonths = getAgeInMonths(
                      selectedChild.dateOfBirth
                    );
                    const ageInYears = getAgeInYears(ageInMonths);
                    return (
                      <GrowthChart
                        childName={selectedChild.name}
                        selectedTool={selectedTool}
                        onRecordSelect={setSelectedRecord}
                        refreshTrigger={refreshTrigger}
                        gender={selectedChild.gender}
                        ageInMonths={ageInMonths}
                        ageInYears={ageInYears}
                      />
                    );
                  })()}
                </>
              ) : (
                <div className="no-child-selected">
                  <p>Please select a child to view their growth chart</p>
                </div>
              )}
            </div>
          </div>

          {renderAnalyzeWithAI()}
          {renderGrowthAnalysis()}

          <div className="expert-advice-section">
            <h3>Expert Advice for your child</h3>
            <div className="advice-content">{renderExpertAdvice()}</div>
          </div>
        </>
      )}

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
          onSuccess={() => {}}
        />
      )}
      {showPopup && (
      <PopupNotification
        type={popupType}
        message={popupMessage}
        onClose={() => setShowPopup(false)}
      />
    )}
    </div>
  );
}

export default ChildrenPage;
