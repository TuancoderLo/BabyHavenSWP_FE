import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import childApi from "../../../../services/childApi";
import calculateBMI from "../../../../services/bmiUtils";
import BabyGrowth from "../../../../assets/baby_growth.png";
import alertApi from "../../../../services/alertApi";
import {
  growthStages,
  calculateAgeInMonths,
  getGrowthStage,
  validateGrowthRecordErrors,
  validateGrowthRecordSuggestions,
} from "../../../../data/childValidations"; // Updated import
import baby from "../../../../assets/baby.jpg";
import "./AddChild.css";
import PopupNotification from "../../../../layouts/Member/popUp/PopupNotification";

// Helper function chuyển key thành label hiển thị
function getFieldLabel(field) {
  const mapping = {
    createdAt: "Record Date",
    weight: "Weight (kg)",
    height: "Height (cm)",
    headCircumference: "Head circumference (cm)",
    chestCircumference: "Chest circumference (cm)",
    bodyTemperature: "Body temperature (°C)",
    heartRate: "Heart rate (bpm)",
    oxygenSaturation: "Oxygen saturation (%)",
    sleepDuration: "Sleep duration (hrs)",
  };
  return mapping[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

const AddChild = ({ closeOverlay }) => {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [stageInfo, setStageInfo] = useState(null); // lưu thông tin giai đoạn

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

  // Khi ngày sinh thay đổi, tính toán giai đoạn và lưu stageInfo
  useEffect(() => {
    if (childForm.dateOfBirth) {
      const ageInMonths = calculateAgeInMonths(childForm.dateOfBirth);
      const stage = getGrowthStage(ageInMonths);
      setStageInfo(growthStages[stage]);
    }
  }, [childForm.dateOfBirth]);

  const handleChildChange = useCallback((e) => {
    const { name, value } = e.target;
    setChildForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleGrowthChange = useCallback(
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
      if (childForm.dateOfBirth) {
        const newErrors = validateGrowthRecordErrors({ ...growthForm, [name]: value });
        const newSuggestions = validateGrowthRecordSuggestions(
          { ...growthForm, [name]: value },
          childForm.dateOfBirth,
          childForm.gender || "both"
        );
        setErrors((prev) => ({ ...prev, ...newErrors }));
        setWarnings((prev) => ({ ...prev, ...newSuggestions }));
      }
    },
    [growthForm, childForm.dateOfBirth, childForm.gender]
  );

  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const validateChildForm = () => {
    const errors = {};
    if (!childForm.name.trim()) errors.name = "Please enter the baby's name";
    if (!childForm.dateOfBirth) errors.dateOfBirth = "Please select a date of birth";
    if (!childForm.gender) errors.gender = "Please select the baby's gender";
    return errors;
  };

  const handleSubmit = async () => {
    const childErrors = validateChildForm();
 // Validate birthWeight if a value is entered
 if (childForm.birthWeight) {
  const birthWeight = Number(childForm.birthWeight);
  if (birthWeight > 10) {
    childErrors.birthWeight = "Birth weight must not exceed 10 kg";
  } else if (birthWeight < 0) {
    childErrors.birthWeight = "Birth weight cannot be negative";
  }
}

// Validate birthHeight if a value is entered
if (childForm.birthHeight) {
  const birthHeight = Number(childForm.birthHeight);
  if (birthHeight > 40) {
    childErrors.birthHeight = "Birth height must not exceed 40 cm";
  } else if (birthHeight < 0) {
    childErrors.birthHeight = "Birth height cannot be negative";
  }
}

setErrors(childErrors);
    if (Object.keys(childErrors).length > 0) return;

    let hasGrowthData = false;
    ["createdAt", "weight", "height"].forEach((field) => {
      if (growthForm[field] && growthForm[field].toString().trim() !== "") {
        hasGrowthData = true;
      }
    });

    if (hasGrowthData) {
      const growthErrors = validateGrowthRecordErrors(growthForm);
      const growthSuggestions = validateGrowthRecordSuggestions(
        growthForm,
        childForm.dateOfBirth,
        childForm.gender || "both"
      );
      setErrors((prev) => ({ ...prev, ...growthErrors }));
      setWarnings(growthSuggestions);
      if (Object.keys(growthErrors).length > 0) return;
      if (Object.keys(growthSuggestions).length > 0) {
        const confirmProceed = window.confirm(
          "Some entered values are outside the reference range. Are you sure you want to proceed?"
        );
        if (!confirmProceed) return;
      }
    }

    try {
      const childPayload = {
        ...childForm,
        name: childForm.name.trim(),
        dateOfBirth: formatDateToYYYYMMDD(childForm.dateOfBirth),
        birthWeight: Number(childForm.birthWeight) || 0,
        birthHeight: Number(childForm.birthHeight) || 0,
      };

      await childApi.createChild(childPayload);

      if (hasGrowthData) {
        const growthPayload = {
          name: childForm.name,
          dateOfBirth: formatDateToYYYYMMDD(childForm.dateOfBirth),
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
        await childApi.createGrowthRecord(growthPayload);
        try {
          const alertRes = await alertApi.getAlert(
            childForm.name,
            childForm.dateOfBirth,
            childForm.memberId
          );
          console.log("Alert created and fetched:", alertRes.data);
        } catch (alertErr) {
          console.error("Error creating/fetching alert:", alertErr);
        }
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting data:", err);
      setPopupType("error");
      setPopupMessage("Failed to add child. Please try again.");
      setShowPopup(true);
    }
  };

  if (submitted) {
    return (
      <div className="add-child-overlay">
        <div className="add-child-wizard congrats-container">
          <h2 className="congrats-text-child">
            Congratulation!<br />
            Welcome <span className="highlight-pink">{childForm.name}</span> to{" "}
            <span className="highlight-teal">BabyHaven</span>
          </h2>
          <img src={baby} alt="Baby" className="baby-image" />
          <button
            type="button"
            onClick={() => {
              closeOverlay();
              window.location.reload();
            }}
            className="close-button"
          >
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
            <h1 className="main-title-addchild">Enter your baby’s information</h1>
          </div>
          <div className="babygrowth-img-addchild">
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
                selected={
                  childForm.dateOfBirth ? new Date(childForm.dateOfBirth) : null
                }
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
              {stageInfo && (
                <p className="stage-info">Stage: {stageInfo.label}</p>
              )}
            </div>
            {/* Basic Measurements Section */}
            <div className="form-section measurements-card">
              <h3>Basic Measurements</h3>
           <div className="measurements-section">
  <div className="input-group">
    <label htmlFor="birthWeight">Birth Weight (kg)</label>
    <input
      type="number"
      id="birthWeight"
      placeholder="Enter birth weight"
      name="birthWeight"
      value={childForm.birthWeight}
      onChange={handleChildChange}
      min="0"
      max="10"
      step="0.1"
      className={errors.birthWeight ? "error-input" : ""}
    />
    {errors.birthWeight && <p className="error-text">{errors.birthWeight}</p>}
  </div>
  <div className="input-group">
    <label htmlFor="birthHeight">Birth Height (cm)</label>
    <input
      type="number"
      id="birthHeight"
      placeholder="Enter birth height"
      name="birthHeight"
      value={childForm.birthHeight}
      onChange={handleChildChange}
      min="0"
      max="40"
      step="0.1"
      className={errors.birthHeight ? "error-input" : ""}
    />
    {errors.birthHeight && <p className="error-text">{errors.birthHeight}</p>}
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
            {/* Growth Record Section - Render dynamic fields */}
            <details>
              <summary>Growth Record (click to expand)</summary>
              <div className="form-section">
                <h3>Growth Record</h3>
                <div className="measurements-section">
                  {/* Render required fields */}
                  {stageInfo &&
                    stageInfo.requiredFields.map((field) => {
                      if (field === "createdAt") {
                        return (
                          <div key={field}>
                            <label>
                              {getFieldLabel(field)}{" "}
                              <span className="required-asterisk">*</span>
                            </label>
                            <input
                              type="date"
                              name="createdAt"
                              value={growthForm.createdAt}
                              onChange={handleGrowthChange}
                              max={new Date().toISOString().split("T")[0]}
                              className={errors.createdAt ? "error-input" : ""}
                            />
                            {errors.createdAt && (
                              <p className="error-text">{errors.createdAt}</p>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <div key={field}>
                            <label>
                              {getFieldLabel(field)}{" "}
                              <span className="required-asterisk">*</span>
                            </label>
                            <input
                              type="number"
                              name={field}
                              value={growthForm[field] || ""}
                              onChange={handleGrowthChange}
                              min="0"
                              placeholder={
                                stageInfo?.reference?.[field]?.[childForm.gender?.toLowerCase()]?.avg?.join("–") ||
                                stageInfo?.reference?.[field]?.both?.avg?.join("–") ||
                                ""
                              }
                              className={errors[field] ? "error-input" : ""}
                              onKeyDown={(e) =>
                                ["-", "e"].includes(e.key) && e.preventDefault()
                              }
                            />
                            {errors[field] && (
                              <p className="error-text">{errors[field]}</p>
                            )}
                            {warnings[field] && (
                              <p className="warning-text-record">{warnings[field]}</p>
                            )}
                          </div>
                        );
                      }
                    })}
                  {/* Render optional fields */}
                  {stageInfo &&
                    stageInfo.optionalFields.map((field) => (
                      <div key={field}>
                        <label>{getFieldLabel(field)}</label>
                        <input
                          type="number"
                          name={field}
                          value={growthForm[field] || ""}
                          onChange={handleGrowthChange}
                          min="0"
                          placeholder={
                            stageInfo?.reference?.[field]?.[childForm.gender?.toLowerCase()]?.avg?.join("–") ||
                            stageInfo?.reference?.[field]?.both?.avg?.join("–") ||
                            ""
                          }
                          className={errors[field] ? "error-input" : ""}
                          onKeyDown={(e) =>
                            ["-", "e"].includes(e.key) && e.preventDefault()
                          }
                        />
                        {errors[field] && (
                          <p className="error-text">{errors[field]}</p>
                        )}
                        {warnings[field] && (
                          <p className="warning-text-record">{warnings[field]}</p>
                        )}
                      </div>
                    ))}
                  {/* BMI */}
                  <div>
                    <label>{getFieldLabel("bmi") || "BMI (kg/m²)"}</label>
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
            <button type="button" className="confirm-button-step1" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
      {showPopup && (
        <PopupNotification
          type={popupType}
          message={popupMessage}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

AddChild.propTypes = {
  closeOverlay: PropTypes.func.isRequired,
};

export default AddChild;
