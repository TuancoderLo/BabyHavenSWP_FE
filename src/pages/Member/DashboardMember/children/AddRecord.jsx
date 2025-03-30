import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import childApi from "../../../../services/childApi";
import calculateBMI from "../../../../services/bmiUtils";
import BabyGrowth from "../../../../assets/baby_growth.png";
// Cập nhật import các hàm validation mới
import {
  validateGrowthRecordErrors,
  validateGrowthRecordWarnings
} from "../../../../data/childValidations";
import "./AddRecord.css";

const AddRecord = ({ child, memberId, closeOverlay }) => {
  if (!child) {
    return (
      <div
        className="add-record-overlay"
        onClick={(e) => e.target === e.currentTarget && closeOverlay()}
      >
        <div className="add-record-wizard" onClick={(e) => e.stopPropagation()}>
          <div className="notification-board">
            <h2>No Child Selected</h2>
            <p>Please select a child or add a new child to continue.</p>
            <button type="button" onClick={closeOverlay}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [childDetails, setChildDetails] = useState(null);
  const [growthForm, setGrowthForm] = useState({
    createdAt: "",
    weight: "",
    height: "",
    headCircumference: "",
    bmi: "",
    notes: "",
    muscleMass: "",
    chestCircumference: "",
    nutritionalStatus: "",
    ferritinLevel: "",
    triglycerides: "",
    bloodSugarLevel: "",
    physicalActivityLevel: "",
    heartRate: "",
    bloodPressure: "",
    bodyTemperature: "",
    oxygenSaturation: "",
    sleepDuration: "",
    vision: "",
    hearing: "",
    immunizationStatus: "",
    mentalHealthStatus: "",
    growthHormoneLevel: "",
    attentionSpan: "",
    neurologicalReflexes: "",
    developmentalMilestones: "",
  });
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});

  useEffect(() => {
    const fetchChildDetails = async () => {
      try {
        const response = await childApi.getChildByName(child, memberId);
        setChildDetails(response.data.data);
      } catch (err) {
        console.error("Error fetching child details:", err);
      }
    };
    fetchChildDetails();
  }, [child, memberId]);

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
    return years === 0 && months === 0
      ? `${diffDays} days`
      : years < 1
        ? `${months} months`
        : `${years} years old`;
  };

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setGrowthForm((prev) => {
        const updated = { ...prev, [name]: value };
        if (name === "weight" || name === "height") {
          updated.bmi = calculateBMI(
            name === "weight" ? value : prev.weight,
            name === "height" ? value : prev.height
          );
        }
        return updated;
      });
      // Cập nhật cảnh báo ngay khi dữ liệu thay đổi
      const newWarnings = validateGrowthRecordWarnings(
        { ...growthForm, [name]: value },
        child.dateOfBirth
      );
      setWarnings(newWarnings);
    },
    [growthForm, child.dateOfBirth]
  );

  const validateForm = useCallback(() => {
    const errorResults = validateGrowthRecordErrors(growthForm, child.dateOfBirth);
    const warningResults = validateGrowthRecordWarnings(growthForm, child.dateOfBirth);
    setErrors(errorResults);
    setWarnings(warningResults);
    // Chỉ block submit nếu có lỗi (warnings chỉ mang tính gợi ý)
    return Object.keys(errorResults).length === 0;
  }, [growthForm, child.dateOfBirth]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    try {
      const growthPayload = {
        name: child.name,
        dateOfBirth: child.dateOfBirth,
        recordedBy: memberId,
        createdAt: growthForm.createdAt || new Date().toISOString().split("T")[0],
        weight: Number(growthForm.weight) || 0,
        height: Number(growthForm.height) || 0,
        headCircumference: Number(growthForm.headCircumference) || 0,
        notes: growthForm.notes,
        muscleMass: Number(growthForm.muscleMass) || 0,
        chestCircumference: Number(growthForm.chestCircumference) || 0,
        nutritionalStatus: growthForm.nutritionalStatus,
        ferritinLevel: Number(growthForm.ferritinLevel) || 0,
        triglycerides: Number(growthForm.triglycerides) || 0,
        bloodSugarLevel: Number(growthForm.bloodSugarLevel) || 0,
        physicalActivityLevel: growthForm.physicalActivityLevel,
        heartRate: Number(growthForm.heartRate) || 0,
        bloodPressure: Number(growthForm.bloodPressure) || 0,
        bodyTemperature: Number(growthForm.bodyTemperature) || 0,
        oxygenSaturation: Number(growthForm.oxygenSaturation) || 0,
        sleepDuration: Number(growthForm.sleepDuration) || 0,
        vision: growthForm.vision,
        hearing: growthForm.hearing,
        immunizationStatus: growthForm.immunizationStatus,
        mentalHealthStatus: growthForm.mentalHealthStatus,
        growthHormoneLevel: Number(growthForm.growthHormoneLevel) || 0,
        attentionSpan: growthForm.attentionSpan,
        neurologicalReflexes: growthForm.neurologicalReflexes,
        developmentalMilestones: growthForm.developmentalMilestones,
      };
      await childApi.createGrowthRecord(growthPayload);
      // Hiển thị modal thành công, thay vì gọi closeOverlay() ngay
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error submitting growth record:", err);
    }
  }, [child, memberId, growthForm, validateForm]);

  return (
    <>
      <div
        className="add-record-overlay"
        onClick={(e) => e.target === e.currentTarget && closeOverlay()}
      >
        <div className="add-record-wizard" onClick={(e) => e.stopPropagation()}>
          <button className="close-button-record" onClick={closeOverlay}>
            ×
          </button>

          <div className="wizard-left">
            <div className="blue-bar" />
            <div className="wizard-left-content">
              <h1 className="main-title">
                Enter a new growth record to track your baby's health
              </h1>
              <div className="babygrowth-img">
                <img src={BabyGrowth} alt="Baby Growth" />
              </div>
              <div className="child-info-card">
                <h3>Child Information</h3>
                <div className="child-info-details">
                  <p>
                    <strong>Name:</strong> {child.name}
                  </p>
                  <div className="info-row">
                    <p>
                      <strong>Date of Birth:</strong>{" "}
                      {new Date(child.dateOfBirth).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Age:</strong> {calculateAge(child.dateOfBirth)}
                    </p>
                    {child.gender && (
                      <p className={`gender-tag ${child.gender.toLowerCase()}`}>
                        {child.gender}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="wizard-content">
            <div className="step-form">
              {/* Step 1: Basic Measurements */}
              <div className="form-section date-section">
                <h4>Record Date</h4>
                <input
                  type="date"
                  value={growthForm.createdAt}
                  onChange={handleChange}
                  name="createdAt"
                  max={new Date().toISOString().split("T")[0]}
                  className={errors.createdAt ? "error-input" : ""}
                />
                {errors.createdAt && (
                  <p className="error-text">{errors.createdAt}</p>
                )}
                {warnings.createdAt && (
                  <p className="warning-text-record">{warnings.createdAt}</p>
                )}
              </div>

              <div className="form-section">
                <h4>Basic Measurements</h4>
                <div className="measurements-section">
                  <div>
                    <label>Baby's weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={growthForm.weight}
                      onChange={handleChange}
                      min="0"
                      className={errors.weight ? "error-input" : ""}
                      onKeyDown={(e) =>
                        ["-", "e"].includes(e.key) && e.preventDefault()
                      }
                    />
                    {errors.weight && (
                      <p className="error-text">{errors.weight}</p>
                    )}
                    {warnings.weight && (
                      <p className="warning-text-record">{warnings.weight}</p>
                    )}
                  </div>
                  <div>
                    <label>Baby's height (cm)</label>
                    <input
                      type="number"
                      name="height"
                      value={growthForm.height}
                      onChange={handleChange}
                      min="0"
                      className={errors.height ? "error-input" : ""}
                      onKeyDown={(e) =>
                        ["-", "e"].includes(e.key) && e.preventDefault()
                      }
                    />
                    {errors.height && (
                      <p className="error-text">{errors.height}</p>
                    )}
                    {warnings.height && (
                      <p className="warning-text-record">{warnings.height}</p>
                    )}
                  </div>
                  <div>
                    <label>Head circumference (cm)</label>
                    <input
                      type="number"
                      name="headCircumference"
                      value={growthForm.headCircumference}
                      onChange={handleChange}
                      min="0"
                      onKeyDown={(e) =>
                        ["-", "e"].includes(e.key) && e.preventDefault()
                      }
                    />
                  </div>
                  <div>
                    <label>BMI (kg/m²)</label>
                    <input
                      type="number"
                      value={calculateBMI(growthForm.weight, growthForm.height)}
                      readOnly
                    />
                  </div>
                </div>
                <div className="notes-section">
                  <label>Notes</label>
                  <input
                    type="text"
                    name="notes"
                    value={growthForm.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Dropdown 1: Recommendations for Your Baby (Step 2) */}
              <details>
                <summary>Recommendations for Your Baby (click to expand)</summary>
                <div className="form-section">
                  <h4>Nutritional Information</h4>
                  <div className="measurements-section">
                    <div>
                      <label>Nutritional status</label>
                      <input
                        type="text"
                        name="nutritionalStatus"
                        value={growthForm.nutritionalStatus}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label>Physical activity level</label>
                      <input
                        type="text"
                        name="physicalActivityLevel"
                        value={growthForm.physicalActivityLevel}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <h4>Blood Metrics</h4>
                  <div className="measurements-section">
                    <div>
                      <label>Ferritin level</label>
                      <input
                        type="number"
                        name="ferritinLevel"
                        value={growthForm.ferritinLevel}
                        onChange={handleChange}
                        min="0"
                        onKeyDown={(e) =>
                          ["-", "e"].includes(e.key) && e.preventDefault()
                        }
                      />
                    </div>
                    <div>
                      <label>Triglycerides</label>
                      <input
                        type="number"
                        name="triglycerides"
                        value={growthForm.triglycerides}
                        onChange={handleChange}
                        min="0"
                        onKeyDown={(e) =>
                          ["-", "e"].includes(e.key) && e.preventDefault()
                        }
                      />
                    </div>
                    <div>
                      <label>Blood sugar level</label>
                      <input
                        type="number"
                        name="bloodSugarLevel"
                        value={growthForm.bloodSugarLevel}
                        onChange={handleChange}
                        min="0"
                        onKeyDown={(e) =>
                          ["-", "e"].includes(e.key) && e.preventDefault()
                        }
                      />
                    </div>
                    <div>
                      <label>Chest circumference (cm)</label>
                      <input
                        type="number"
                        name="chestCircumference"
                        value={growthForm.chestCircumference}
                        onChange={handleChange}
                        min="0"
                        onKeyDown={(e) =>
                          ["-", "e"].includes(e.key) && e.preventDefault()
                        }
                      />
                    </div>
                  </div>
                </div>
              </details>

              {/* Dropdown 2: Additional Health Measurements (Step 3) */}
              <details>
                <summary>Additional Health Measurements (click to expand)</summary>
                <div className="form-section">
                  <h4>Vital Signs</h4>
                  <div className="measurements-section">
                    <div>
                      <label>Heart rate</label>
                      <input
                        type="number"
                        name="heartRate"
                        value={growthForm.heartRate}
                        onChange={handleChange}
                        min="0"
                        onKeyDown={(e) =>
                          ["-", "e"].includes(e.key) && e.preventDefault()
                        }
                      />
                    </div>
                    <div>
                      <label>Blood pressure</label>
                      <input
                        type="number"
                        name="bloodPressure"
                        value={growthForm.bloodPressure}
                        onChange={handleChange}
                        min="0"
                        onKeyDown={(e) =>
                          ["-", "e"].includes(e.key) && e.preventDefault()
                        }
                      />
                    </div>
                    <div>
                      <label>Body temperature (°C)</label>
                      <input
                        type="number"
                        name="bodyTemperature"
                        value={growthForm.bodyTemperature}
                        onChange={handleChange}
                        min="0"
                        className={errors.bodyTemperature ? "error-input" : ""}
                        onKeyDown={(e) =>
                          ["-", "e"].includes(e.key) && e.preventDefault()
                        }
                      />
                      {errors.bodyTemperature && (
                        <p className="error-text">{errors.bodyTemperature}</p>
                      )}
                      {warnings.bodyTemperature && (
                        <p className="warning-text-record">
                          {warnings.bodyTemperature}
                        </p>
                      )}
                    </div>
                    <div>
                      <label>Oxygen saturation (%)</label>
                      <input
                        type="number"
                        name="oxygenSaturation"
                        value={growthForm.oxygenSaturation}
                        onChange={handleChange}
                        min="0"
                        className={errors.oxygenSaturation ? "error-input" : ""}
                        onKeyDown={(e) =>
                          ["-", "e"].includes(e.key) && e.preventDefault()
                        }
                      />
                      {errors.oxygenSaturation && (
                        <p className="error-text">{errors.oxygenSaturation}</p>
                      )}
                      {warnings.oxygenSaturation && (
                        <p className="warning-text-record">
                          {warnings.oxygenSaturation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <h4>Development Metrics</h4>
                  <div className="measurements-section">
                    <div>
                      <label>Sleep duration (hrs)</label>
                      <input
                        type="number"
                        name="sleepDuration"
                        value={growthForm.sleepDuration}
                        onChange={handleChange}
                        min="0"
                        className={errors.sleepDuration ? "error-input" : ""}
                        onKeyDown={(e) =>
                          ["-", "e"].includes(e.key) && e.preventDefault()
                        }
                      />
                      {errors.sleepDuration && (
                        <p className="error-text">{errors.sleepDuration}</p>
                      )}
                      {warnings.sleepDuration && (
                        <p className="warning-text-record">
                          {warnings.sleepDuration}
                        </p>
                      )}
                    </div>
                    <div>
                      <label>Growth hormone level</label>
                      <input
                        type="number"
                        name="growthHormoneLevel"
                        value={growthForm.growthHormoneLevel}
                        onChange={handleChange}
                        min="0"
                        className={errors.growthHormoneLevel ? "error-input" : ""}
                        onKeyDown={(e) =>
                          ["-", "e"].includes(e.key) && e.preventDefault()
                        }
                      />
                      {errors.growthHormoneLevel && (
                        <p className="error-text">{errors.growthHormoneLevel}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <h4>Sensory and Health Status</h4>
                  <div className="measurements-section">
                    <div>
                      <label>Hearing</label>
                      <input
                        type="text"
                        name="hearing"
                        value={growthForm.hearing}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label>Vision</label>
                      <input
                        type="text"
                        name="vision"
                        value={growthForm.vision}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label>Mental health status</label>
                      <input
                        type="text"
                        name="mentalHealthStatus"
                        value={growthForm.mentalHealthStatus}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label>Immunization status</label>
                      <input
                        type="text"
                        name="immunizationStatus"
                        value={growthForm.immunizationStatus}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <h4>Cognitive Development</h4>
                  <div className="measurements-section">
                    <div>
                      <label>Attention span</label>
                      <input
                        type="text"
                        name="attentionSpan"
                        value={growthForm.attentionSpan}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label>Neurological reflexes</label>
                      <input
                        type="text"
                        name="neurologicalReflexes"
                        value={growthForm.neurologicalReflexes}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="notes-section">
                    <label>Developmental milestones</label>
                    <input
                      type="text"
                      name="developmentalMilestones"
                      value={growthForm.developmentalMilestones}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </details>
              <div className="step-buttons">
                <button
                  type="button"
                  className="confirm-button-step1"
                  onClick={handleSubmit}
                >
                  Submit Record
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showSuccessModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowSuccessModal(false);
            closeOverlay();
            window.location.reload();
          }}
        >
          <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="success-modal-header">
              <h3>Success!</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowSuccessModal(false);
                  closeOverlay();
                  window.location.reload();
                }}
              >
                ×
              </button>
            </div>
            <div className="success-modal-body">
              <p>Growth record added successfully!</p>
            </div>
            <div className="success-modal-footer">
              <button
                className="success-modal-button"
                onClick={() => {
                  setShowSuccessModal(false);
                  closeOverlay();
                  window.location.reload();
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

AddRecord.propTypes = {
  child: PropTypes.object,
  memberId: PropTypes.string,
  closeOverlay: PropTypes.func.isRequired,
};

export default AddRecord;
