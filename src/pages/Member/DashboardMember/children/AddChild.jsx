import React, { useState, useEffect, useCallback, useMemo } from "react";
import childApi from "../../../../services/childApi";
import "./AddChild.css";
import calculateBMI from "../../../../services/bmiUtils";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import baby from "../../../../assets/baby.jpg";
import {
  validateStep1 as validateStep1Rules,
  validateStep2Page1 as validateStep2Page1Rules,
  validateStep2Page2 as validateStep2Page2Rules,
  validateStep2Page3 as validateStep2Page3Rules,
} from "../../../../data/childValidations";
import PropTypes from "prop-types";

const Step1 = React.memo(({ childForm, setChildForm, errors, onConfirm, onAddRecord }) => {
  return (
    <div className="step-form">
      <label>Baby’s name</label>
      <input
        type="text"
        placeholder="Enter baby's name"
        value={childForm.name}
        onChange={(e) => setChildForm((prev) => ({ ...prev, name: e.target.value }))}
        className={errors.name ? "error-input" : ""}
      />
      {errors.name && <p className="error-text">{errors.name}</p>}

      <label>Gender of baby</label>
      <div className="gender-buttons">
        <button
          className={`btn-gender male-btn ${childForm.gender === "Male" ? "active-gender" : ""} ${
            errors.gender ? "error-input" : ""
          }`}
          onClick={() => setChildForm((prev) => ({ ...prev, gender: "Male" }))}
        >
          Male
        </button>
        <button
          className={`btn-gender female-btn ${childForm.gender === "Female" ? "active-gender" : ""} ${
            errors.gender ? "error-input" : ""
          }`}
          onClick={() => setChildForm((prev) => ({ ...prev, gender: "Female" }))}
        >
          Female
        </button>
      </div>
      {errors.gender && <p className="error-text">{errors.gender}</p>}

      <label>Baby’s date of birth</label>
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
        maxDate={new Date()} // Giới hạn ngày tối đa là ngày hiện tại
      />
      {errors.dateOfBirth && <p className="error-text">{errors.dateOfBirth}</p>}

      <div className="two-column-row">
        <div>
          <label>Birth weight (kg)</label>
          <input
            type="number"
            placeholder="kg"
            value={childForm.birthWeight}
            onChange={(e) =>
              setChildForm((prev) => ({ ...prev, birthWeight: e.target.value }))
            }
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
          />
        </div>
        <div>
          <label>Birth height (cm)</label>
          <input
            type="number"
            placeholder="cm"
            value={childForm.birthHeight}
            onChange={(e) =>
              setChildForm((prev) => ({ ...prev, birthHeight: e.target.value }))
            }
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
          />
        </div>
      </div>

      <label>Notes</label>
      <input
        type="text"
        placeholder="Any note..."
        value={childForm.notes}
        onChange={(e) => setChildForm((prev) => ({ ...prev, notes: e.target.value }))}
      />

      <div className="step-buttons">
        <div className="button-cofirm">
          <button onClick={onConfirm}>Confirm</button>
        </div>
        <div className="button-add-record">
          <button onClick={onAddRecord}>Add a record</button>
        </div>
      </div>
    </div>
  );
});
Step1.displayName = "Step1";
Step1.propTypes = {
  childForm: PropTypes.object.isRequired,
  setChildForm: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onAddRecord: PropTypes.func.isRequired,
};

