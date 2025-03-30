import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./AddMilestone.css";
import MilestoneApi from "../../../../services/milestoneApi";
import childApi from "../../../../services/childApi";
import BabyGrowth from "../../../../assets/baby_growth.png";

const AddMilestone = ({ child, memberId, closeOverlay, onSuccess }) => {
  const [childDetails, setChildDetails] = useState(null);
  const [milestoneName, setMilestoneName] = useState("");
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState("Medium");
  const [category, setCategory] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [notes, setNotes] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [achievedDate, setAchievedDate] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (child && memberId) {
      childApi
        .getChildByName(child, memberId)
        .then((response) => {
          setChildDetails(response.data.data);
        })
        .catch((err) => console.error("Error fetching child details:", err));
    }
  }, [child, memberId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Payload cho Milestone
    const milestonePayload = {
      milestoneName,
      description,
      importance: "Medium",
      category: "Other",
      minAge: parseInt(minAge, 10),
      maxAge: parseInt(maxAge, 10),
      isPersonal: true,
    };

    // Payload cho ChildMilestone
    const childMilestonePayload = {
      milestoneId: null,
      childName: childDetails?.name || child,
      dateOfBirth: childDetails?.dateOfBirth,
      memberId,
      notes,
      guidelines,
      importance,
      category,
      achievedDate: achievedDate || new Date().toISOString().split("T")[0], // Mặc định ngày hiện tại nếu không nhập
    };

    try {
      // Tạo Milestone trước
      const milestoneResponse = await MilestoneApi.createMilestone(
        milestonePayload
      );
      const milestoneId = milestoneResponse.data.data.milestoneId;

      // Thêm milestoneId vào childMilestonePayload
      childMilestonePayload.milestoneId = milestoneId;

      // Tạo ChildMilestone
      const childMilestoneResponse = await MilestoneApi.createChildMilestone(
        childMilestonePayload
      );

      if (onSuccess) {
        onSuccess({
          milestone: milestoneResponse.data,
          childMilestone: childMilestoneResponse.data,
        });
      }
      closeOverlay();
    } catch (err) {
      setError("Failed to add milestone or child milestone. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderChildInfoCard = () => {
    if (!childDetails) {
      return <div>Loading child information...</div>;
    }
    return (
      <div className="child-info-card">
        <h3>Child Information</h3>
        <div className="child-info-details">
          <p>
            <strong>Name:</strong> {childDetails.name}
          </p>
          <div className="info-row">
            <p>
              <strong>Date of Birth:</strong>{" "}
              {new Date(childDetails.dateOfBirth).toLocaleDateString()}
            </p>
            {childDetails.gender && (
              <p className={`gender-tag ${childDetails.gender.toLowerCase()}`}>
                {childDetails.gender}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="add-record-overlay" onClick={closeOverlay}>
      <div className="add-record-wizard" onClick={(e) => e.stopPropagation()}>
        <div className="wizard-left">
          <div className="blue-bar"></div>
          <div className="wizard-left-content">
            <h1 className="main-title">Add New Milestone</h1>
            <div className="babygrowth-img">
              <img src={BabyGrowth} alt="Baby Growth" />
            </div>
            {renderChildInfoCard()}
          </div>
        </div>
        <div className="wizard-content">
          <div className="step-form">
            <h2>Milestone Details</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Milestone Name</label>
                <input
                  type="text"
                  value={milestoneName}
                  onChange={(e) => setMilestoneName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              {/* Các trường bổ sung cho ChildMilestone */}
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Guidelines</label>
                <textarea
                  value={guidelines}
                  onChange={(e) => setGuidelines(e.target.value)}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Achieved Date</label>
                <input
                  type="date"
                  value={achievedDate}
                  onChange={(e) => setAchievedDate(e.target.value)}
                />
              </div>
              <input type="hidden" value={minAge} />
              <input type="hidden" value={maxAge} />
              <button
                type="submit"
                className="confirm-button"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Milestone"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

AddMilestone.propTypes = {
  child: PropTypes.object,
  memberId: PropTypes.string,
  closeOverlay: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default AddMilestone;
