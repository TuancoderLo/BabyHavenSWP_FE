import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import childApi from "../../../../services/childApi";
import calculateBMI from "../../../../services/bmiUtils";
import BabyGrowth from "../../../../assets/baby_growth.png";
import { growthRecordForm, calculateAgeInMonths, WHO_GROWTH_REFERENCE } from "../../../../data/childValidations";
import "./AddRecord.css";

const AddRecord = ({ child, memberId, closeOverlay }) => {
  // Nếu không có child, hiển thị thông báo
  if (!child) {
    return (
      <div className="add-record-overlay" onClick={(e) => e.target === e.currentTarget && closeOverlay()}>
        <div className="add-record-wizard" onClick={(e) => e.stopPropagation()}>
          <div className="notification-board">
            <h2>No Child Selected</h2>
            <p>Please select a child or add a new child to continue.</p>
            <button type="button" onClick={closeOverlay}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  // State để lưu thông tin chi tiết của trẻ, form tăng trưởng và popup
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
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State cho popup

  // Lấy thông tin chi tiết của trẻ khi component mount hoặc child/memberId thay đổi
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

  // Hàm tính tuổi của trẻ dựa trên ngày sinh
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

  // Hàm tính toán cảnh báo dựa trên dữ liệu form và ngày sinh
  const calculateWarnings = useCallback((form, childDOB) => {
    const tempWarnings = {};
    const ageInMonths = calculateAgeInMonths(childDOB);
    const ageGroup = WHO_GROWTH_REFERENCE.find((entry) => ageInMonths <= entry.age) || WHO_GROWTH_REFERENCE[WHO_GROWTH_REFERENCE.length - 1];

    if (ageGroup) {
      const [minWeight, maxWeight] = ageGroup.weight;
      const [minHeight, maxHeight] = ageGroup.height;
      if (form.weight && (form.weight < minWeight || form.weight > maxWeight)) {
        tempWarnings.weight = `Warning: Weight should be between ${minWeight}kg and ${maxWeight}kg for age ${ageGroup.age} months`;
      }
      if (form.height && (form.height < minHeight || form.height > maxHeight)) {
        tempWarnings.height = `Warning: Height should be between ${minHeight}cm and ${maxHeight}cm for age ${ageGroup.age} months`;
      }
    }

    if (form.bodyTemperature !== "" && form.bodyTemperature != null) {
      const bt = parseFloat(form.bodyTemperature);
      if (bt >= 45) tempWarnings.bodyTemperature = "Warning: Body temperature is unusually high (should be below 45°C)";
      else if (bt < 35 || bt > 38) tempWarnings.bodyTemperature = "Warning: Normal body temperature is typically between 35°C and 38°C";
    }

    if (form.oxygenSaturation !== "" && form.oxygenSaturation != null) {
      const ox = parseFloat(form.oxygenSaturation);
      if (ox > 100) tempWarnings.oxygenSaturation = "Warning: Oxygen saturation cannot exceed 100%";
      else if (ox < 95) tempWarnings.oxygenSaturation = "Warning: Oxygen saturation is typically 95-100%";
    }

    if (form.sleepDuration !== "" && form.sleepDuration != null) {
      const sd = parseFloat(form.sleepDuration);
      if (sd >= 24) tempWarnings.sleepDuration = "Warning: Sleep duration cannot exceed 24 hours";
      else if (sd < 10) tempWarnings.sleepDuration = "Warning: Typical sleep duration for infants is 10-18 hours";
    }

    if (form.heartRate !== "" && form.heartRate != null && !isNaN(parseFloat(form.heartRate))) {
      const hr = parseFloat(form.heartRate);
      if (hr < 60 || hr > 180) tempWarnings.heartRate = "Warning: Typical heart rate for infants is 60-180 bpm";
    }

    if (form.bloodSugarLevel !== "" && form.bloodSugarLevel != null && !isNaN(parseFloat(form.bloodSugarLevel))) {
      const bs = parseFloat(form.bloodSugarLevel);
      if (bs < 40 || bs > 180) tempWarnings.bloodSugarLevel = "Warning: Typical blood sugar level is 40-180 mg/dL";
    }

    if (form.headCircumference !== "" && form.headCircumference != null) {
      const hc = parseFloat(form.headCircumference);
      if (hc < 30 || hc > 60) tempWarnings.headCircumference = "Warning: Typical head circumference for infants is 30-60 cm";
    }

    if (form.chestCircumference !== "" && form.chestCircumference != null) {
      const cc = parseFloat(form.chestCircumference);
      if (cc < 30 || cc > 70) tempWarnings.chestCircumference = "Warning: Typical chest circumference for infants is 30-70 cm";
    }

    if (form.bloodPressure !== "" && form.bloodPressure != null && !isNaN(parseFloat(form.bloodPressure))) {
      const bp = parseFloat(form.bloodPressure);
      if (bp < 50 || bp > 120) tempWarnings.bloodPressure = "Warning: Typical blood pressure for infants is 50-120 mmHg";
    }

    if (form.ferritinLevel !== "" && form.ferritinLevel != null && !isNaN(parseFloat(form.ferritinLevel))) {
      const fl = parseFloat(form.ferritinLevel);
      if (fl < 15 || fl > 150) tempWarnings.ferritinLevel = "Warning: Typical ferritin level is 15-150 ng/mL";
    }

    if (form.triglycerides !== "" && form.triglycerides != null && !isNaN(parseFloat(form.triglycerides))) {
      const tg = parseFloat(form.triglycerides);
      if (tg < 40 || tg > 150) tempWarnings.triglycerides = "Warning: Typical triglycerides level is 40-150 mg/dL";
    }

    if (form.muscleMass !== "" && form.muscleMass != null && !isNaN(parseFloat(form.muscleMass))) {
      const mm = parseFloat(form.muscleMass);
      if (mm < 0 || mm > 50) tempWarnings.muscleMass = "Warning: Muscle mass should be between 0-50 kg";
    }

    if (form.growthHormoneLevel !== "" && form.growthHormoneLevel != null && !isNaN(parseFloat(form.growthHormoneLevel))) {
      const gh = parseFloat(form.growthHormoneLevel);
      if (gh < 0 || gh > 20) tempWarnings.growthHormoneLevel = "Warning: Typical growth hormone level is 0-20 ng/mL";
    }

    return tempWarnings;
  }, []);

  // Xử lý thay đổi giá trị input
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setGrowthForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "weight" || name === "height") {
        updated.bmi = calculateBMI(name === "weight" ? value : prev.weight, name === "height" ? value : prev.height);
      }
      return updated;
    });

    const newErrors = growthRecordForm({ ...growthForm, [name]: value }, child.dateOfBirth);
    setErrors((prev) => ({ ...prev, ...newErrors }));

    const newWarnings = calculateWarnings({ ...growthForm, [name]: value }, child.dateOfBirth);
    setWarnings((prev) => ({ ...prev, ...newWarnings }));
  }, [growthForm, child.dateOfBirth, calculateWarnings]);

  // Validate form trước khi submit
  const validateForm = useCallback(() => {
    const growthErrors = growthRecordForm(growthForm, child.dateOfBirth);
    setErrors(growthErrors);
    return Object.values(growthErrors).every((msg) => !msg);
  }, [growthForm, child.dateOfBirth]);

  // Xử lý submit form
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
        notes: growthForm.notes || "",
        muscleMass: Number(growthForm.muscleMass) || 0,
        chestCircumference: Number(growthForm.chestCircumference) || 0,
        nutritionalStatus: growthForm.nutritionalStatus || "",
        ferritinLevel: Number(growthForm.ferritinLevel) || 0,
        triglycerides: Number(growthForm.triglycerides) || 0,
        bloodSugarLevel: Number(growthForm.bloodSugarLevel) || 0,
        physicalActivityLevel: growthForm.physicalActivityLevel || "",
        heartRate: Number(growthForm.heartRate) || 0,
        bloodPressure: Number(growthForm.bloodPressure) || 0,
        bodyTemperature: Number(growthForm.bodyTemperature) || 0,
        oxygenSaturation: Number(growthForm.oxygenSaturation) || 0,
        sleepDuration: Number(growthForm.sleepDuration) || 0,
        vision: growthForm.vision || "",
        hearing: growthForm.hearing || "",
        immunizationStatus: growthForm.immunizationStatus || "",
        mentalHealthStatus: growthForm.mentalHealthStatus || "",
        growthHormoneLevel: Number(growthForm.growthHormoneLevel) || 0,
        attentionSpan: growthForm.attentionSpan || "",
        neurologicalReflexes: growthForm.neurologicalReflexes || "",
        developmentalMilestones: growthForm.developmentalMilestones || "",
      };

      await childApi.createGrowthRecord(growthPayload);
      setShowSuccessModal(true); // Hiển thị popup thành công
    } catch (err) {
      console.error("Error submitting growth record:", err);
      setErrors((prev) => ({ ...prev, submit: "Failed to submit record. Please try again." }));
    }
  }, [child, memberId, growthForm, validateForm]);

  return (
    <div className="add-record-overlay" onClick={(e) => e.target === e.currentTarget && closeOverlay()}>
      <div className="add-record-wizard" onClick={(e) => e.stopPropagation()}>
        <button className="close-button-record" onClick={closeOverlay}>×</button>

        <div className="wizard-left">
          <div className="blue-bar" />
          <div className="wizard-left-content">
            <h1 className="main-title">Enter a new growth record to track your baby's health</h1>
            <div className="babygrowth-img">
              <img src={BabyGrowth} alt="Baby Growth" />
            </div>
          </div>
        </div>

        <div className="wizard-content">
          <div className="step-form">
            {/* Thông tin trẻ */}
            <div className="child-info-card">
              <h3>Child Information</h3>
              <div className="child-info-details">
                <p><strong>Name:</strong> {child.name}</p>
                <div className="info-row">
                  <p><strong>Date of Birth:</strong> {new Date(child.dateOfBirth).toLocaleDateString()}</p>
                  <p><strong>Age:</strong> {calculateAge(child.dateOfBirth)}</p>
                  {child.gender && (
                    <p className={`gender-tag ${child.gender.toLowerCase()}`}>{child.gender}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Ngày ghi nhận */}
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
              {errors.createdAt && <p className="error-text">{errors.createdAt}</p>}
            </div>

            {/* Đo lường cơ bản */}
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
                    onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                  />
                  {errors.weight && <p className="error-text">{errors.weight}</p>}
                  {warnings.weight && <p className="warning-text">{warnings.weight}</p>}
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
                    onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                  />
                  {errors.height && <p className="error-text">{errors.height}</p>}
                  {warnings.height && <p className="warning-text">{warnings.height}</p>}
                </div>
                <div>
                  <label>Head circumference (cm)</label>
                  <input
                    type="number"
                    name="headCircumference"
                    value={growthForm.headCircumference}
                    onChange={handleChange}
                    min="0"
                    onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                  />
                  {warnings.headCircumference && <p className="warning-text">{warnings.headCircumference}</p>}
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

            {/* Dropdown 1: Đề xuất cho bé */}
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
                    <label>Ferritin level (ng/mL)</label>
                    <input
                      type="number"
                      name="ferritinLevel"
                      value={growthForm.ferritinLevel}
                      onChange={handleChange}
                      min="0"
                      onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                    />
                    {warnings.ferritinLevel && <p className="warning-text">{warnings.ferritinLevel}</p>}
                  </div>
                  <div>
                    <label>Triglycerides (mg/dL)</label>
                    <input
                      type="number"
                      name="triglycerides"
                      value={growthForm.triglycerides}
                      onChange={handleChange}
                      min="0"
                      onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                    />
                    {warnings.triglycerides && <p className="warning-text">{warnings.triglycerides}</p>}
                  </div>
                  <div>
                    <label>Blood sugar level (mg/dL)</label>
                    <input
                      type="number"
                      name="bloodSugarLevel"
                      value={growthForm.bloodSugarLevel}
                      onChange={handleChange}
                      min="0"
                      onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                    />
                    {warnings.bloodSugarLevel && <p className="warning-text">{warnings.bloodSugarLevel}</p>}
                  </div>
                  <div>
                    <label>Chest circumference (cm)</label>
                    <input
                      type="number"
                      name="chestCircumference"
                      value={growthForm.chestCircumference}
                      onChange={handleChange}
                      min="0"
                      onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                    />
                    {warnings.chestCircumference && <p className="warning-text">{warnings.chestCircumference}</p>}
                  </div>
                </div>
              </div>
            </details>

            {/* Dropdown 2: Đo lường sức khỏe bổ sung */}
            <details>
              <summary>Additional Health Measurements (click to expand)</summary>
              <div className="form-section">
                <h4>Vital Signs</h4>
                <div className="measurements-section">
                  <div>
                    <label>Heart rate (bpm)</label>
                    <input
                      type="number"
                      name="heartRate"
                      value={growthForm.heartRate}
                      onChange={handleChange}
                      min="0"
                      onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                    />
                    {warnings.heartRate && <p className="warning-text">{warnings.heartRate}</p>}
                  </div>
                  <div>
                    <label>Blood pressure (mmHg)</label>
                    <input
                      type="number"
                      name="bloodPressure"
                      value={growthForm.bloodPressure}
                      onChange={handleChange}
                      min="0"
                      onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                    />
                    {warnings.bloodPressure && <p className="warning-text">{warnings.bloodPressure}</p>}
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
                      onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                    />
                    {errors.bodyTemperature && <p className="error-text">{errors.bodyTemperature}</p>}
                    {warnings.bodyTemperature && <p className="warning-text">{warnings.bodyTemperature}</p>}
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
                      onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                    />
                    {errors.oxygenSaturation && <p className="error-text">{errors.oxygenSaturation}</p>}
                    {warnings.oxygenSaturation && <p className="warning-text">{warnings.oxygenSaturation}</p>}
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
                      onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                    />
                    {errors.sleepDuration && <p className="error-text">{errors.sleepDuration}</p>}
                    {warnings.sleepDuration && <p className="warning-text">{warnings.sleepDuration}</p>}
                  </div>
                  <div>
                    <label>Growth hormone level (ng/mL)</label>
                    <input
                      type="number"
                      name="growthHormoneLevel"
                      value={growthForm.growthHormoneLevel}
                      onChange={handleChange}
                      min="0"
                      className={errors.growthHormoneLevel ? "error-input" : ""}
                      onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                    />
                    {errors.growthHormoneLevel && <p className="error-text">{errors.growthHormoneLevel}</p>}
                    {warnings.growthHormoneLevel && <p className="warning-text">{warnings.growthHormoneLevel}</p>}
                  </div>
                  <div>
                    <label>Muscle mass (kg)</label>
                    <input
                      type="number"
                      name="muscleMass"
                      value={growthForm.muscleMass}
                      onChange={handleChange}
                      min="0"
                      onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                    />
                    {warnings.muscleMass && <p className="warning-text">{warnings.muscleMass}</p>}
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

            {/* Nút submit */}
            <div className="step-buttons">
              <button type="button" className="confirm-button-step1" onClick={handleSubmit}>
                Submit Record
              </button>
              {errors.submit && <p className="error-text">{errors.submit}</p>}
            </div>
          </div>
        </div>

        {/* Modal: Thông báo thành công */}
        {showSuccessModal && (
          <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
            <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="success-modal-header">
                <h3>Success!</h3>
                <button className="modal-close" onClick={() => setShowSuccessModal(false)}>
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
                    closeOverlay(); // Đóng overlay chính sau khi đóng modal
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
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