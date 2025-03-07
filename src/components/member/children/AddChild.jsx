import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import childApi from "../../../services/childApi";
import "./AddChild.css";
import calculateBMI from "../../../services/bmiUtils";
import PropTypes from "prop-types";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import baby from "../../../assets/baby.jpg";
// ---------------------
// Step components (memoized)
// ---------------------

const Step1 = memo(
  ({ childForm, setChildForm, errors, onConfirm, onAddRecord }) => {
    return (
      <div className="step-form">
        <label>Baby’s name</label>
        <input
          type="text"
          placeholder="Enter baby's name"
          value={childForm.name}
          onChange={(e) =>
            setChildForm((prev) => ({ ...prev, name: e.target.value }))
          }
          className={errors.name ? "error-input" : ""}
        />
        {errors.name && <p className="error-text">{errors.name}</p>}
        <label>Gender of baby</label>
        <div className="gender-buttons">
          <button
            type="button"
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
            type="button"
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
        />
        {errors.dateOfBirth && (
          <p className="error-text">{errors.dateOfBirth}</p>
        )}
        <div className="two-column-row">
          <div>
            <label>Birth weight (kg)</label>
            <input
              type="number"
              placeholder="kg"
              value={childForm.birthWeight}
              onChange={(e) =>
                setChildForm((prev) => ({
                  ...prev,
                  birthWeight: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label>Birth height (cm)</label>
            <input
              type="number"
              placeholder="cm"
              value={childForm.birthHeight}
              onChange={(e) =>
                setChildForm((prev) => ({
                  ...prev,
                  birthHeight: e.target.value,
                }))
              }
            />
          </div>
        </div>
        <label>Notes</label>
        <input
          type="text"
          placeholder="Any note..."
          value={childForm.notes}
          onChange={(e) =>
            setChildForm((prev) => ({ ...prev, notes: e.target.value }))
          }
        />
        <div className="step-buttons">
          <div className="button-cofirm">
          <button onClick={onConfirm}>
            Confirm
          </button>
          </div>
         <div className="button-add-record">
         <button onClick={onAddRecord}>
            Add a record
          </button>
         </div>
        </div>
      </div>
    );
  }
);
Step1.displayName = "Step1";

Step1.propTypes = {
    childForm: PropTypes.shape({
      name: PropTypes.string,
      gender: PropTypes.string,
      dateOfBirth: PropTypes.string,
      birthWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      birthHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      notes: PropTypes.string,
    }).isRequired,
    setChildForm: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onAddRecord: PropTypes.func.isRequired,
  };
  
const Step2Page1 = memo(
  ({ growthForm, setGrowthForm, errors, onConfirm, onOtherMeasure }) => {
    const handleWeightChange = useCallback(
      (e) => {
        const newWeight = e.target.value;
        const newBMI = calculateBMI(newWeight, growthForm.height);
        setGrowthForm((prev) => ({
          ...prev,
          weight: newWeight,
          bmi: newBMI,
        }));
        localStorage.setItem("bmi", newBMI);
      },
      [growthForm.height, setGrowthForm]
    );
    const handleHeightChange = useCallback(
      (e) => {
        const newHeight = e.target.value;
        const newBMI = calculateBMI(growthForm.weight, newHeight);
        setGrowthForm((prev) => ({
          ...prev,
          height: newHeight,
          bmi: newBMI,
        }));
        localStorage.setItem("bmi", newBMI);
      },
      [growthForm.weight, setGrowthForm]
    );

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
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          className={errors.createdAt ? "error-input" : ""} // You can also rename the error key if needed.
          placeholderText="Select record date"
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
              onChange={handleWeightChange}
              className={errors.weight ? "error-input" : ""}
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
            setGrowthForm((prev) => ({ ...prev, notes: e.target.value }))
          }
        />
        <div className="step-buttons">
        <div className="button-cofirm">
          <button onClick={onConfirm}>
            Confirm
          </button>
          </div>
          <div className="button-add-record">
          <button type="button" onClick={onOtherMeasure}>
            Other measure
          </button>
          </div>
        </div>
      </div>
    );
  }
);
Step2Page1.displayName = "Step2Page1";

Step2Page1.propTypes = {
  growthForm: PropTypes.shape({
    createdAt: PropTypes.string,
    weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    headCircumference: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bmi: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    notes: PropTypes.string,
  }).isRequired,
  setGrowthForm: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onOtherMeasure: PropTypes.func.isRequired,
};

const Step2Page2 = memo(
  ({ growthForm, setGrowthForm, errors, onConfirm, onOtherMeasure }) => {
    // Fields for chest, nutritional, and blood work measures
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
            />
            {errors.oxygenSaturation && <p className="error-text">{errors.oxygenSaturation}</p>}
          </div>
        </div>
        <div className="step-buttons">
        <div className="button-cofirm">
          <button onClick={onConfirm}>
            Confirm
          </button>
          </div>
          <div className="button-add-record">
          <button type="button" onClick={onOtherMeasure}>
            Other measure
          </button>
          </div>
        </div>
      </div>
    );
  }
);
Step2Page2.displayName = "Step2Page2";
Step2Page2.propTypes = {
  growthForm: PropTypes.shape({
    chestCircumference: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nutritionalStatus: PropTypes.string,
    ferritinLevel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    triglycerides: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bloodSugarLevel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    physicalActivityLevel: PropTypes.string,
    heartRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bloodPressure: PropTypes.string,
    bodyTemperature: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    oxygenSaturation: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  setGrowthForm: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onOtherMeasure: PropTypes.func.isRequired,
};

const Step2Page3 = memo(
  ({ growthForm, setGrowthForm, errors, onConfirm, onOtherMeasure }) => {
    // Fields for sleep, vision, hearing, immunization, mental health & hormone levels
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
        <div className="step-buttons">
        <div className="button-cofirm">
          <button onClick={onConfirm}>
            Confirm
          </button>
          </div>
        </div>
      </div>
    );
  }
);
Step2Page3.displayName = "Step2Page3";
Step2Page3.propTypes = {
  growthForm: PropTypes.shape({
    sleepDuration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    vision: PropTypes.string,
    hearing: PropTypes.string,
    immunizationStatus: PropTypes.string,
    mentalHealthStatus: PropTypes.string,
    growthHormoneLevel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    attentionSpan: PropTypes.string,
    neurologicalReflexes: PropTypes.string,
  }).isRequired,
  setGrowthForm: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onOtherMeasure: PropTypes.func.isRequired,
};
// const Step3 = memo(({ childForm, onClose }) => {
//   return (
//     <div className="step3-container">
//       <div className="step3-content">
//         <h2>
//           Congratulation, welcome <span className="baby-name">{childForm.name}</span> to <span className="babyhaven">BabyHaven</span>
//         </h2>
//       </div>

//       <div className="step3-image">
//         <img src={baby} alt="Baby" className="baby-image" />
//       </div>
//       <div className="step-buttons">
//           <button type="button" onClick={onClose}>
//             Close
//           </button>
//           </div>
//     </div>
    
//   );
// });


// Step3.displayName = "Step3";

// Step3.propTypes = {
//   childForm: PropTypes.shape({
//     name: PropTypes.string,
//   }).isRequired,
//   onClose: PropTypes.func.isRequired,
// };

// ---------------------
// Main AddChild component
// ---------------------
const AddChild = ({ closeOverlay }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [subStep2, setSubStep2] = useState(1);

  const [childForm, setChildForm] = useState({
    name: "",
    memberId: localStorage.getItem("memberId"),
    dateOfBirth: "",
    gender: "",
    birthWeight: 0,
    birthHeight: 0,
    notes: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    gender: "",
    dateOfBirth: "",
    recordDate: "",
    weight: "",
    height: "",
  });

  // Immediately validate dateOfBirth when it changes
  useEffect(() => {
    if (childForm.dateOfBirth) {
      const birthDate = new Date(childForm.dateOfBirth);
      const today = new Date();
      let error = "";
      // Check if birthDate is in the future.
      if (birthDate > today) {
        error = "Date of birth cannot be in the future";
      } else {
        // Check if child is under 18 years old.
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
        if (birthDate < eighteenYearsAgo) {
          error = "Child must be under 18 years old";
        }
      }
      setErrors((prev) => ({ ...prev, dateOfBirth: error }));
    }
  }, [childForm.dateOfBirth]);

  useEffect(() => {
    const storedMemberId = localStorage.getItem("memberId");
    if (storedMemberId) {
      console.log("Member ID:", storedMemberId);
    } else {
      console.log("No user ID found in localStorage.");
    }
  }, []);
 

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

  useEffect(() => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      // Validate createdAt
      if (growthForm.createdAt) {
        const recordDate = new Date(growthForm.createdAt);
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        if (recordDate > today) {
          newErrors.createdAt = "Record date cannot be in the future";
        } else if (recordDate < sixMonthsAgo) {
          newErrors.createdAt = "Record date cannot be older than 6 months";
        } else {
          newErrors.createdAt = "";
        }
      }

      // Validate numeric fields (nếu có dữ liệu, chuyển sang số và kiểm tra)
      if (growthForm.weight !== "" && parseFloat(growthForm.weight) < 0) {
        newErrors.weight = "Weight must not be less than 0";
      }
      if (growthForm.height !== "" && parseFloat(growthForm.height) < 0) {
        newErrors.height = "Height must not be less than 0";
      }
      if (growthForm.headCircumference !== "" && parseFloat(growthForm.headCircumference) < 0) {
        newErrors.headCircumference = "Head circumference must not be less than 0";
      }
      if (growthForm.muscleMass !== "" && parseFloat(growthForm.muscleMass) < 0) {
        // Nếu cần validation, thêm tương tự
      }
      if (growthForm.chestCircumference !== "" && parseFloat(growthForm.chestCircumference) < 0) {
        newErrors.chestCircumference = "Chest circumference must not be less than 0";
      }
      if (growthForm.ferritinLevel !== "" && parseFloat(growthForm.ferritinLevel) < 0) {
        newErrors.ferritinLevel = "Ferritin level must not be less than 0";
      }
      if (growthForm.triglycerides !== "" && parseFloat(growthForm.triglycerides) < 0) {
        newErrors.triglycerides = "Triglycerides must not be less than 0";
      }
      if (growthForm.bloodSugarLevel !== "" && parseFloat(growthForm.bloodSugarLevel) < 0) {
        newErrors.bloodSugarLevel = "Blood sugar level must not be less than 0";
      }
      if (growthForm.heartRate !== "" && parseFloat(growthForm.heartRate) < 0) {
        newErrors.heartRate = "Heart rate must not be less than 0";
      }
      if (growthForm.growthHormoneLevel !== "" && parseFloat(growthForm.growthHormoneLevel) < 0) {
        newErrors.growthHormoneLevel = "Growth hormone level must not be less than 0";
      }

      // Validate bodyTemperature
      if (growthForm.bodyTemperature !== "") {
        const bt = parseFloat(growthForm.bodyTemperature);
        if (bt < 0) {
          newErrors.bodyTemperature = "Body temperature must not be less than 0";
        } else if (bt >= 45) {
          newErrors.bodyTemperature = "Body temperature must be below 45°C";
        } else {
          newErrors.bodyTemperature = "";
        }
      }

      // Validate oxygenSaturation
      if (growthForm.oxygenSaturation !== "") {
        const ox = parseFloat(growthForm.oxygenSaturation);
        if (ox < 0) {
          newErrors.oxygenSaturation = "Oxygen saturation must not be less than 0";
        } else if (ox > 100) {
          newErrors.oxygenSaturation = "Oxygen saturation must be at most 100";
        } else {
          newErrors.oxygenSaturation = "";
        }
      }

      // Validate sleepDuration
      if (growthForm.sleepDuration !== "") {
        const sd = parseFloat(growthForm.sleepDuration);
        if (sd < 0) {
          newErrors.sleepDuration = "Sleep duration must not be less than 0";
        } else if (sd >= 24) {
          newErrors.sleepDuration = "Sleep duration must be less than 24 hours";
        } else {
          newErrors.sleepDuration = "";
        }
      }

      // Validate vision (nếu nhập dạng số thì phải dưới 10)
      if (growthForm.vision) {
        const visionNumber = parseFloat(growthForm.vision);
        if (!isNaN(visionNumber)) {
          if (visionNumber >= 10) {
            newErrors.vision = "Vision must be below 10";
          } else {
            newErrors.vision = "";
          }
        } else {
          newErrors.vision = "";
        }
      }
      return newErrors;
    });
  }, [growthForm]);

  const validateStep1 = useCallback(() => {
    const newErrors = {
      name: "",
      gender: "",
      dateOfBirth: "",
      recordDate: errors.recordDate,
      weight: errors.weight,
      height: errors.height,
    };
    let isValid = true;
    if (!childForm.name.trim()) {
      newErrors.name = "Please enter baby's name";
      isValid = false;
    }
    if (!childForm.gender) {
      newErrors.gender = "Please select gender";
      isValid = false;
    }
    if (!childForm.dateOfBirth) {
      newErrors.dateOfBirth = "Please select date of birth";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  }, [childForm, errors.recordDate, errors.weight, errors.height]);

  const validateStep2 = useCallback(() => {
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

  const [childId, setChildId] = useState("");


const handleConfirmStep1 = useCallback(async () => {
  if (!validateStep1()) return;
  try {
    const childPayload = {
      name: childForm.name.trim(),
      memberId: childForm.memberId,
      dateOfBirth: new Date(childForm.dateOfBirth).toISOString().split("T")[0],
      gender: childForm.gender,
      birthWeight: childForm.birthWeight,
      birthHeight: childForm.birthHeight,
      notes: childForm.notes,
    };
    const childRes = await childApi.createChild(childPayload);
    console.log("Child created:", childRes.data);
    // Save childId for later use:
    setChildId(childRes.data?.data?.childId || "");
    // Automatically move to Step3 or prompt user as desired:
    setCurrentStep(3);
  } catch (err) {
    console.error("Error saving child data:", err);
  }
}, [childForm, validateStep1]);

const handleAddRecordStep1 = useCallback(async () => {
  if (!validateStep1()) return;
  try {
    const childPayload = {
      name: childForm.name.trim(),
      memberId: childForm.memberId,
      dateOfBirth: new Date(childForm.dateOfBirth).toISOString().split("T")[0],
      gender: childForm.gender,
      birthWeight: childForm.birthWeight,
      birthHeight: childForm.birthHeight,
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
}, [validateStep1, childForm]);

  const handleOtherMeasure = useCallback(() => {
    if (!validateStep2()) return;
    if (subStep2 < 3) {
      setSubStep2((prev) => prev + 1);
    }
  }, [validateStep2, subStep2]);

// Replace your existing handleConfirmStep2 with:
const handleConfirmStep2 = useCallback(async () => {
  if (!validateStep2()) return;
  try {
    const growthPayload = {
      name: childForm.name,
      dateOfBirth: new Date(childForm.dateOfBirth).toISOString().split("T")[0],
      recordedBy: childForm.memberId,
      createdAt: growthForm.createdAt || new Date().toISOString(),
      weight: growthForm.weight ,
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
    setCurrentStep(3);
  } catch (err) {
    console.error("Error saving growth record:", err);
  }
}, [growthForm, validateStep2, childId, childForm.memberId]);

const handleCloseStep3 = useCallback(() => {
  window.location.reload();
  closeOverlay();
}, [closeOverlay]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      closeOverlay();
    }
  }, [closeOverlay]);

  // useMemo to render step content to avoid re-renders if props haven't changed
  const getStepTitle = useMemo(() => {
    if (currentStep === 1) {
      return "Enter your baby’s information to let us follow every tiny angel’s step";
    } else if (currentStep === 2) {
      if (subStep2 === 1) return "Enter a new growth record to track your baby's health automatically";
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
  }, [currentStep, subStep2, childForm, growthForm, errors, handleConfirmStep1, handleAddRecordStep1, handleConfirmStep2, handleOtherMeasure]);

  return (
    <div className="add-child-overlay" onClick={handleOverlayClick}>
      <div className="add-child-wizard" onClick={(e) => e.stopPropagation()}>
        {/* Nếu vẫn muốn nút X ở góc trên bên phải khi bước 3, bạn có thể ẩn/hiện theo ý muốn */}
        {currentStep !== 3 && (
          <button type="button" className="close-btn" onClick={closeOverlay}>
            ×
          </button>
        )}
  
        {/* CỘT TRÁI */}
        <div className="wizard-left">
          <div className="blue-bar"></div>
          <div className="wizard-left-content">
            {currentStep === 3 ? (
              // Bước 3: hiển thị dòng chúc mừng ở cột trái
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
              // Bước 1 & 2: hiển thị tiêu đề và step labels như cũ
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
  
        {/* CỘT PHẢI */}
        <div className="wizard-right">
          {currentStep === 3 ? (
            // Bước 3: render ảnh bé to + nút Close ở đây
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
            // Bước 1 & 2: vẫn dùng renderStepContent như cũ
            <>
              {renderStepContent}
              {currentStep === 2 && subStep2 > 1 && (
                <div className="step-buttons">
                  <button
                    type="button"
                    className="previous-btn"
                    onClick={handlePrevious}
                  >
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
export default AddChild;
