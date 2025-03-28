import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import "react-datepicker/dist/react-datepicker.css";
import childApi from "../../../../services/childApi";
import alertApi from "../../../../services/alertApi"; // Thêm import alertApi
import "./AddRecord.css";
import calculateBMI from "../../../../services/bmiUtils";
import BabyGrowth from "../../../../assets/baby_growth.png";
import {
  validateStep2Page1 as validateStep2Page1Rules,
  validateStep2Page2 as validateStep2Page2Rules,
  validateStep2Page3 as validateStep2Page3Rules,
} from "../../../../data/childValidations";

const AddRecord = ({ child, memberId, closeOverlay }) => {
  if (!child) {
    return (
      <div className="add-record-overlay" onClick={(e) => handleOverlayClick(e)}>
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

  const [childDetails, setChildDetails] = useState(null);

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
    if (years === 0 && months === 0) return `${diffDays} days`;
    if (years < 1) return `${months} months`;
    return `${years} years old`;
  };

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
  const [currentStep, setCurrentStep] = useState(1);

  const validateForm = useCallback(
    (form = growthForm) => {
      let formErrors = {};
      if (currentStep === 1) {
        formErrors = validateStep2Page1Rules(form, child.dateOfBirth);
      } else if (currentStep === 2) {
        formErrors = validateStep2Page2Rules(form);
      } else if (currentStep === 3) {
        formErrors = validateStep2Page3Rules(form);
      }
      setErrors(formErrors);
    },
    [currentStep, growthForm, child.dateOfBirth]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setGrowthForm((prev) => {
        const updatedForm = { ...prev, [name]: value };
        validateForm(updatedForm);
        return updatedForm;
      });
    },
    [validateForm]
  );

  const validateStep = useCallback(() => {
    let stepErr = {};
    if (currentStep === 1) {
      stepErr = validateStep2Page1Rules(growthForm, child.dateOfBirth);
    } else if (currentStep === 2) {
      stepErr = validateStep2Page2Rules(growthForm);
    } else if (currentStep === 3) {
      stepErr = validateStep2Page3Rules(growthForm);
    }
    const merged = { ...errors, ...stepErr };
    setErrors(merged);
    const hasError = Object.values(stepErr).some((val) => val);
    return !hasError;
  }, [currentStep, growthForm, errors, child.dateOfBirth]);

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        closeOverlay();
      }
    },
    [closeOverlay]
  );

  const submitGrowthRecord = useCallback(async () => {
    try {
      const growthPayload = {
        name: child.name,
        dateOfBirth: child.dateOfBirth,
        recordedBy: memberId,
        createdAt: growthForm.createdAt || new Date().toISOString().split("T")[0],
        weight: growthForm.weight || 0,
        height: growthForm.height || 0,
        headCircumference: growthForm.headCircumference || 0,
        notes: growthForm.notes,
        muscleMass: growthForm.muscleMass || 0,
        chestCircumference: growthForm.chestCircumference || 0,
        nutritionalStatus: growthForm.nutritionalStatus,
        ferritinLevel: growthForm.ferritinLevel || 0,
        triglycerides: growthForm.triglycerides || 0,
        bloodSugarLevel: growthForm.bloodSugarLevel || 0,
        physicalActivityLevel: growthForm.physicalActivityLevel,
        heartRate: growthForm.heartRate || 0,
        bloodPressure: growthForm.bloodPressure || 0,
        bodyTemperature: growthForm.bodyTemperature || 0,
        oxygenSaturation: growthForm.oxygenSaturation || 0,
        sleepDuration: growthForm.sleepDuration || 0,
        vision: growthForm.vision,
        hearing: growthForm.hearing,
        immunizationStatus: growthForm.immunizationStatus,
        mentalHealthStatus: growthForm.mentalHealthStatus,
        growthHormoneLevel: growthForm.growthHormoneLevel || 0,
        attentionSpan: growthForm.attentionSpan,
        neurologicalReflexes: growthForm.neurologicalReflexes,
        developmentalMilestones: growthForm.developmentalMilestones,
      };
      const growthRes = await childApi.createGrowthRecord(growthPayload);
      console.log("Growth record created:", growthRes.data);

      // Sau khi tạo record thành công, gọi alertApi.getAlert để tạo và lấy alert
      try {
        const alertRes = await alertApi.getAlert(child.name, child.dateOfBirth, memberId);
        console.log("Alert created and fetched:", alertRes.data);
      } catch (alertErr) {
        console.error("Error creating/fetching alert:", alertErr);
      }

      return true;
    } catch (err) {
      console.error("Error saving growth record:", err);
      return false;
    }
  }, [child, memberId, growthForm]);

  const handleConfirmStep1 = useCallback(async () => {
    if (!validateStep()) return;
    const success = await submitGrowthRecord();
    if (success) closeOverlay();
  }, [validateStep, submitGrowthRecord, closeOverlay]);

  const handleContinueToNextStep = useCallback(() => {
    if (!validateStep()) return;
    if (currentStep < 3) setCurrentStep((prev) => prev + 1);
  }, [currentStep, validateStep]);

  const handleSubmitStep3 = useCallback(async () => {
    if (!validateStep()) return;
    const success = await submitGrowthRecord();
    if (success) closeOverlay();
  }, [validateStep, submitGrowthRecord, closeOverlay]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  }, [currentStep]);

  const handleClose = useCallback(() => {
    closeOverlay();
  }, [closeOverlay]);

  const renderStepContent = useMemo(() => {
    if (currentStep === 1) {
      return (
        <div className="step-form">
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
          <div className="form-section date-section">
            <h4>Record Date</h4>
            <input
              type="date"
              value={growthForm.createdAt || ""}
              onChange={(e) =>
                setGrowthForm((prev) => ({ ...prev, createdAt: e.target.value }))
              }
              max={new Date().toISOString().split("T")[0]}
              className={errors.createdAt ? "error-input" : ""}
            />
            {errors.createdAt && (
              <p className="error-text">{errors.createdAt}</p>
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
                  className={errors.weight ? "warning-input" : ""}
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                />
                {errors.weight && <p className="warning-text-record">{errors.weight}</p>}
              </div>
              <div>
                <label>Baby's height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={growthForm.height}
                  onChange={handleChange}
                  className={errors.height ? "warning-input" : ""}
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                />
                {errors.height && <p className="warning-text-record">{errors.height}</p>}
              </div>
              <div>
                <label>Head circumference (cm)</label>
                <input
                  type="number"
                  name="headCircumference"
                  value={growthForm.headCircumference}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      headCircumference: e.target.value,
                    }))
                  }
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                />
              </div>
              <div>
                <label>BMI (kg/m2)</label>
                <input
                  type="number"
                  readOnly
                  value={calculateBMI(growthForm.weight, growthForm.height)}
                />
              </div>
            </div>
            <div className="notes-section">
              <label>Notes</label>
              <input
                type="text"
                name="notes"
                value={growthForm.notes}
                onChange={(e) =>
                  setGrowthForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="step-buttons">
            <button
              type="button"
              className="confirm-button-step1"
              onClick={handleConfirmStep1}
            >
              Submit
            </button>
            <button
              type="button"
              className="next-button-record"
              onClick={handleContinueToNextStep}
            >
              Continue
            </button>
          </div>
        </div>
      );
    }
    if (currentStep === 2) {
      return (
        <div className="step-form">
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
          <h2>Recommendations for Your Baby</h2>
          <div className="form-section">
            <h4>Nutritional Information</h4>
            <div className="measurements-section">
              <div>
                <label>Nutritional status</label>
                <input
                  type="text"
                  name="nutritionalStatus"
                  value={growthForm.nutritionalStatus}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      nutritionalStatus: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label>Physical activity level</label>
                <input
                  type="text"
                  name="physicalActivityLevel"
                  value={growthForm.physicalActivityLevel}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      physicalActivityLevel: e.target.value,
                    }))
                  }
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
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      ferritinLevel: e.target.value,
                    }))
                  }
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                />
              </div>
              <div>
                <label>Triglycerides</label>
                <input
                  type="number"
                  name="triglycerides"
                  value={growthForm.triglycerides}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      triglycerides: e.target.value,
                    }))
                  }
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                />
              </div>
              <div>
                <label>Blood sugar level</label>
                <input
                  type="number"
                  name="bloodSugarLevel"
                  value={growthForm.bloodSugarLevel}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      bloodSugarLevel: e.target.value,
                    }))
                  }
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                />
              </div>
              <div>
                <label>Chest circumference (cm)</label>
                <input
                  type="number"
                  name="chestCircumference"
                  value={growthForm.chestCircumference}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      chestCircumference: e.target.value,
                    }))
                  }
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                />
              </div>
            </div>
          </div>
          <div className="step-buttons">
            <button type="button" className="previous-btn" onClick={handlePrevious}>
              Previous
            </button>
            <button
              type="button"
              className="next-button-record"
              onClick={handleContinueToNextStep}
            >
              Continue
            </button>
          </div>
        </div>
      );
    }
    if (currentStep === 3) {
      return (
        <div className="step-form">
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
          <h2>Additional Health Measurements</h2>
          <div className="form-section">
            <h4>Vital Signs</h4>
            <div className="measurements-section">
              <div>
                <label>Heart rate</label>
                <input
                  type="number"
                  name="heartRate"
                  value={growthForm.heartRate}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({ ...prev, heartRate: e.target.value }))
                  }
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                />
              </div>
              <div>
                <label>Blood pressure</label>
                <input
                  type="number"
                  name="bloodPressure"
                  value={growthForm.bloodPressure}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      bloodPressure: e.target.value,
                    }))
                  }
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                />
              </div>
              <div>
                <label>Body temperature (°C)</label>
                <input
                  type="number"
                  name="bodyTemperature"
                  value={growthForm.bodyTemperature}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      bodyTemperature: e.target.value,
                    }))
                  }
                  className={errors.bodyTemperature ? "error-input" : ""}
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                />
                {errors.bodyTemperature && (
                  <p className="error-text">{errors.bodyTemperature}</p>
                )}
              </div>
              <div>
                <label>Oxygen saturation (%)</label>
                <input
                  type="number"
                  name="oxygenSaturation"
                  value={growthForm.oxygenSaturation}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      oxygenSaturation: e.target.value,
                    }))
                  }
                  className={errors.oxygenSaturation ? "error-input" : ""}
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                />
                {errors.oxygenSaturation && (
                  <p className="error-text">{errors.oxygenSaturation}</p>
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
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      sleepDuration: e.target.value,
                    }))
                  }
                  className={errors.sleepDuration ? "error-input" : ""}
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                />
                {errors.sleepDuration && (
                  <p className="error-text">{errors.sleepDuration}</p>
                )}
              </div>
              <div>
                <label>Growth hormone level</label>
                <input
                  type="number"
                  name="growthHormoneLevel"
                  value={growthForm.growthHormoneLevel}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      growthHormoneLevel: e.target.value,
                    }))
                  }
                  className={errors.growthHormoneLevel ? "error-input" : ""}
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
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
                  onChange={(e) =>
                    setGrowthForm((prev) => ({ ...prev, hearing: e.target.value }))
                  }
                />
              </div>
              <div>
                <label>Vision</label>
                <input
                  type="text"
                  name="vision"
                  value={growthForm.vision}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({ ...prev, vision: e.target.value }))
                  }
                />
              </div>
              <div>
                <label>Mental health status</label>
                <input
                  type="text"
                  name="mentalHealthStatus"
                  value={growthForm.mentalHealthStatus}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      mentalHealthStatus: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label>Immunization status</label>
                <input
                  type="text"
                  name="immunizationStatus"
                  value={growthForm.immunizationStatus}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      immunizationStatus: e.target.value,
                    }))
                  }
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
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      attentionSpan: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label>Neurological reflexes</label>
                <input
                  type="text"
                  name="neurologicalReflexes"
                  value={growthForm.neurologicalReflexes}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      neurologicalReflexes: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="notes-section">
              <label>Developmental milestones</label>
              <input
                type="text"
                name="developmentalMilestones"
                value={growthForm.developmentalMilestones}
                onChange={(e) =>
                  setGrowthForm((prev) => ({
                    ...prev,
                    developmentalMilestones: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="step-buttons">
            <button type="button" className="previous-btn" onClick={handlePrevious}>
              Previous
            </button>
            <button
              type="button"
              className="confirm-button-step1"
              onClick={handleSubmitStep3}
            >
              Submit Record
            </button>
          </div>
        </div>
      );
    }
    return null;
  }, [
    currentStep,
    child,
    growthForm,
    errors,
    handleConfirmStep1,
    handleContinueToNextStep,
    handlePrevious,
    handleSubmitStep3,
  ]);

  return (
    <div className="add-record-overlay" onClick={handleOverlayClick}>
      <div className="add-record-wizard" onClick={(e) => e.stopPropagation()}>
        <button className="close-button-record" onClick={handleClose}>
          ×
        </button>
        <div className="wizard-left">
          <div className="blue-bar"></div>
          <div className="wizard-left-content">
            <h1 className="main-title">
              Enter a new growth record to track your baby's health automatically
            </h1>
            <div className="babygrowth-img">
              <img src={BabyGrowth} alt="Baby Growth" />
            </div>
            <div className="step-progress">
              <div className="step-item">
                <div
                  className={`step-circle ${
                    currentStep > 1 ? "completed" : currentStep === 1 ? "active" : ""
                  }`}
                >
                  {currentStep > 1 ? <span className="checkmark">✓</span> : "1"}
                </div>
                <div className="step-label">Add Record</div>
              </div>
              <div className="step-connector"></div>
              <div className="step-item">
                <div
                  className={`step-circle ${
                    currentStep > 2 ? "completed" : currentStep === 2 ? "active" : ""
                  }`}
                >
                  {currentStep > 2 ? <span className="checkmark">✓</span> : "2"}
                </div>
                <div className="step-label">Recommendations for your baby</div>
              </div>
              <div className="step-connector"></div>
              <div className="step-item">
                <div className={`step-circle ${currentStep === 3 ? "active" : ""}`}>
                  3
                </div>
                <div className="step-label">Other measurements</div>
              </div>
            </div>
          </div>
        </div>
        <div className="wizard-content">{renderStepContent}</div>
      </div>
    </div>
  );
};

AddRecord.propTypes = {
  child: PropTypes.object,
  memberId: PropTypes.string,
  closeOverlay: PropTypes.func.isRequired,
};

export default AddRecord;