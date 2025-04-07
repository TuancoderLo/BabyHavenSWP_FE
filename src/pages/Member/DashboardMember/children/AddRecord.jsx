import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
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
import PopupNotification from "../../../../layouts/Member/popUp/PopupNotification";
import "./AddRecord.css";

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

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [childDetails, setChildDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [stageInfo, setStageInfo] = useState(null); // lưu thông tin giai đoạn
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
        const ageInMonths = calculateAgeInMonths(child.dateOfBirth);
        const stage = getGrowthStage(ageInMonths);
        setStageInfo(growthStages[stage]);
      } catch (err) {
        console.error("Error fetching child details:", err);
        setErrorMessage("Failed to load child details. Please try again.");
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
      const newErrors = validateGrowthRecordErrors({ ...growthForm, [name]: value });
      const newSuggestions = validateGrowthRecordSuggestions(
        { ...growthForm, [name]: value },
        child.dateOfBirth,
        child.gender || "both"
      );
      setErrors(newErrors);
      setWarnings(newSuggestions);
    },
    [growthForm, child.dateOfBirth, child.gender]
  );
  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 10);
  };

  // Kiểm tra record date không được trước ngày sinh của bé
  const checkRecordDateValid = () => {
    const recordDate = new Date(growthForm.createdAt);
    const birthDate = new Date(child.dateOfBirth);
    if (recordDate < birthDate) {
      setPopupType("error");
      setPopupMessage("Record date cannot be before the baby's birth date.");
      setShowPopup(true);
      return false;
    }
    return true;
  };
  
  // Sử dụng API getGrowthRecords để kiểm tra duplicate record trong 1 ngày
  const checkDuplicateRecord = async () => {
    try {
      const res = await childApi.getGrowthRecords(child.name, child.parentName);
      if (res.data && res.data.data) {
        const formattedRecordDate = formatDateToYYYYMMDD(growthForm.createdAt);
        // In ra console để kiểm tra giá trị sau khi định dạng (debug)
        console.log("Form record date:", formattedRecordDate);
        const duplicates = res.data.data.filter(
          (record) => formatDateToYYYYMMDD(record.createdAt) === formattedRecordDate
        );
        console.log("Duplicate records:", duplicates);
        if (duplicates.length > 0) {
          return window.confirm(
            "A record for this date already exists. Do you want to replace it?"
          );
        }
      }
    } catch (err) {
      console.error("Error checking duplicate record:", err);
    }
    return true;
  };
  
  

  const handleSubmit = useCallback(async () => {
    const growthErrors = validateGrowthRecordErrors(growthForm);
    const growthSuggestions = validateGrowthRecordSuggestions(
      growthForm,
      child.dateOfBirth,
      child.gender || "both"
    );
    setErrors(growthErrors);
    setWarnings(growthSuggestions);
    if (Object.keys(growthErrors).length > 0) return;
    if (Object.keys(growthSuggestions).length > 0) {
      const confirmProceed = window.confirm(
        "Some entered values are outside the reference range. Are you sure you want to proceed?"
      );
      if (!confirmProceed) return;
    }
    if (!checkRecordDateValid()) return;
    const duplicateOk = await checkDuplicateRecord();
    if (!duplicateOk) return;

    setIsLoading(true);
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

    try {
      await childApi.createGrowthRecord(growthPayload);
      setPopupType("success");
      setPopupMessage("Growth record added successfully.");
      setShowPopup(true);
      try {
        const alertRes = await alertApi.getAlert(child.name, child.dateOfBirth, memberId);
        console.log("Alert created and fetched:", alertRes.data);
      } catch (alertErr) {
        console.error("Error creating/fetching alert:", alertErr);
      }
    } catch (err) {
      console.error("Error submitting growth record:", err);
      setPopupType("error");
      setPopupMessage("Failed to add growth record. Please try again.");
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  }, [child, memberId, growthForm, closeOverlay]);

  return (
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
                {stageInfo && (
                  <p>
                    <strong>Stage:</strong> {stageInfo.label}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="wizard-content">
          {errorMessage && (
            <div className="error-message">
              <p>{errorMessage}</p>
            </div>
          )}
          <div className="step-form">
            <div className="form-section date-section">
              <h4>
                Record Date <span className="required-asterisk">*</span>
              </h4>
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
            </div>
            <div className="form-section">
              <h4>Basic Measurements</h4>
              <div className="measurements-section">
                {stageInfo &&
                  stageInfo.requiredFields.map((field) => {
                    if (field === "createdAt") return null;
                    return (
                      <div key={field}>
                        <label>
                          {getFieldLabel(field)}{" "}
                          {stageInfo.requiredFields.includes(field) && (
                            <span className="required-asterisk">*</span>
                          )}
                        </label>
                        <input
                          type="number"
                          name={field}
                          value={growthForm[field] || ""}
                          onChange={handleChange}
                          min="0"
                          placeholder={
                            stageInfo?.reference?.[field]?.[child.gender?.toLowerCase()]?.avg?.join("–") ||
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
                  })}
                {stageInfo &&
                  stageInfo.optionalFields.map((field) => (
                    <div key={field}>
                      <label>{getFieldLabel(field)}</label>
                      <input
                        type="number"
                        name={field}
                        value={growthForm[field] || ""}
                        onChange={handleChange}
                        min="0"
                        placeholder={
                          stageInfo?.reference?.[field]?.[child.gender?.toLowerCase()]?.avg?.join("–") ||
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
                  onChange={handleChange}
                />
              </div>
            </div>
            <button
              type="button"
              className="confirm-button-step1"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Record"}
            </button>
          </div>
        </div>
      </div>
      {showPopup && (
        <PopupNotification
          type={popupType}
          message={popupMessage}
          onClose={() => {
            setShowPopup(false);
            closeOverlay();
          }}
        />
      )}
    </div>
  );
};

AddRecord.propTypes = {
  child: PropTypes.object,
  memberId: PropTypes.string,
  closeOverlay: PropTypes.func.isRequired,
};

export default AddRecord;