const Step2Page1 = React.memo(({ growthForm, setGrowthForm, errors, onConfirm, onOtherMeasure }) => {
  const handleWeightChange = useCallback(
    (e) => {
      const newWeight = e.target.value;
      const newBMI = calculateBMI(newWeight, growthForm.height);
      setGrowthForm((prev) => ({ ...prev, weight: newWeight, bmi: newBMI }));
      localStorage.setItem("bmi", newBMI);
    },
    [growthForm.height, setGrowthForm]
  );

  const handleHeightChange = useCallback(
    (e) => {
      const newHeight = e.target.value;
      const newBMI = calculateBMI(growthForm.weight, newHeight);
      setGrowthForm((prev) => ({ ...prev, height: newHeight, bmi: newBMI }));
      localStorage.setItem("bmi", newBMI);
    },
    [growthForm.weight, setGrowthForm]
  );

  return (
    <div className="step-form">
      <label>Date</label>
      <ReactDatePicker
        selected={growthForm.createdAt ? new Date(growthForm.createdAt) : null}
        onChange={(date) =>
          setGrowthForm((prev) => ({
            ...prev,
            createdAt: date ? date.toISOString() : "",
          }))
        }
        dateFormat="dd/MM/yyyy"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        className={errors.createdAt ? "error-input" : ""}
        placeholderText="Select record date"
        maxDate={new Date()} // Giới hạn ngày tối đa là ngày hiện tại
      />
      {errors.createdAt && <p className="error-text">{errors.createdAt}</p>}

      <div className="two-column-row">
        <div>
          <label>Baby's weight (kg)</label>
          <input
            type="number"
            value={growthForm.weight}
            onChange={handleWeightChange}
            className={errors.weight ? "error-input" : ""}
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
          />
          {errors.weight && <p className="error-text">{errors.weight}</p>}
        </div>
        <div>
          <label>Baby's height (cm)</label>
          <input
            type="number"
            value={growthForm.height}
            onChange={handleHeightChange}
            className={errors.height ? "error-input" : ""}
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
          />
          {errors.height && <p className="error-text">{errors.height}</p>}
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
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
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
        onChange={(e) => setGrowthForm((prev) => ({ ...prev, notes: e.target.value }))}
      />

      <div className="step-buttons">
        <div className="button-cofirm">
          <button onClick={onConfirm}>Confirm</button>
        </div>
        <div className="button-add-record">
          <button type="button" onClick={onOtherMeasure}>
            Other measure
          </button>
        </div>
      </div>
    </div>
  );
});
Step2Page1.displayName = "Step2Page1";
Step2Page1.propTypes = {
  growthForm: PropTypes.object.isRequired,
  setGrowthForm: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onOtherMeasure: PropTypes.func.isRequired,
};

const Step2Page2 = React.memo(({ growthForm, setGrowthForm, errors, onConfirm, onOtherMeasure }) => {
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
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
          />
          {errors.ferritinLevel && <p className="error-text">{errors.ferritinLevel}</p>}
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
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
          />
          {errors.triglycerides && <p className="error-text">{errors.triglycerides}</p>}
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
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
          />
          {errors.bloodSugarLevel && <p className="error-text">{errors.bloodSugarLevel}</p>}
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
            className={errors.chestCircumference ? "error-input" : ""}
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
          />
          {errors.chestCircumference && <p className="error-text">{errors.chestCircumference}</p>}
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
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
          />
          {errors.heartRate && <p className="error-text">{errors.heartRate}</p>}
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
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
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
            className={errors.bodyTemperature ? "error-input" : ""}
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
          />
          {errors.bodyTemperature && <p className="error-text">{errors.bodyTemperature}</p>}
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
            className={errors.oxygenSaturation ? "error-input" : ""}
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
          />
          {errors.oxygenSaturation && <p className="error-text">{errors.oxygenSaturation}</p>}
        </div>
      </div>
      <div className="step-buttons">
        <div className="button-cofirm">
          <button onClick={onConfirm}>Confirm</button>
        </div>
        <div className="button-add-record">
          <button type="button" onClick={onOtherMeasure}>
            Other measure
          </button>
        </div>
      </div>
    </div>
  );
});
Step2Page2.displayName = "Step2Page2";
Step2Page2.propTypes = {
  growthForm: PropTypes.object.isRequired,
  setGrowthForm: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onOtherMeasure: PropTypes.func.isRequired,
};

