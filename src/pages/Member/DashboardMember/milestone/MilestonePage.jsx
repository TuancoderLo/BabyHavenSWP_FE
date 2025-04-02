import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import childApi from "../../../../services/childApi";
import MilestoneApi from "../../../../services/milestoneApi";
import AddMilestone from "../children/AddMilestone";
import AddMilestoneButton from "../../../../components/common/buttons/AddMilestone";
import "./MilestonePage.css";

function MilestonePage() {
  const navigate = useNavigate();
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [systemMilestones, setSystemMilestones] = useState([]);
  const [childMilestones, setChildMilestones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [customMilestone, setCustomMilestone] = useState({ milestoneName: "", age: "" });
  const [filterOption, setFilterOption] = useState("all");
  const [badges, setBadges] = useState([]);
  const milestoneListRef = useRef(null);
  const memberId = localStorage.getItem("memberId");

  // Fetch children list
  useEffect(() => {
    if (!memberId) {
      navigate("/member");
      return;
    }

    setIsLoading(true);
    childApi
      .getByMember(memberId)
      .then((response) => {
        if (response.data && response.data.data) {
          const list = response.data.data;
          setChildrenList(list);
          if (list.length > 0) {
            handleSelectChild(list[0]);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching children:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [memberId, navigate]);

  // Fetch system milestones and child milestones when selectedChild changes
  useEffect(() => {
    if (!selectedChild) return;

    const fetchData = async () => {
      try {
        // Fetch all system milestones
        const systemMilestonesResponse = await MilestoneApi.getAllMilestones();
        if (systemMilestonesResponse.data && systemMilestonesResponse.data.data) {
          console.log("System Milestones:", systemMilestonesResponse.data.data);
          const sortedMilestones = systemMilestonesResponse.data.data.sort(
            (a, b) => a.minAge - b.minAge
          );
          setSystemMilestones(sortedMilestones);
        }

        // Fetch child milestones
        const childMilestonesResponse = await MilestoneApi.getMilestoneByChild(selectedChild, memberId);
        if (childMilestonesResponse.data && childMilestonesResponse.data.data) {
          setChildMilestones(childMilestonesResponse.data.data);
        }

        // Calculate badges based on achieved milestones
        const completedCount = childMilestonesResponse.data.data.length;
        const newBadges = [];
        if (completedCount >= 2) newBadges.push("Early Achiever");
        if (completedCount >= 4) newBadges.push("Milestone Master");
        setBadges(newBadges);
      } catch (error) {
        console.error("Error fetching milestones:", error);
      }
    };

    fetchData();
  }, [selectedChild, memberId]);

  // Scroll to the relevant milestone based on child's age
  useEffect(() => {
    if (!selectedChild || !systemMilestones.length || !milestoneListRef.current) return;

    const ageInMonths = calculateAgeInMonths(selectedChild.dateOfBirth);
    const fetchMilestonesByAge = async () => {
      try {
        const response = await MilestoneApi.getMilestonesByAgeRange(ageInMonths, ageInMonths);
        if (response.data && response.data.data && response.data.data.length > 0) {
          const relevantMilestone = response.data.data[0];
          const milestoneIndex = systemMilestones.findIndex(
            (milestone) => milestone.milestoneId === relevantMilestone.milestoneId
          );
          if (milestoneIndex !== -1) {
            const milestoneElement = milestoneListRef.current.children[
              systemMilestones.length - 1 - milestoneIndex
            ];
            if (milestoneElement) {
              milestoneElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching milestones by age range:", error);
      }
    };

    fetchMilestonesByAge();
  }, [systemMilestones, selectedChild]);

  const handleSelectChild = (child) => {
    setSelectedChild(child);
  };

  const calculateAgeInMonths = (dateOfBirth) => {
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

  const calculateAge = (dateOfBirth) => {
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

  const completionPercentage = () => {
    if (!systemMilestones.length) return 0;
    const completedMilestones = childMilestones.filter((cm) =>
      systemMilestones.some((sm) => sm.milestoneId === cm.milestoneId && !sm.isPersonal)
    );
    return (completedMilestones.length / systemMilestones.length) * 100;
  };

  const getUpcomingMilestones = () => {
    if (!selectedChild) return [];
    const ageInMonths = calculateAgeInMonths(selectedChild.dateOfBirth);
    return systemMilestones.filter(
      (milestone) =>
        milestone.minAge > ageInMonths &&
        milestone.minAge <= ageInMonths + 1 &&
        !childMilestones.some((cm) => cm.milestoneId === milestone.milestoneId)
    );
  };

  const handleAddCustomMilestone = async () => {
    if (!customMilestone.milestoneName || !customMilestone.age) return;

    const newMilestone = {
      milestoneName: customMilestone.milestoneName,
      minAge: parseInt(customMilestone.age),
      maxAge: parseInt(customMilestone.age) + 1,
      description: "Custom milestone added by user.",
      isPersonal: true,
      importance: "Medium",
      category: "custom",
    };

    try {
      const response = await MilestoneApi.createMilestone(newMilestone);
      if (response.data && response.data.data) {
        const updatedMilestones = [...systemMilestones, response.data.data].sort(
          (a, b) => a.minAge - b.minAge
        );
        setSystemMilestones(updatedMilestones);
        setCustomMilestone({ milestoneName: "", age: "" });
        setShowAddModal(false);
      }
    } catch (error) {
      console.error("Error creating custom milestone:", error);
    }
  };

  const handleToggleMilestone = async (milestoneId) => {
    // Check if the milestone is already achieved
    const isAlreadyAchieved = childMilestones.some(
      (cm) => cm.milestoneId === milestoneId && cm.status === "Achieved"
    );

    if (isAlreadyAchieved) {
      return; // Do nothing if the milestone is already achieved
    }

    // Find the milestone details from systemMilestones
    const milestone = systemMilestones.find((sm) => sm.milestoneId === milestoneId);
    if (!milestone) {
      console.error("Milestone not found:", milestoneId);
      alert("Milestone not found.");
      return;
    }

    // Get the current date in YYYY-MM-DD format
    const achievedDate = new Date().toISOString().split("T")[0];

    // Create the new ChildMilestone object
    const newChildMilestone = {
      milestoneId: milestoneId,
      childName: selectedChild.name,
      dateOfBirth: selectedChild.dateOfBirth,
      memberId: memberId,
      achievedDate: achievedDate,
      status: "Achieved",
      notes: "",
      guidelines: milestone.description || "",
      importance: milestone.importance || "Medium",
      category: milestone.category || "General",
    };

    try {
      // Call the createChildMilestone API to create a new ChildMilestone
      const createResponse = await MilestoneApi.createChildMilestone(newChildMilestone);

      if (createResponse.data && createResponse.data.data) {
        // Add the new ChildMilestone to the local state
        const updatedChildMilestones = [...childMilestones, createResponse.data.data];
        setChildMilestones(updatedChildMilestones);

        // Recalculate badges based on the updated childMilestones
        const completedCount = updatedChildMilestones.filter(
          (cm) => cm.status === "Achieved"
        ).length;
        const newBadges = [];
        if (completedCount >= 2) newBadges.push("Early Achiever");
        if (completedCount >= 4) newBadges.push("Milestone Master");
        setBadges(newBadges);
      }
    } catch (error) {
      console.error("Error creating ChildMilestone:", error);
      alert("Failed to mark milestone as achieved. Please try again.");
    }
  };

  const filteredMilestones = () => {
    let filtered = [...systemMilestones];
    filtered.sort((a, b) => a.minAge - b.minAge);

    if (filterOption === "achieved") {
      filtered = filtered.filter((milestone) =>
        childMilestones.some((cm) => cm.milestoneId === milestone.milestoneId)
      );
    } else if (filterOption === "upcoming") {
      const ageInMonths = selectedChild ? calculateAgeInMonths(selectedChild.dateOfBirth) : 0;
      filtered = filtered.filter(
        (milestone) =>
          milestone.minAge > ageInMonths &&
          !childMilestones.some((cm) => cm.milestoneId === milestone.milestoneId)
      );
    } else if (filterOption === "overdue") {
      const ageInMonths = selectedChild ? calculateAgeInMonths(selectedChild.dateOfBirth) : 0;
      filtered = filtered.filter(
        (milestone) =>
          milestone.maxAge < ageInMonths &&
          !childMilestones.some((cm) => cm.milestoneId === milestone.milestoneId)
      );
    }
    return filtered;
  };

  const handleShowMilestoneModal = () => {
    if (!selectedChild) {
      alert("Please select a child to add a milestone.");
      return;
    }
    setShowAddMilestoneModal(true);
  };

  const closeMilestoneOverlay = () => {
    setShowAddMilestoneModal(false);
    if (selectedChild) {
      MilestoneApi.getMilestoneByChild(selectedChild, memberId)
        .then((response) => {
          if (response.data && response.data.data) {
            setChildMilestones(response.data.data);
          }
        })
        .catch((error) => {
          console.error("Error refreshing child milestones:", error);
        });
    }
  };

  return (
    <div className="parent-milestone-page">
      {isLoading ? (
        <div className="loading-container-milestone-page">
          <div className="loading-spinner-milestone-page"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {/* Child List (div1-div6) */}
          {[1, 2, 3, 4, 5, 6].map((slotNumber) => {
            const child = childrenList[slotNumber - 1];
            if (!child) return null;

            return (
              <div
                key={slotNumber}
                className={`child-slot-milestone-page child-slot-${slotNumber}-milestone-page ${
                  selectedChild && selectedChild.name === child.name ? "selected-milestone-page" : ""
                } ${child.gender?.toLowerCase() || ""}-milestone-page`}
                onClick={() => handleSelectChild(child)}
              >
                <div className="child-info-milestone-page">
                  <span className="child-name-milestone-page">{child.name}</span>
                  <span className="child-age-milestone-page">
                    <i className="fas fa-calendar-alt" style={{ marginRight: "4px" }}></i>
                    {calculateAge(child.dateOfBirth)}
                  </span>
                  <i
                    className={`fas ${
                      child.gender === "Male" ? "fa-mars" : "fa-venus"
                    } gender-icon-milestone-page ${child.gender.toLowerCase()}-milestone-page`}
                  ></i>
                </div>
              </div>
            );
          })}

          {/* System Milestones Roadmap (div7) */}
          <div className="milestone-roadmap-milestone-page">
            <h2>System Milestones Roadmap</h2>
            <div className="progress-bar-milestone-page">
              <div
                className="progress-fill-milestone-page"
                style={{ width: `${completionPercentage()}%` }}
              ></div>
            </div>
            {getUpcomingMilestones().length > 0 && (
              <div className="notifications-milestone-page">
                <h3>Upcoming Milestones</h3>
                {getUpcomingMilestones().map((milestone) => (
                  <div key={milestone.milestoneId} className="notification-item-milestone-page">
                    {milestone.milestoneName} (at {milestone.minAge} months)
                  </div>
                ))}
              </div>
            )}
            <div className="controls-milestone-page">
              <select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
              >
                <option value="all">All Milestones</option>
                <option value="achieved">Achieved</option>
                <option value="upcoming">Upcoming</option>
                <option value="overdue">Overdue</option>
              </select>
              <AddMilestoneButton
                onClick={handleShowMilestoneModal}
                disabled={!selectedChild}
              />
            </div>
            <div className="roadmap-container-milestone-page">
              <div className="milestone-list-milestone-page" ref={milestoneListRef}>
                {filteredMilestones().map((milestone) => {
                  const isAchieved = childMilestones.some(
                    (cm) => cm.milestoneId === milestone.milestoneId
                  );
                  const childMilestone = childMilestones.find(
                    (cm) => cm.milestoneId === milestone.milestoneId
                  );
                  return (
                    <div
                      key={milestone.milestoneId}
                      className={`milestone-item-milestone-page ${isAchieved ? "achieved-milestone-page" : ""}`}
                      onClick={() => setShowDetailsModal(milestone)}
                    >
                      <div className="milestone-checkbox-milestone-page">
                        <div
                          className={`custom-checkbox ${isAchieved ? "checked" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isAchieved) {
                              handleToggleMilestone(milestone.milestoneId);
                            }
                          }}
                        >
                          {isAchieved && <span className="checkmark">✔</span>}
                        </div>
                      </div>
                      <div className="milestone-content-milestone-page">
                        <div className="milestone-title-milestone-page">{milestone.milestoneName}</div>
                        <div className="milestone-age-milestone-page">
                          {milestone.minAge} - {milestone.maxAge} months
                        </div>
                        <div className="milestone-description-milestone-page">
                          {milestone.description}
                        </div>
                        {isAchieved && childMilestone?.achievedDate && (
                          <div className="achieved-date-milestone-page">
                            Achieved on: {new Date(childMilestone.achievedDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Achieved Milestones (div8) */}
          <div className="achieved-milestones-milestone-page">
            <h2>Achieved Milestones</h2>
            {badges.length > 0 && (
              <div className="badges-milestone-page">
                <h3>Badges Earned</h3>
                {badges.map((badge, index) => (
                  <span key={index} className="badge-item-milestone-page">
                    {badge}
                  </span>
                ))}
              </div>
            )}
            <div className="achieved-list-milestone-page">
              {childMilestones.length > 0 ? (
                childMilestones.map((cm) => {
                  const milestone = systemMilestones.find(
                    (sm) => sm.milestoneId === cm.milestoneId
                  );
                  return (
                    <div key={cm.id} className="achieved-item-milestone-page">
                      <div className="achieved-title-milestone-page">
                        {milestone ? milestone.milestoneName : "Custom Milestone"}
                      </div>
                      <div className="achieved-date-milestone-page">
                        Achieved on: {new Date(cm.achievedDate).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No milestones achieved yet.</p>
              )}
            </div>
          </div>

          {showAddModal && (
            <div className="modal-milestone-page">
              <div className="modal-content-milestone-page">
                <h3>Add Custom Milestone</h3>
                <input
                  type="text"
                  placeholder="Milestone Name"
                  value={customMilestone.milestoneName}
                  onChange={(e) =>
                    setCustomMilestone({ ...customMilestone, milestoneName: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Age (months)"
                  value={customMilestone.age}
                  onChange={(e) =>
                    setCustomMilestone({ ...customMilestone, age: e.target.value })
                  }
                />
                <div className="modal-buttons-milestone-page">
                  <button onClick={handleAddCustomMilestone}>Save</button>
                  <button onClick={() => setShowAddModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {showAddMilestoneModal && (
            <AddMilestone
              child={selectedChild}
              memberId={memberId}
              closeOverlay={closeMilestoneOverlay}
              onSuccess={() => {
                // Optional: Add any additional success logic here
              }}
            />
          )}

          {showDetailsModal && (
            <div className="modal-milestone-page">
              <div className="modal-content-milestone-page">
                <h3>{showDetailsModal.milestoneName}</h3>
                <p>{showDetailsModal.description}</p>
                <p>Age Range: {showDetailsModal.minAge} - {showDetailsModal.maxAge} months</p>
                <p>Tips: Encourage this milestone by engaging in related activities.</p>
                <button onClick={() => setShowDetailsModal(null)}>Close</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MilestonePage;