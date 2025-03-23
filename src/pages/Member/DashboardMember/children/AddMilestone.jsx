import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./AddMilestone.css";
import MilestoneApi from "../../../../services/milestoneApi";
import childApi from "../../../../services/childApi";
import BabyGrowth from "../../../../assets/baby_growth.png";

// Danh sách các milestone category có sẵn
const milestoneCategories = [
  { id: "first_smile", label: "First Smile", minAge: 216, maxAge: 216 },
  { id: "first_word", label: "First Word", minAge: 216, maxAge: 216 },
  { id: "first_steps", label: "First Steps", minAge: 216, maxAge: 216 },
];

const AddMilestone = ({ child, memberId, closeOverlay, onSuccess }) => {
  // Lưu thông tin chi tiết của trẻ
  const [childDetails, setChildDetails] = useState(null);

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

  // State cho form milestone
  const [milestoneName, setMilestoneName] = useState("");
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState("Medium");
  // Thay đổi category từ input thành select với các option có sẵn
  const [category, setCategory] = useState("");
  // minAge và maxAge sẽ được set tự động khi chọn category
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      milestoneName,
      description,
      importance,
      category,
      minAge: parseInt(minAge, 10),
      maxAge: parseInt(maxAge, 10),
      isPersonal: true,
    };

    try {
      const response = await MilestoneApi.createMilestone(payload);
      if (onSuccess) onSuccess(response.data);
      closeOverlay();
    } catch (err) {
      setError("Failed to add milestone. Please try again.");
      console.error("Error adding milestone:", err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm hiển thị thông tin Child Information Card dựa trên childDetails
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
        {/* Cột trái: Thông tin Child Information */}
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
        {/* Cột phải: Form nhập thông tin Milestone */}
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
              <div className="form-group">
                <label>Importance</label>
                <select
                  value={importance}
                  onChange={(e) => setImportance(e.target.value)}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              {/* Sử dụng select cho Category và tự động cập nhật minAge/maxAge */}
              <div className="form-group">
                <label>Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setCategory(selectedId);
                    const selectedCategory = milestoneCategories.find(
                      (item) => item.id === selectedId
                    );
                    if (selectedCategory) {
                      setMinAge(selectedCategory.minAge);
                      setMaxAge(selectedCategory.maxAge);
                    }
                  }}
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {milestoneCategories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Các trường minAge và maxAge được ẩn đi */}
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