const Step2Page3 = React.memo(({ growthForm, setGrowthForm, errors, onConfirm }) => {
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
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
          />
          {errors.sleepDuration && <p className="error-text">{errors.sleepDuration}</p>}
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
            className={errors.growthHormoneLevel ? "error-input" : ""}
            min="0"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") {
                e.preventDefault();
              }
            }}
          />
          {errors.growthHormoneLevel && <p className="error-text">{errors.growthHormoneLevel}</p>}
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
            className={errors.hearing ? "error-input" : ""}
          />
          {errors.hearing && <p className="error-text">{errors.hearing}</p>}
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
          {errors.vision && <p className="error-text">{errors.vision}</p>}
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
            className={errors.mentalHealthStatus ? "error-input" : ""}
          />
          {errors.mentalHealthStatus && <p className="error-text">{errors.mentalHealthStatus}</p>}
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
            className={errors.immunizationStatus ? "error-input" : ""}
          />
          {errors.immunizationStatus && <p className="error-text">{errors.immunizationStatus}</p>}
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
            className={errors.attentionSpan ? "error-input" : ""}
          />
          {errors.attentionSpan && <p className="error-text">{errors.attentionSpan}</p>}
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
            className={errors.neurologicalReflexes ? "error-input" : ""}
          />
          {errors.neurologicalReflexes && (
            <p className="error-text">{errors.neurologicalReflexes}</p>
          )}
        </div>
      </div>
      <div className="step-buttons">
        <div className="button-cofirm">
          <button onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
});
Step2Page3.displayName = "Step2Page3";
Step2Page3.propTypes = {
  growthForm: PropTypes.object.isRequired,
  setGrowthForm: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

// Main AddChild component
const AddChild = ({ closeOverlay }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [subStep2, setSubStep2] = useState(1);

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

  const [errors, setErrors] = useState({});
  const validateStep1 = useCallback(() => {
    const step1Err = validateStep1Rules(childForm);
    const merged = { ...errors, ...step1Err };
    setErrors(merged);
    const hasError = Object.values(step1Err).some((val) => val);
    return !hasError;
  }, [childForm, errors]);

  const validateStep2 = useCallback(() => {
    let step2Err = {};
    if (subStep2 === 1) {
      step2Err = validateStep2Page1Rules(growthForm, childForm.dateOfBirth);
    } else if (subStep2 === 2) {
      step2Err = validateStep2Page2Rules(growthForm);
    } else if (subStep2 === 3) {
      step2Err = validateStep2Page3Rules(growthForm);
    }
    const merged = { ...errors, ...step2Err };
    setErrors(merged);
    const hasError = Object.values(step2Err).some((val) => val);
    return !hasError;
  }, [growthForm, subStep2, errors, childForm.dateOfBirth]);

  const [childId, setChildId] = useState("");

  const handleConfirmStep1 = useCallback(async () => {
    if (!validateStep1()) return;
    try {
      const childPayload = {
        name: childForm.name.trim(),
        memberId: childForm.memberId,
        dateOfBirth: new Date(childForm.dateOfBirth).toISOString().split("T")[0],
        gender: childForm.gender,
        birthWeight: childForm.birthWeight || 0,
        birthHeight: childForm.birthHeight || 0,
        notes: childForm.notes,
      };
      const childRes = await childApi.createChild(childPayload);
      console.log("Child created:", childRes.data);
      setChildId(childRes.data?.data?.childId || "");
      setCurrentStep(3);
    } catch (err) {
      console.error("Error saving child data:", err);
    }
  }, [childForm, validateStep1]);

  const handleAddRecordStep1 = useCallback(async () => {
    if (!validateStep1()) return;
    const confirmed = window.confirm("Create child? OK to create and add record; Cancel to abort.");
    if (!confirmed) return;
    try {
      const childPayload = {
        name: childForm.name.trim(),
        memberId: childForm.memberId,
        dateOfBirth: new Date(childForm.dateOfBirth).toISOString().split("T")[0],
        gender: childForm.gender,
        birthWeight: childForm.birthWeight || 0,
        birthHeight: childForm.birthHeight || 0,
        notes: childForm.notes,
      };
      const childRes = await childApi.createChild(childPayload);
      console.log("Child created:", childRes.data);
      setChildId(childRes.data?.data?.childId || "");
      setCurrentStep(2);
      setSubStep2(1);
    } catch (err) {
      console.error("Error saving child data:", err);
    }
  }, [childForm, validateStep1]);

  const handleOtherMeasure = useCallback(() => {
    if (!validateStep2()) return;
    if (subStep2 < 3) {
      setSubStep2((prev) => prev + 1);
    }
  }, [validateStep2, subStep2]);

  const handleConfirmStep2 = useCallback(async () => {
    if (!validateStep2()) return;
    try {
      const growthPayload = {
        name: childForm.name,
        dateOfBirth: new Date(childForm.dateOfBirth).toISOString().split("T")[0],
        recordedBy: childForm.memberId,
        createdAt: growthForm.createdAt || new Date().toISOString(),
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
      setCurrentStep(3);
    } catch (err) {
      console.error("Error saving growth record:", err);
    }
  }, [validateStep2, childForm, growthForm]);

  const handleCloseStep3 = useCallback(() => {
    window.location.reload();
    closeOverlay();
  }, [closeOverlay]);

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        closeOverlay();
      }
    },
    [closeOverlay]
  );

  const getStepTitle = useMemo(() => {
    if (currentStep === 1) {
      return "Enter your baby’s information to let us follow every tiny angel’s step";
    } else if (currentStep === 2) {
      if (subStep2 === 1)
        return "Enter a new growth record to track your baby's health automatically";
      if (subStep2 === 2) return "Recommendations for your baby";
      if (subStep2 === 3) return "Others";
    }
    return "";
  }, [currentStep, subStep2]);

  const handlePrevious = () => {
    if (subStep2 > 1) {
      setSubStep2((prev) => prev - 1);
    }
  };

  const renderStepContent = useMemo(() => {
    if (currentStep === 1) {
      return (
        <Step1
          childForm={childForm}
          setChildForm={setChildForm}
          errors={errors}
          onConfirm={handleConfirmStep1}
          onAddRecord={handleAddRecordStep1}
        />
      );
    } else if (currentStep === 2) {
      if (subStep2 === 1) {
        return (
          <Step2Page1
            growthForm={growthForm}
            setGrowthForm={setGrowthForm}
            errors={errors}
            onConfirm={handleConfirmStep2}
            onOtherMeasure={handleOtherMeasure}
          />
        );
      } else if (subStep2 === 2) {
        return (
          <Step2Page2
            growthForm={growthForm}
            setGrowthForm={setGrowthForm}
            errors={errors}
            onConfirm={handleConfirmStep2}
            onOtherMeasure={handleOtherMeasure}
          />
        );
      } else if (subStep2 === 3) {
        return (
          <Step2Page3
            growthForm={growthForm}
            setGrowthForm={setGrowthForm}
            errors={errors}
            onConfirm={handleConfirmStep2}
          />
        );
      }
    }
    return null;
  }, [
    currentStep,
    subStep2,
    childForm,
    growthForm,
    errors,
    handleConfirmStep1,
    handleAddRecordStep1,
    handleConfirmStep2,
    handleOtherMeasure,
  ]);

  return (
    <div className="add-child-overlay" onClick={handleOverlayClick}>
      <div className="add-child-wizard" onClick={(e) => e.stopPropagation()}>
        {currentStep !== 3 && (
          <button type="button" className="close-btn" onClick={closeOverlay}>
            ×
          </button>
        )}
        <div className="wizard-left">
          <div className="blue-bar"></div>
          <div className="wizard-left-content">
            {currentStep === 3 ? (
              <h2 className="congrats-text" style={{ color: "#000" }}>
                Congratulation
                <span style={{ color: "#D970FF" }}>! </span>
                <br />
                <span>Welcome</span>
                <br />
                <span style={{ color: "#FF00CC" }}>{childForm.name}</span> to{" "}
                <span style={{ color: "#00D0BC" }}>BabyHaven</span>
              </h2>
            ) : (
              <>
                <h1 className="main-title">{getStepTitle}</h1>
                <div className="step-labels">
                  <div className={`step-label ${currentStep === 1 ? "active-step" : ""}`}>
                    1. Enter information
                  </div>
                  <div className={`step-label ${currentStep === 2 ? "active-step" : ""}`}>
                    2. Add a new growth record
                  </div>
                  <div className={`step-label ${currentStep === 3 ? "active-step" : ""}`}>
                    3. Submit
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="wizard-right">
          {currentStep === 3 ? (
            <div className="step3-wrapper">
              <img src={baby} alt="Baby" className="baby-image" />
              <div className="step-buttons">
                <div className="button-cofirm">
                  <button type="button" onClick={handleCloseStep3}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {renderStepContent}
              {currentStep === 2 && subStep2 > 1 && (
                <div className="step-buttons">
                  <button type="button" className="previous-btn" onClick={handlePrevious}>
                    Previous
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

AddChild.propTypes = {
  closeOverlay: PropTypes.func.isRequired,
};

export default AddChild;