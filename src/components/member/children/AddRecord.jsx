import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import childApi from "../../../services/childApi";
import "./AddRecord.css";
import calculateBMI from "../../../services/bmiUtils";
import BabyGrowth from "../../../assets/baby_growth.png";
import Confirm from "./common/buttons/Confirm";

const AddRecord = ({ child, memberId, closeOverlay }) => {
  if (!child) {
    return (
      <div className="add-record-overlay" onClick={handleOverlayClick}>
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

  // Sửa: Thêm biến childDetails để nhận giá trị từ useState
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
    if (!dateOfBirth) return '0 days';

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

    if (years === 0 && months === 0) {
      return `${diffDays} days`;
    }

    if (years < 1) {
      return `${months} months`;
    }

    return `${years} years old`;
  };

  const calculateAgeInMonths = (dateOfBirth) => {
    if (!dateOfBirth) return 0;

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalMonths = years * 12 + months;
    return totalMonths;
  };

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

  

  const [currentStep, setCurrentStep] = useState(1);
  // Bỏ subStep2 vì không sử dụng
  // const [subStep2, setSubStep2] = useState(1);

  const WHO_GROWTH_REFERENCE = [
    { age: 0, weight: [3.3, 5.0], height: [49, 55] },
    { age: 3, weight: [5.0, 7.9], height: [58, 67] },
    { age: 6, weight: [6.4, 9.7], height: [64, 72] },
    { age: 9, weight: [7.2, 11.0], height: [67, 76] },
    { age: 12, weight: [8.5, 12.5], height: [72, 82] },
    { age: 24, weight: [10.5, 15.5], height: [82, 95] },
    { age: 36, weight: [12.0, 18.0], height: [90, 105] },
    { age: 48, weight: [13.5, 21.0], height: [96, 112] },
    { age: 60, weight: [15.0, 24.0], height: [102, 118] },
    { age: 72, weight: [17.5, 28.0], height: [108, 125] },
    { age: 84, weight: [20.0, 32.0], height: [113, 130] },
    { age: 96, weight: [22.5, 36.0], height: [118, 136] },
    { age: 108, weight: [25.0, 41.0], height: [123, 141] },
    { age: 120, weight: [28.0, 45.0], height: [128, 147] },
    { age: 132, weight: [31.0, 50.0], height: [134, 153] },
    { age: 144, weight: [34.0, 55.0], height: [140, 160] },
    { age: 156, weight: [38.0, 61.0], height: [145, 166] },
    { age: 168, weight: [42.0, 67.0], height: [150, 171] },
    { age: 180, weight: [47.0, 73.0], height: [155, 175] },
    { age: 192, weight: [51.0, 78.0], height: [160, 178] },
    { age: 204, weight: [55.0, 82.0], height: [162, 180] },
    { age: 216, weight: [58.0, 85.0], height: [164, 182] },
  ];

  const validateGrowthForm = useCallback((form = growthForm) => {
    const ageInMonths = calculateAgeInMonths(child.dateOfBirth);
    const newErrors = {};

    if (!form.createdAt) {
      newErrors.createdAt = "Please select date";
    } else {
      newErrors.createdAt = "";
    }

    const ageGroup =
      WHO_GROWTH_REFERENCE.find((entry) => ageInMonths <= entry.age) ||
      WHO_GROWTH_REFERENCE[WHO_GROWTH_REFERENCE.length - 1];

    if (ageGroup) {
      const [minWeight, maxWeight] = ageGroup.weight;
      const [minHeight, maxHeight] = ageGroup.height;

      if (form.weight && (form.weight < minWeight || form.weight > maxWeight)) {
        newErrors.weight = `Warning: Weight should be between ${minWeight}kg and ${maxWeight}kg`;
      } else {
        newErrors.weight = "";
      }

      if (form.height && (form.height < minHeight || form.height > maxHeight)) {
        newErrors.height = `Warning: Height should be between ${minHeight}cm and ${maxHeight}cm`;
      } else {
        newErrors.height = "";
      }
    }

    setErrors(newErrors);
  }, [child.dateOfBirth, growthForm]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setGrowthForm((prev) => {
      const updatedForm = { ...prev, [name]: value };
      validateGrowthForm(updatedForm);
      return updatedForm;
    });
  }, [validateGrowthForm]);

  const [showNotification, setShowNotification] = useState(false);

  // Hàm gửi dữ liệu qua API
  const submitGrowthRecord = useCallback(async () => {
    try {
      const growthPayload = {
        name: child.name,
        dateOfBirth: child.dateOfBirth,
        recordedBy: memberId,
        createdAt: growthForm.createdAt,
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
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      return true; // Trả về true nếu gửi thành công
    } catch (err) {
      console.error("Error saving growth record:", err);
      return false; // Trả về false nếu có lỗi
    }
  }, [child, memberId, growthForm]);

  // Hàm xử lý khi nhấn Confirm ở Step 1
  const handleConfirmStep1 = useCallback(async () => {
    if (!growthForm.createdAt) {
      setErrors((prev) => ({
        ...prev,
        createdAt: "Please select date",
      }));
      return;
    }

    const success = await submitGrowthRecord();
    if (success) {
      closeOverlay(); // Đóng overlay sau khi gửi thành công
    }
  }, [growthForm, submitGrowthRecord, closeOverlay]);

  // Hàm xử lý khi nhấn Continue to Other Measurements
  const handleContinueToNextStep = useCallback(() => {
    if (currentStep === 1 && !growthForm.createdAt) {
      setErrors((prev) => ({
        ...prev,
        createdAt: "Please select date",
      }));
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, growthForm]);

  // Hàm xử lý khi nhấn Submit ở Step 3
  const handleSubmitStep3 = useCallback(async () => {
    const success = await submitGrowthRecord();
    if (success) {
      closeOverlay(); // Đóng overlay sau khi gửi thành công
    }
  }, [submitGrowthRecord, closeOverlay]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
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
                  <strong>Age:</strong>{" "}
                  {calculateAge(child.dateOfBirth)}
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
              name="createdAt"
              value={growthForm.createdAt || ""}
              onChange={handleChange}
              className={errors.createdAt ? "error-input" : ""}
            />
            {errors.createdAt && <p className="error-text">{errors.createdAt}</p>}
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
                />
                {errors.height && <p className="warning-text-record">{errors.height}</p>}
              </div>
              <div>
                <label>Head circumference (cm)</label>
                <input
                  type="number"
                  name="headCircumference"
                  value={growthForm.headCircumference}
                  onChange={handleChange}
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
                onChange={handleChange}
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
                  <strong>Age:</strong>{" "}
                  {calculateAge(child.dateOfBirth)}
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
                />
              </div>
              <div>
                <label>Triglycerides</label>
                <input
                  type="number"
                  name="triglycerides"
                  value={growthForm.triglycerides}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Blood sugar level</label>
                <input
                  type="number"
                  name="bloodSugarLevel"
                  value={growthForm.bloodSugarLevel}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Chest circumference (cm)</label>
                <input
                  type="number"
                  name="chestCircumference"
                  value={growthForm.chestCircumference}
                  onChange={handleChange}
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
                  <strong>Age:</strong>{" "}
                  {calculateAge(child.dateOfBirth)}
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
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Blood pressure</label>
                <input
                  type="number"
                  name="bloodPressure"
                  value={growthForm.bloodPressure}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Body temperature (°C)</label>
                <input
                  type="number"
                  name="bodyTemperature"
                  value={growthForm.bodyTemperature}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Oxygen saturation (%)</label>
                <input
                  type="number"
                  name="oxygenSaturation"
                  value={growthForm.oxygenSaturation}
                  onChange={handleChange}
                />
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
                />
              </div>
              <div>
                <label>Growth hormone level</label>
                <input
                  type="number"
                  name="growthHormoneLevel"
                  value={growthForm.growthHormoneLevel}
                  onChange={handleChange}
                />
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
    growthForm,
    errors,
    handleConfirmStep1,
    handleContinueToNextStep,
    handleSubmitStep3,
    handlePrevious,
    handleClose,
    child,
  ]);

  return (
    <div className="add-record-overlay" onClick={handleClose}>
      <div className="add-record-wizard" onClick={(e) => e.stopPropagation()}>
      <button className="close-button-record" onClick={handleClose}>
          ×
        </button>
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
                  className={`step-circle ${
                    currentStep > 1
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
                  className={`step-circle ${
                    currentStep > 2
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