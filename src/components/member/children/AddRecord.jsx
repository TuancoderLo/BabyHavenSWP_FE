import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import childApi from "../../../services/childApi";
import "./AddRecord.css";

const AddRecord = ({ child, memberId, closeOverlay }) => {
  if (!child) {
    return (
      <div className="add-record-overlay" onClick={closeOverlay}>
        <div className="add-record-wizard" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="close-btn" onClick={closeOverlay}>
            ×
          </button>
          <div className="notification-board">
            <h2>No Child Selected</h2>
            <p>Please select a child or add a new child to continue.</p>
            <button type="button" onClick={closeOverlay}>Close</button>
          </div>
        </div>
      </div>
    );
  }
  // Fetch child details using GET /api/Children/{childId}
  const [setChildDetails] = useState(null);
 
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

  // Step management: 1 = record entry (split in 3 substeps), 2 = success message
  const [currentStep, setCurrentStep] = useState(1);
  // subStep2: 1, 2, or 3 corresponding to the multi-page form
  const [subStep2, setSubStep2] = useState(1);

  const validateGrowthForm = useCallback(() => {
    const newErrors = { ...errors };
    let isValid = true;
    if (!growthForm.createdAt) {
      newErrors.createdAt = "Please select date";
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

  const handleConfirmGrowthRecord = useCallback(async () => {
    if (!validateGrowthForm()) return;
    if (subStep2 < 3) {
      setSubStep2((prev) => prev + 1);
      return;
    }
    try {
      const growthPayload = {
          name: child.name, // Only use child's name as needed
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
          bloodPressure:
            growthForm.bloodPressure,
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
      setCurrentStep(2);
    } catch (err) {
      console.error("Error saving growth record:", err);
    }
  }, [child, memberId, growthForm, subStep2, validateGrowthForm]);

  const handlePrevious = useCallback(() => {
    if (subStep2 > 1) setSubStep2((prev) => prev - 1);
  }, [subStep2]);

  const handleClose = useCallback(() => {
    closeOverlay();
  }, [closeOverlay]);


  const renderStepContent = useMemo(() => {
    if (currentStep === 1) {
      if (subStep2 === 1) {
        return (
          <div className="step-form">
            <label>Date</label>
            <ReactDatePicker
              selected={
                growthForm.createdAt ? new Date(growthForm.createdAt) : null
              }
              onChange={(date) =>
                setGrowthForm((prev) => ({
                  ...prev,
                  createdAt: date ? date.toISOString() : "",
                }))
              }
              dateFormat="dd/MM/yyyy"
              placeholderText="Select record date"
              className={errors.createdAt ? "error-input" : ""}
            />
            {errors.createdAt && (
              <p className="error-text">{errors.createdAt}</p>
            )}

            <div className="two-column-row">
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
                {errors.weight && (
                  <p className="error-text">{errors.weight}</p>
                )}
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
                {errors.height && (
                  <p className="error-text">{errors.height}</p>
                )}
              </div>
            </div>

            <div className="two-column-row">
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
                <input type="number" readOnly value={growthForm.bmi} />
              </div>
            </div>

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

            <div className="step-buttons">
              {/* Không có nút Previous cho subStep2=1 */}
              <div className="button-cofirm">
                <button type="button" onClick={handleConfirmGrowthRecord}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        );
      } 
      if (subStep2 === 2) {
        return (
          <div className="step-form">
            <div className="two-column-row">
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
            </div>

            <div className="two-column-row">
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
                  className={errors.ferritinLevel ? "error-input" : ""}
                />
                {errors.ferritinLevel && (
                  <p className="error-text">{errors.ferritinLevel}</p>
                )}
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
                  className={errors.triglycerides ? "error-input" : ""}
                />
                {errors.triglycerides && (
                  <p className="error-text">{errors.triglycerides}</p>
                )}
              </div>
            </div>

            <div className="two-column-row">
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
                  className={errors.bloodSugarLevel ? "error-input" : ""}
                />
                {errors.bloodSugarLevel && (
                  <p className="error-text">{errors.bloodSugarLevel}</p>
                )}
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
                  className={
                    errors.chestCircumference ? "error-input" : ""
                  }
                />
                {errors.chestCircumference && (
                  <p className="error-text">
                    {errors.chestCircumference}
                  </p>
                )}
              </div>
            </div>

            <div className="two-column-row">
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
                  className={errors.heartRate ? "error-input" : ""}
                />
                {errors.heartRate && (
                  <p className="error-text">{errors.heartRate}</p>
                )}
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
            </div>

            <div className="two-column-row">
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
                  className={
                    errors.bodyTemperature ? "error-input" : ""
                  }
                />
                {errors.bodyTemperature && (
                  <p className="error-text">{errors.bodyTemperature}</p>
                )}
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
                  className={
                    errors.oxygenSaturation ? "error-input" : ""
                  }
                />
                {errors.oxygenSaturation && (
                  <p className="error-text">
                    {errors.oxygenSaturation}
                  </p>
                )}
              </div>
            </div>

            <div className="step-buttons">
              <button type="button" className="previous-btn" onClick={handlePrevious}>
                Previous
              </button>
              <div className="button-cofirm">
                <button type="button" onClick={handleConfirmGrowthRecord}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        );
      }

      // subStep2 = 3 => tương tự Step2Page3
      if (subStep2 === 3) {
        return (
          <div className="step-form">
            <div className="two-column-row">
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
                  className={errors.sleepDuration ? "error-input" : ""}
                />
                {errors.sleepDuration && (
                  <p className="error-text">{errors.sleepDuration}</p>
                )}
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
                  className={
                    errors.growthHormoneLevel ? "error-input" : ""
                  }
                />
                {errors.growthHormoneLevel && (
                  <p className="error-text">
                    {errors.growthHormoneLevel}
                  </p>
                )}
              </div>
            </div>

            <div className="two-column-row">
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
                  className={errors.vision ? "error-input" : ""}
                />
                {errors.vision && (
                  <p className="error-text">{errors.vision}</p>
                )}
              </div>
            </div>

            <div className="two-column-row">
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

            <div className="two-column-row">
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

            <div className="step-buttons">
              <button type="button" className="previous-btn" onClick={handlePrevious}>
                Previous
              </button>
              <div className="button-cofirm">
                <button type="button" onClick={handleConfirmGrowthRecord}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        );
      }
    }

    // currentStep = 2 => hiển thị message success
    if (currentStep === 2) {
      return (
        <div className="step-form">
          <h2>Record Saved Successfully</h2>
          <p>Your growth record has been saved.</p>
          <div className="step-buttons">
            <div className="button-cofirm">
              <button type="button" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }, [
    currentStep,
    subStep2,
    growthForm,
    errors,
    handleConfirmGrowthRecord,
    handlePrevious,
    handleClose,
  ]);

  return (
    <div className="add-record-overlay" onClick={handleClose}>
      <div className="add-record-wizard" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="close-btn" onClick={handleClose}>
          ×
        </button>
        {/* Chỉ 1 cột, không có wizard-left, step-label */}
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