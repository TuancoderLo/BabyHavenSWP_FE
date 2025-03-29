import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import childApi from "../../../../services/childApi";
import calculateBMI from "../../../../services/bmiUtils";
import BabyGrowth from "../../../../assets/baby_growth.png";
import {
  addChildForm,
  growthRecordForm,
  calculateAgeInMonths,
  WHO_GROWTH_REFERENCE,
} from "../../../../data/childValidations";
import baby from "../../../../assets/baby.jpg";
import "./AddChild.css";

const AddChild = ({ closeOverlay }) => {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});

  const [childForm, setChildForm] = useState({
    name: "",
    memberId: localStorage.getItem("memberId"),
    dateOfBirth: "",
    gender: "",
    birthWeight: "",
    birthHeight: "",
    notes: "",
  });

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

  const handleChildChange = useCallback((e) => {
    const { name, value } = e.target;
    setChildForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const calculateWarnings = (growthForm, childDateOfBirth) => {
    const tempWarnings = {};
    const ageInMonths = calculateAgeInMonths(childDateOfBirth);
    const ageGroup =
      WHO_GROWTH_REFERENCE.find((entry) => ageInMonths <= entry.age) ||
      WHO_GROWTH_REFERENCE[WHO_GROWTH_REFERENCE.length - 1];

    if (ageGroup) {
      const [minWeight, maxWeight] = ageGroup.weight;
      const [minHeight, maxHeight] = ageGroup.height;
      if (
        growthForm.weight &&
        (growthForm.weight < minWeight || growthForm.weight > maxWeight)
      ) {
        tempWarnings.weight = `Warning: Weight should be between ${minWeight}kg and ${maxWeight}kg for age ${ageGroup.age} months`;
      }
      if (
        growthForm.height &&
        (growthForm.height < minHeight || growthForm.height > maxHeight)
      ) {
        tempWarnings.height = `Warning: Height should be between ${minHeight}cm and ${maxHeight}cm for age ${ageGroup.age} months`;
      }
    }

    if (growthForm.bodyTemperature !== "" && growthForm.bodyTemperature != null) {
      const bt = parseFloat(growthForm.bodyTemperature);
      if (bt >= 45) {
        tempWarnings.bodyTemperature =
          "Warning: Body temperature is unusually high (should be below 45°C)";
      } else if (bt < 35 || bt > 38) {
        tempWarnings.bodyTemperature =
          "Warning: Normal body temperature is typically between 35°C and 38°C";
      }
    }
    if (
      growthForm.oxygenSaturation !== "" &&
      growthForm.oxygenSaturation != null
    ) {
      const ox = parseFloat(growthForm.oxygenSaturation);
      if (ox > 100) {
        tempWarnings.oxygenSaturation =
          "Warning: Oxygen saturation cannot exceed 100%";
      } else if (ox < 95) {
        tempWarnings.oxygenSaturation =
          "Warning: Oxygen saturation is typically 95-100%";
      }
    }
    if (growthForm.sleepDuration !== "" && growthForm.sleepDuration != null) {
      const sd = parseFloat(growthForm.sleepDuration);
      if (sd >= 24) {
        tempWarnings.sleepDuration =
          "Warning: Sleep duration cannot exceed 24 hours";
      } else if (sd < 10) {
        tempWarnings.sleepDuration =
          "Warning: Typical sleep duration for infants is 10-18 hours";
      }
    }
    if (
      growthForm.heartRate !== "" &&
      growthForm.heartRate != null &&
      !isNaN(parseFloat(growthForm.heartRate))
    ) {
      const hr = parseFloat(growthForm.heartRate);
      if (hr < 60 || hr > 180) {
        tempWarnings.heartRate =
          "Warning: Typical heart rate for infants is 60-180 bpm";
      }
    }
    if (
      growthForm.bloodSugarLevel !== "" &&
      growthForm.bloodSugarLevel != null &&
      !isNaN(parseFloat(growthForm.bloodSugarLevel))
    ) {
      const bs = parseFloat(growthForm.bloodSugarLevel);
      if (bs < 40 || bs > 180) {
        tempWarnings.bloodSugarLevel =
          "Warning: Typical blood sugar level is 40-180 mg/dL";
      }
    }
    if (
      growthForm.headCircumference !== "" &&
      growthForm.headCircumference != null
    ) {
      const hc = parseFloat(growthForm.headCircumference);
      if (hc < 30 || hc > 60) {
        tempWarnings.headCircumference =
          "Warning: Typical head circumference for infants is 30-60 cm";
      }
    }
    if (
      growthForm.chestCircumference !== "" &&
      growthForm.chestCircumference != null
    ) {
      const cc = parseFloat(growthForm.chestCircumference);
      if (cc < 30 || cc > 70) {
        tempWarnings.chestCircumference =
          "Warning: Typical chest circumference for infants is 30-70 cm";
      }
    }
    if (
      growthForm.bloodPressure !== "" &&
      growthForm.bloodPressure != null &&
      !isNaN(parseFloat(growthForm.bloodPressure))
    ) {
      const bp = parseFloat(growthForm.bloodPressure);
      if (bp < 50 || bp > 120) {
        tempWarnings.bloodPressure =
          "Warning: Typical blood pressure for infants is 50-120 mmHg";
      }
    }
    if (
      growthForm.ferritinLevel !== "" &&
      growthForm.ferritinLevel != null &&
      !isNaN(parseFloat(growthForm.ferritinLevel))
    ) {
      const fl = parseFloat(growthForm.ferritinLevel);
      if (fl < 15 || fl > 150) {
        tempWarnings.ferritinLevel =
          "Warning: Typical ferritin level is 15-150 ng/mL";
      }
    }
    if (
      growthForm.triglycerides !== "" &&
      growthForm.triglycerides != null &&
      !isNaN(parseFloat(growthForm.triglycerides))
    ) {
      const tg = parseFloat(growthForm.triglycerides);
      if (tg < 40 || tg > 150) {
        tempWarnings.triglycerides =
          "Warning: Typical triglycerides level is 40-150 mg/dL";
      }
    }
    if (
      growthForm.muscleMass !== "" &&
      growthForm.muscleMass != null &&
      !isNaN(parseFloat(growthForm.muscleMass))
    ) {
      const mm = parseFloat(growthForm.muscleMass);
      if (mm < 0 || mm > 50) {
        tempWarnings.muscleMass =
          "Warning: Muscle mass should be between 0-50 kg";
      }
    }
    if (
      growthForm.growthHormoneLevel !== "" &&
      growthForm.growthHormoneLevel != null &&
      !isNaN(parseFloat(growthForm.growthHormoneLevel))
    ) {
      const gh = parseFloat(growthForm.growthHormoneLevel);
      if (gh < 0 || gh > 20) {
        tempWarnings.growthHormoneLevel =
          "Warning: Typical growth hormone level is 0-20 ng/mL";
      }
    }

    return tempWarnings;
  };

  const handleGrowthChange = useCallback((e) => {
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

    setErrors((prev) => {
      const newErrors = growthRecordForm(
        { ...growthForm, [name]: value },
        childForm.dateOfBirth
      );
      return { ...prev, ...newErrors };
    });

    setWarnings((prev) => {
      const newWarnings = calculateWarnings(
        { ...growthForm, [name]: value },
        childForm.dateOfBirth
      );
      return { ...prev, ...newWarnings };
    });
  }, [growthForm, childForm.dateOfBirth]);

  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    // Validate dữ liệu của bé
    const childErrors = addChildForm(childForm);
    setErrors((prev) => ({ ...prev, ...childErrors }));
    if (Object.values(childErrors).some((msg) => msg)) return;
  
    // Kiểm tra xem có dữ liệu growth nào được nhập không
    let hasGrowthData = false;
    ["createdAt", "weight", "height"].forEach((field) => {
      if (growthForm[field] && growthForm[field].toString().trim() !== "") {
        hasGrowthData = true;
      }
    });

   // Nếu có dữ liệu growth, validate nó
  if (hasGrowthData) {
    const growthErrors = growthRecordForm(growthForm, childForm.dateOfBirth);
    setErrors((prev) => ({ ...prev, ...growthErrors }));
    if (Object.values(growthErrors).some((msg) => msg)) return;
  }

  try {
    // Chuẩn bị payload cho việc tạo trẻ
    const childPayload = {
      ...childForm,
      name: childForm.name.trim(),
      dateOfBirth: formatDateToYYYYMMDD(childForm.dateOfBirth),
      birthWeight: Number(childForm.birthWeight) || 0,
      birthHeight: Number(childForm.birthHeight) || 0,
    };

    // Tạo trẻ mới
    await childApi.createChild(childPayload);

    // Nếu có dữ liệu growth, tạo growth record
    if (hasGrowthData) {
      const growthPayload = {
        name: childForm.name,
        dateOfBirth: new Date(childForm.dateOfBirth).toISOString().split("T")[0],
        recordedBy: childForm.memberId,
        createdAt: formatDateToYYYYMMDD(growthForm.createdAt || new Date()),
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

      // Gửi yêu cầu tạo growth record
      const growthRes = await childApi.createGrowthRecord(growthPayload);
      console.log("Growth record created:", growthRes.data);
    }

    // Cập nhật trạng thái submitted để hiển thị thông báo thành công
    setSubmitted(true);
  } catch (err) {
    console.error("Error submitting data:", err);
    setErrors((prev) => ({
      ...prev,
      submit: "Failed to submit data. Please try again.",
    }));
  }
};

  if (submitted) {
    return (
      <div className="add-child-overlay">
        <div className="add-child-wizard congrats-container">
          <h2 className="congrats-text">
            Congratulation!<br />
            Welcome <span className="highlight-pink">{childForm.name}</span> to{" "}
            <span className="highlight-teal">BabyHaven</span>
          </h2>
          <img src={baby} alt="Baby" className="baby-image" />
          <button type="button" onClick={closeOverlay} className="close-button">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="add-child-overlay"
      onClick={(e) => e.target === e.currentTarget && closeOverlay()}
    >
      <div className="add-child-wizard" onClick={(e) => e.stopPropagation()}>
        <button className="close-button-record" onClick={closeOverlay}>
          ×
        </button>

        <div className="wizard-left">
          <div className="blue-bar" />
          <div className="wizard-left-content">
            <h1 className="main-title">Enter your baby’s information</h1>
          </div>
          <div className="babygrowth-img">
            <img src={BabyGrowth} alt="Baby Growth" />
          </div>
        </div>

        <div className="wizard-right">
          <div className="step-form">
            {/* Baby's Name Section */}
            <div className="form-section baby-name-card">
              <h3>Baby’s Name</h3>
              <div>
                <label>
                  Baby’s name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter baby's name"
                  name="name"
                  value={childForm.name}
                  onChange={handleChildChange}
                  className={errors.name ? "error-input" : ""}
                />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>
            </div>

            {/* Gender Section */}
            <div className="form-section gender-card">
              <h3>Baby’s Gender</h3>
              <div>
                <label>
                  Gender of baby <span className="required-star">*</span>
                </label>
                <div className="gender-buttons">
                  <button
                    className={`btn-gender male-btn ${
                      childForm.gender === "Male" ? "active-gender" : ""
                    } ${errors.gender ? "error-input" : ""}`}
                    onClick={() =>
                      setChildForm((prev) => ({ ...prev, gender: "Male" }))
                    }
                  >
                    Male
                  </button>
                  <button
                    className={`btn-gender female-btn ${
                      childForm.gender === "Female" ? "active-gender" : ""
                    } ${errors.gender ? "error-input" : ""}`}
                    onClick={() =>
                      setChildForm((prev) => ({ ...prev, gender: "Female" }))
                    }
                  >
                    Female
                  </button>
                </div>
                {errors.gender && <p className="error-text">{errors.gender}</p>}
              </div>
            </div>

            {/* Date of Birth Section */}
            <div className="form-section date-section">
              <h3>Baby’s Date of Birth</h3>
              <label>
                Baby’s date of birth <span className="required-star">*</span>
              </label>
              <ReactDatePicker
                selected={childForm.dateOfBirth ? new Date(childForm.dateOfBirth) : null}
                onChange={(date) =>
                  setChildForm((prev) => ({
                    ...prev,
                    dateOfBirth: date ? date.toISOString() : "",
                  }))
                }
                dateFormat="dd/MM/yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                className={errors.dateOfBirth ? "error-input" : ""}
                placeholderText="Select date of birth"
                maxDate={new Date()}
              />
              {errors.dateOfBirth && (
                <p className="error-text">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Basic Measurements Section */}
            <div className="form-section measurements-card">
              <h3>Basic Measurements</h3>
              <div className="measurements-section">
                <div>
                  <label>Birth weight (kg)</label>
                  <input
                    type="number"
                    placeholder="kg"
                    name="birthWeight"
                    value={childForm.birthWeight}
                    onChange={handleChildChange}
                    min="0"
                    className={errors.birthWeight ? "error-input" : ""}
                  />
                  {errors.birthWeight && (
                    <p className="error-text">{errors.birthWeight}</p>
                  )}
                </div>
                <div>
                  <label>Birth height (cm)</label>
                  <input
                    type="number"
                    placeholder="cm"
                    name="birthHeight"
                    value={childForm.birthHeight}
                    onChange={handleChildChange}
                    min="0"
                    className={errors.birthHeight ? "error-input" : ""}
                  />
                  {errors.birthHeight && (
                    <p className="error-text">{errors.birthHeight}</p>
                  )}
                </div>
              </div>
              <div className="notes-section">
                <label>Notes</label>
                <input
                  type="text"
                  placeholder="Any note..."
                  name="notes"
                  value={childForm.notes}
                  onChange={handleChildChange}
                />
              </div>
            </div>

            {/* Growth Record */}
            <details>
              <summary>Growth Record (click to expand)</summary>
              <div className="form-section">
                <h3>Growth Record</h3>
                <div className="measurements-section">
                  <div>
                    <label>Record Date</label>
                    <input
                      type="date"
                      value={growthForm.createdAt}
                      onChange={handleGrowthChange}
                      name="createdAt"
                      max={new Date().toISOString().split("T")[0]}
                      className={errors.createdAt ? "error-input" : ""}
                    />
                    {errors.createdAt && (
                      <p className="error-text">{errors.createdAt}</p>
                    )}
                  </div>
                  <div>
                    <label>Baby's weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={growthForm.weight}
                      onChange={handleGrowthChange}
                      min="0"
                      className={errors.weight ? "error-input" : ""}
                    />
                    {errors.weight && (
                      <p className="error-text">{errors.weight}</p>
                    )}
                    {warnings.weight && (
                      <p className="warning-text">{warnings.weight}</p>
                    )}
                  </div>
                  <div>
                    <label>Baby's height (cm)</label>
                    <input
                      type="number"
                      name="height"
                      value={growthForm.height}
                      onChange={handleGrowthChange}
                      min="0"
                      className={errors.height ? "error-input" : ""}
                    />
                    {errors.height && (
                      <p className="error-text">{errors.height}</p>
                    )}
                    {warnings.height && (
                      <p className="warning-text">{warnings.height}</p>
                    )}
                  </div>
                  <div>
                    <label>Head circumference (cm)</label>
                    <input
                      type="number"
                      name="headCircumference"
                      value={growthForm.headCircumference}
                      onChange={handleGrowthChange}
                      min="0"
                    />
                    {warnings.headCircumference && (
                      <p className="warning-text">{warnings.headCircumference}</p>
                    )}
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
                    onChange={handleGrowthChange}
                  />
                </div>
              </div>
            </details>

            {/* Recommendations for Your Baby */}
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
                      onChange={handleGrowthChange}
                    />
                  </div>
                  <div>
                    <label>Physical activity level</label>
                    <input
                      type="text"
                      name="physicalActivityLevel"
                      value={growthForm.physicalActivityLevel}
                      onChange={handleGrowthChange}
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
                      onChange={handleGrowthChange}
                      min="0"
                    />
                    {warnings.ferritinLevel && (
                      <p className="warning-text">{warnings.ferritinLevel}</p>
                    )}
                  </div>
                  <div>
                    <label>Triglycerides (mg/dL)</label>
                    <input
                      type="number"
                      name="triglycerides"
                      value={growthForm.triglycerides}
                      onChange={handleGrowthChange}
                      min="0"
                    />
                    {warnings.triglycerides && (
                      <p className="warning-text">{warnings.triglycerides}</p>
                    )}
                  </div>
                  <div>
                    <label>Blood sugar level (mg/dL)</label>
                    <input
                      type="number"
                      name="bloodSugarLevel"
                      value={growthForm.bloodSugarLevel}
                      onChange={handleGrowthChange}
                      min="0"
                    />
                    {warnings.bloodSugarLevel && (
                      <p className="warning-text">{warnings.bloodSugarLevel}</p>
                    )}
                  </div>
                  <div>
                    <label>Chest circumference (cm)</label>
                    <input
                      type="number"
                      name="chestCircumference"
                      value={growthForm.chestCircumference}
                      onChange={handleGrowthChange}
                      min="0"
                    />
                    {warnings.chestCircumference && (
                      <p className="warning-text">{warnings.chestCircumference}</p>
                    )}
                  </div>
                </div>
              </div>
            </details>

            {/* Additional Health Measurements */}
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
                      onChange={handleGrowthChange}
                      min="0"
                    />
                    {warnings.heartRate && (
                      <p className="warning-text">{warnings.heartRate}</p>
                    )}
                  </div>
                  <div>
                    <label>Blood pressure (mmHg)</label>
                    <input
                      type="number"
                      name="bloodPressure"
                      value={growthForm.bloodPressure}
                      onChange={handleGrowthChange}
                      min="0"
                    />
                    {warnings.bloodPressure && (
                      <p className="warning-text">{warnings.bloodPressure}</p>
                    )}
                  </div>
                  <div>
                    <label>Body temperature (°C)</label>
                    <input
                      type="number"
                      name="bodyTemperature"
                      value={growthForm.bodyTemperature}
                      onChange={handleGrowthChange}
                      min="0"
                      className={errors.bodyTemperature ? "error-input" : ""}
                    />
                    {errors.bodyTemperature && (
                      <p className="error-text">{errors.bodyTemperature}</p>
                    )}
                    {warnings.bodyTemperature && (
                      <p className="warning-text">{warnings.bodyTemperature}</p>
                    )}
                  </div>
                  <div>
                    <label>Oxygen saturation (%)</label>
                    <input
                      type="number"
                      name="oxygenSaturation"
                      value={growthForm.oxygenSaturation}
                      onChange={handleGrowthChange}
                      min="0"
                      className={errors.oxygenSaturation ? "error-input" : ""}
                    />
                    {errors.oxygenSaturation && (
                      <p className="error-text">{errors.oxygenSaturation}</p>
                    )}
                    {warnings.oxygenSaturation && (
                      <p className="warning-text">{warnings.oxygenSaturation}</p>
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
                      onChange={handleGrowthChange}
                      min="0"
                      className={errors.sleepDuration ? "error-input" : ""}
                    />
                    {errors.sleepDuration && (
                      <p className="error-text">{errors.sleepDuration}</p>
                    )}
                    {warnings.sleepDuration && (
                      <p className="warning-text">{warnings.sleepDuration}</p>
                    )}
                  </div>
                  <div>
                    <label>Growth hormone level (ng/mL)</label>
                    <input
                      type="number"
                      name="growthHormoneLevel"
                      value={growthForm.growthHormoneLevel}
                      onChange={handleGrowthChange}
                      min="0"
                      className={errors.growthHormoneLevel ? "error-input" : ""}
                    />
                    {errors.growthHormoneLevel && (
                      <p className="error-text">{errors.growthHormoneLevel}</p>
                    )}
                    {warnings.growthHormoneLevel && (
                      <p className="warning-text">{warnings.growthHormoneLevel}</p>
                    )}
                  </div>
                  <div>
                    <label>Muscle mass (kg)</label>
                    <input
                      type="number"
                      name="muscleMass"
                      value={growthForm.muscleMass}
                      onChange={handleGrowthChange}
                      min="0"
                    />
                    {warnings.muscleMass && (
                      <p className="warning-text">{warnings.muscleMass}</p>
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
                      onChange={handleGrowthChange}
                    />
                  </div>
                  <div>
                    <label>Vision</label>
                    <input
                      type="text"
                      name="vision"
                      value={growthForm.vision}
                      onChange={handleGrowthChange}
                    />
                  </div>
                  <div>
                    <label>Mental health status</label>
                    <input
                      type="text"
                      name="mentalHealthStatus"
                      value={growthForm.mentalHealthStatus}
                      onChange={handleGrowthChange}
                    />
                  </div>
                  <div>
                    <label>Immunization status</label>
                    <input
                      type="text"
                      name="immunizationStatus"
                      value={growthForm.immunizationStatus}
                      onChange={handleGrowthChange}
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
                      onChange={handleGrowthChange}
                    />
                  </div>
                  <div>
                    <label>Neurological reflexes</label>
                    <input
                      type="text"
                      name="neurologicalReflexes"
                      value={growthForm.neurologicalReflexes}
                      onChange={handleGrowthChange}
                    />
                  </div>
                </div>
                <div className="notes-section">
                  <label>Developmental milestones</label>
                  <input
                    type="text"
                    name="developmentalMilestones"
                    value={growthForm.developmentalMilestones}
                    onChange={handleGrowthChange}
                  />
                </div>
              </div>
            </details>

            <div className="step-buttons">
              <button type="button" onClick={handleSubmit}>
                Submit
              </button>
              {errors.submit && <p className="error-text">{errors.submit}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AddChild.propTypes = {
  closeOverlay: PropTypes.func.isRequired,
};

export default AddChild;