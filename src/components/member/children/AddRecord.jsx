import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import childApi from "../../../services/childApi";
import "./AddRecord.css";
import calculateBMI from "../../../services/bmiUtils";
import BabyGrowth from "../../../assets/baby_growth.png";

const AddRecord = ({ child, memberId, closeOverlay }) => {
  if (!child) {
    return (
      <div className="add-record-overlay" onClick={handleOverlayClick}>
        <div className="add-record-wizard" onClick={(e) => e.stopPropagation()}>
          {/* <button type="button" className="close-btn" onClick={closeOverlay}>
            ×
          </button> */}
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
  // Fetch child details using GET /api/Children/{childId}
  const setChildDetails = useState(null);

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

  // Growth record state (fields used across all substeps)
  const [growthForm, setGrowthForm] = useState({
    createdAt: "",
    weight: "",
    height: "",
    headCircumference: 0,
    bmi: "",
    notes: "",
    muscleMass: 0,
    chestCircumference: 0,
    nutritionalStatus: "",
    ferritinLevel: 0,
    triglycerides: 0,
    bloodSugarLevel: 0,
    physicalActivityLevel: "",
    heartRate: 0,
    bloodPressure: 0,
    bodyTemperature: 0,
    oxygenSaturation: 0,
    sleepDuration: 0,
    vision: "",
    hearing: "",
    immunizationStatus: "",
    mentalHealthStatus: "",
    growthHormoneLevel: 0,
    attentionSpan: "",
    neurologicalReflexes: "",
    developmentalMilestones: "",
  });

  // Validation errors
  const [errors, setErrors] = useState({
    createdAt: "",
    weight: "",
    height: "",
  });

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        closeOverlay();
      }
    },
    [closeOverlay]
  );
  // Step management: 1 = record entry (split in 3 substeps), 2 = success message
  const [currentStep, setCurrentStep] = useState(1);
  // subStep2: 1, 2, or 3 corresponding to the multi-page form
  const [subStep2, setSubStep2] = useState(1);

  const validateGrowthForm = useCallback(() => {
    const newErrors = { ...errors };
    let isValid = true;

    const selectedDate = new Date(growthForm.createdAt);
    const today = new Date(); // Ngày hiện tại: 20/03/2025
    today.setHours(0, 0, 0, 0); // Đặt về đầu ngày
    selectedDate.setHours(0, 0, 0, 0); // Đặt ngày được chọn về đầu ngày

    if (!growthForm.createdAt) {
      newErrors.createdAt = "Please select date";
      isValid = false;
    } else if (selectedDate > today) {
      newErrors.createdAt = "Cannot select a future date";
      isValid = false;
    } else {
      newErrors.createdAt = "";
    }

    if (!growthForm.weight) {
      newErrors.weight = "Please enter weight";
      isValid = false;
    } else {
      newErrors.weight = "";
    }

    if (!growthForm.height) {
      newErrors.height = "Please enter height";
      isValid = false;
    } else {
      newErrors.height = "";
    }

    setErrors(newErrors);
    return isValid;
  }, [growthForm, errors]);

  const [showNotification, setShowNotification] = useState(false);

  const handleConfirmGrowthRecord = useCallback(async () => {
    if (currentStep === 1 && !validateGrowthForm()) return;

    if (currentStep === 1) {
      try {
        console.log("Calling getGrowthRecords with:", { childName: child.name, ParentName: parent.name });
        const existingRecords = await childApi.getGrowthRecords(child.name, parent.name);
        console.log("Existing Records:", existingRecords.data);

        if (!growthForm.createdAt) {
          console.error("No createdAt date provided in growthForm");
          return;
        }
        const selectedDate = new Date(growthForm.createdAt);
        selectedDate.setHours(0, 0, 0, 0);
        const selectedDateStr = selectedDate.toDateString();
        console.log("Selected Date:", selectedDateStr);

        const todayRecords = existingRecords.data.filter((record) => {
          const recordDate = new Date(record.createdAt);
          recordDate.setHours(0, 0, 0, 0);
          return recordDate.toDateString() === selectedDateStr;
        });

        console.log("Today Records:", todayRecords);

        if (todayRecords.length > 0) {
          const formattedDate = selectedDate.toLocaleDateString('en-GB');
          const confirmReplace = window.confirm(
            `A growth record for this day (${formattedDate}) already exists. Would you like to replace the current record?`
          );
          if (!confirmReplace) return;
        }
      } catch (err) {
        console.error("Error fetching existing records:", err);
      }
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    try {
      if (!child.name || !growthForm.weight || !growthForm.height) {
        console.error("Missing required fields in growthPayload");
        alert("Please fill in all required fields.");
        return;
      }

      const growthPayload = {
        name: child.name,
        dateOfBirth: child.dateOfBirth,
        recordedBy: memberId,
        createdAt: growthForm.createdAt || new Date().toISOString(),
        weight: growthForm.weight,
        height: growthForm.height,
        headCircumference: growthForm.headCircumference,
        notes: growthForm.notes,
        muscleMass: growthForm.muscleMass,
        chestCircumference: growthForm.chestCircumference,
        nutritionalStatus: growthForm.nutritionalStatus,
        ferritinLevel: growthForm.ferritinLevel,
        triglycerides: growthForm.triglycerides,
        bloodSugarLevel: growthForm.bloodSugarLevel,
        physicalActivityLevel: growthForm.physicalActivityLevel,
        heartRate: growthForm.heartRate,
        bloodPressure: growthForm.bloodPressure,
        bodyTemperature: growthForm.bodyTemperature,
        oxygenSaturation: growthForm.oxygenSaturation,
        sleepDuration: growthForm.sleepDuration,
        vision: growthForm.vision,
        hearing: growthForm.hearing,
        immunizationStatus: growthForm.immunizationStatus,
        mentalHealthStatus: growthForm.mentalHealthStatus,
        growthHormoneLevel: growthForm.growthHormoneLevel,
        attentionSpan: growthForm.attentionSpan,
        neurologicalReflexes: growthForm.neurologicalReflexes,
        developmentalMilestones: growthForm.developmentalMilestones,
      };

      const growthRes = await childApi.createGrowthRecord(growthPayload);
      console.log("Growth record created:", growthRes.data);

      setShowNotification(true);
      closeOverlay();

      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } catch (err) {
      console.error("Error saving growth record:", err);
      alert("Failed to save growth record. Please try again.");
    }
  }, [child, parent, growthForm, currentStep, validateGrowthForm, closeOverlay]);
  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleClose = useCallback(() => {
    closeOverlay();
  }, [closeOverlay]);

  const renderStepContent = useMemo(() => {
    // Step 1: Add BMI information (same as before)
    if (currentStep === 1) {
      return (
        <div className="step-form">
          {/* Child Information Card */}
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
                {child.gender && (
                  <p className={`gender-tag ${child.gender.toLowerCase()}`}>
                    {child.gender}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Date Section */}
          <div className="form-section date-section">
            <h4>Record Date</h4>
            <input
              type="date"
              value={growthForm.createdAt || ""}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                const today = new Date(); // Ngày hiện tại: 20/03/2025
                today.setHours(0, 0, 0, 0); // Đặt về đầu ngày để so sánh chính xác
                selectedDate.setHours(0, 0, 0, 0); // Đặt ngày được chọn về đầu ngày

                if (selectedDate > today) {
                  setErrors((prev) => ({
                    ...prev,
                    createdAt: "Cannot select a future date",
                  }));
                } else {
                  setErrors((prev) => ({
                    ...prev,
                    createdAt: "",
                  }));
                  setGrowthForm((prev) => ({
                    ...prev,
                    createdAt: e.target.value,
                  }));
                }
              }}
              max={new Date().toISOString().split("T")[0]} // Giới hạn tối đa là ngày hiện tại (20/03/2025)
              className={errors.createdAt ? "error-input" : ""}
            />
            {errors.createdAt && <p className="error-text">{errors.createdAt}</p>}
          </div>


          {/* Measurements Section */}
          <div className="form-section">
            <h4>Basic Measurements</h4>
            <div className="measurements-section">
              <div>
                <label>Baby's weight (kg)</label>
                <input
                  type="number"
                  value={growthForm.weight}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      weight: e.target.value,
                    }))
                  }
                  className={errors.weight ? "error-input" : ""}
                />
                {errors.weight && <p className="error-text">{errors.weight}</p>}
              </div>
              <div>
                <label>Baby's height (cm)</label>
                <input
                  type="number"
                  value={growthForm.height}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      height: e.target.value,
                    }))
                  }
                  className={errors.height ? "error-input" : ""}
                />
                {errors.height && <p className="error-text">{errors.height}</p>}
              </div>
              <div>
                <label>Head circumference (cm)</label>
                <input
                  type="number"
                  value={growthForm.headCircumference}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      headCircumference: e.target.value,
                    }))
                  }
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
                value={growthForm.notes}
                onChange={(e) =>
                  setGrowthForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <button
            type="button"
            className="confirm-button"
            onClick={handleConfirmGrowthRecord}
          >
            Confirm
          </button>
        </div>
      );
    }

    // Step 2: Fields from old substep 2
    if (currentStep === 2) {
      return (
        <div className="step-form">
          {/* Child Information Card */}
          <div className="child-info-card">
            <h3>Child Information</h3>
            <div className="child-info-details">
              <p>
                <strong>Name:</strong> {child.name}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {new Date(child.dateOfBirth).toLocaleDateString()}
              </p>
              {child.gender && (
                <p>
                  <strong>Gender:</strong> {child.gender}
                </p>
              )}
            </div>
          </div>

          <h2>Recommendations for Your Baby</h2>

          {/* Nutritional Information Section */}
          <div className="form-section">
            <h4>Nutritional Information</h4>
            <div className="measurements-section">
              <div>
                <label>Nutritional status</label>
                <input
                  type="text"
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

          {/* Blood Metrics Section */}
          <div className="form-section">
            <h4>Blood Metrics</h4>
            <div className="measurements-section">
              <div>
                <label>Ferritin level</label>
                <input
                  type="number"
                  value={growthForm.ferritinLevel}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      ferritinLevel: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label>Triglycerides</label>
                <input
                  type="number"
                  value={growthForm.triglycerides}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      triglycerides: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label>Blood sugar level</label>
                <input
                  type="number"
                  value={growthForm.bloodSugarLevel}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      bloodSugarLevel: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label>Chest circumference (cm)</label>
                <input
                  type="number"
                  value={growthForm.chestCircumference}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      chestCircumference: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="step-buttons">
            <button
              type="button"
              className="previous-btn"
              onClick={handlePrevious}
            >
              Previous
            </button>
            <button
              type="button"
              className="confirm-button"
              onClick={handleConfirmGrowthRecord}
            >
              Continue to Other Measurements
            </button>
          </div>
        </div>
      );
    }

    // Step 3: Fields from old substep 3
    if (currentStep === 3) {
      return (
        <div className="step-form">
          {/* Child Information Card */}
          <div className="child-info-card">
            <h3>Child Information</h3>
            <div className="child-info-details">
              <p>
                <strong>Name:</strong> {child.name}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {new Date(child.dateOfBirth).toLocaleDateString()}
              </p>
              {child.gender && (
                <p>
                  <strong>Gender:</strong> {child.gender}
                </p>
              )}
            </div>
          </div>

          <h2>Additional Health Measurements</h2>
          <p>Please provide any additional measurements you have:</p>

          {/* Vital Signs Section */}
          <div className="form-section">
            <h4>Vital Signs</h4>
            <div className="measurements-section">
              <div>
                <label>Heart rate</label>
                <input
                  type="number"
                  value={growthForm.heartRate}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      heartRate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label>Blood pressure</label>
                <input
                  type="number"
                  value={growthForm.bloodPressure}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      bloodPressure: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label>Body temperature (°C)</label>
                <input
                  type="number"
                  value={growthForm.bodyTemperature}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      bodyTemperature: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label>Oxygen saturation (%)</label>
                <input
                  type="number"
                  value={growthForm.oxygenSaturation}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      oxygenSaturation: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Development Metrics Section */}
          <div className="form-section">
            <h4>Development Metrics</h4>
            <div className="measurements-section">
              <div>
                <label>Sleep duration (hrs)</label>
                <input
                  type="number"
                  value={growthForm.sleepDuration}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      sleepDuration: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label>Growth hormone level</label>
                <input
                  type="number"
                  value={growthForm.growthHormoneLevel}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      growthHormoneLevel: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Sensory and Health Status Section */}
          <div className="form-section">
            <h4>Sensory and Health Status</h4>
            <div className="measurements-section">
              <div>
                <label>Hearing</label>
                <input
                  type="text"
                  value={growthForm.hearing}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      hearing: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label>Vision</label>
                <input
                  type="text"
                  value={growthForm.vision}
                  onChange={(e) =>
                    setGrowthForm((prev) => ({
                      ...prev,
                      vision: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label>Mental health status</label>
                <input
                  type="text"
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

          {/* Cognitive Development Section */}
          <div className="form-section">
            <h4>Cognitive Development</h4>
            <div className="measurements-section">
              <div>
                <label>Attention span</label>
                <input
                  type="text"
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
            <button
              type="button"
              className="previous-btn"
              onClick={handlePrevious}
            >
              Previous
            </button>
            <button
              type="button"
              className="confirm-button"
              onClick={handleConfirmGrowthRecord}
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
    growthForm,
    errors,
    handleConfirmGrowthRecord,
    handlePrevious,
    handleClose,
    child,
  ]);

  return (
    <div className="add-record-overlay" onClick={handleClose}>
      <div className="add-record-wizard" onClick={(e) => e.stopPropagation()}>
        {/* Cột trái: Hiển thị thông tin các bước */}
        <div className="wizard-left">
          <div className="blue-bar"></div>
          <div className="wizard-left-content">
            <h1 className="main-title">
              Enter a new growth record to track your baby's health
              automatically
            </h1>
            <div className="babygrowth-img">
              <img src={BabyGrowth} alt="Baby Growth" />
            </div>
            <div className="step-progress">
              <div className="step-item">
                <div
                  className={`step-circle ${currentStep > 1
                    ? "completed"
                    : currentStep === 1
                      ? "active"
                      : ""
                    }`}
                >
                  {currentStep > 1 ? <span className="checkmark">✓</span> : "1"}
                </div>
                <div className="step-label">Add Record</div>
              </div>
              <div className="step-connector"></div>
              <div className="step-item">
                <div
                  className={`step-circle ${currentStep > 2
                    ? "completed"
                    : currentStep === 2
                      ? "active"
                      : ""
                    }`}
                >
                  {currentStep > 2 ? <span className="checkmark">✓</span> : "2"}
                </div>
                <div className="step-label">Recommendations for your baby</div>
              </div>
              <div className="step-connector"></div>
              <div className="step-item">
                <div
                  className={`step-circle ${currentStep === 3 ? "active" : ""}`}
                >
                  3
                </div>
                <div className="step-label">Other measurements</div>
              </div>
            </div>
          </div>
        </div>
        {/* Cột phải: Hiển thị nội dung form */}
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
