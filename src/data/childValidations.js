/* childValidations.js */

// ====================
// Basic validation functions for child information
// ====================


export function validateDateOfBirth(dateString) {
  if (!dateString) return "Please select the baby's date of birth";
  const birthDate = new Date(dateString);
  const today = new Date();
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
  if (birthDate < eighteenYearsAgo) {
    return "The baby must be under 18 years old";
  }
  return "";
}

export function validateName(name) {
  if (!name.trim()) {
    return "Please enter the baby's name";
  }
  if (name.trim().length > 30) {
    return "Name must not exceed 30 characters";
  }
  return "";
}

export function validateGender(gender) {
  if (!gender) {
    return "Please select the baby's gender";
  }
  return "";
}

export function validateNonNegative(value, fieldName) {
  if (value === "" || value == null) return "";
  const numeric = parseFloat(value);
  if (numeric < 0) {
    return `${fieldName} must not be less than 0`;
  }
  return "";
}

export function addChildForm(childForm) {
  const newErrors = {};
  newErrors.name = validateName(childForm.name);
  newErrors.gender = validateGender(childForm.gender);
  newErrors.dateOfBirth = validateDateOfBirth(childForm.dateOfBirth);
  if (childForm.birthWeight !== "" && childForm.birthWeight != null) {
    const weightErr = validateNonNegative(childForm.birthWeight, "Birth weight");
    if (weightErr) newErrors.birthWeight = weightErr;
  }
  if (childForm.birthHeight !== "" && childForm.birthHeight != null) {
    const heightErr = validateNonNegative(childForm.birthHeight, "Birth height");
    if (heightErr) newErrors.birthHeight = heightErr;
  }
  return newErrors;
}

// ====================
// Reference data for each growth stage
// ====================

export const growthStages = {
  "0-1m": {
    label: "Newborn Stage (0–1 month)",
    requiredFields: ["weight", "height", "createdAt"],
    optionalFields: [
      "headCircumference",
      "chestCircumference",
      "bodyTemperature",
      "heartRate",
      "oxygenSaturation",
      "sleepDuration",
      "vision",
      "hearing",
      "immunizationStatus",
      "notes"
    ],
    reference: {
      weight: {
        male: { avg: [3.4, 4.5], range: [3.2, 4.8] },
        female: { avg: [3.2, 4.2], range: [3.0, 4.5] },
        note: "Approx. 30 g/day gain in the first month"
      },
      height: {
        male: { avg: [49.9, 54.7], range: [49, 55] },
        female: { avg: [49.2, 53.7], range: [48, 54] },
        note: "Increase of about 3–4 cm in the first month"
      },
      headCircumference: { 
        both: { avg: [34, 36.5], range: [33, 38] }, 
        note: "Grows about 1 cm/week due to rapid brain development" 
      },
      chestCircumference: { both: { avg: [32, 33], range: [31, 34] } },
      bodyTemperature: { both: { avg: [36.5, 37.5], range: [36, 38] } },
      heartRate: { both: { avg: [100, 160], range: [90, 170] } },
      oxygenSaturation: { both: { avg: [95, 100], range: [92, 100] } },
      sleepDuration: { both: { avg: [14, 18], range: [12, 20] }, note: "Divided into short bouts (2–4 hours)" },
      vision: { both: { avg: ["Limited (20–30 cm)"], range: [] }, note: "Begins to track moving objects" },
      hearing: { both: { avg: ["Screened at birth"], range: [] } },
      immunizationStatus: { both: { avg: ["Initiated"], range: [] }, note: "e.g., HepB within 24h; BCG in the first month" },
      notes: { both: { avg: [""], range: [] } }
    }
  },
  "1-3m": {
    label: "1–3 Months Stage",
    requiredFields: ["weight", "height", "createdAt"],
    optionalFields: [
      "headCircumference",
      "bodyTemperature",
      "heartRate",
      "sleepDuration",
      "vision",
      "hearing",
      "immunizationStatus",
      "notes"
    ],
    reference: {
      weight: {
        male: { avg: [5.8, 6.4], range: [5.5, 6.8] },
        female: { avg: [5.5, 5.9], range: [5.2, 6.2] },
        note: "Increase of ~0.8–1 kg/month"
      },
      height: {
        male: { avg: [59, 61.4], range: [58, 63] },
        female: { avg: [58, 59.8], range: [57, 61] },
        note: "Increase of ~3 cm/month"
      },
      headCircumference: { 
        both: { avg: [38, 40.5], range: [37, 42] }, 
        note: "Grows ~2 cm/month" 
      },
      bodyTemperature: { both: { avg: [36.5, 37.5], range: [36, 38] } },
      heartRate: { both: { avg: [100, 150], range: [90, 160] } },
      sleepDuration: { both: { avg: [14, 16], range: [12, 18] } },
      vision: { both: { avg: ["Improving"], range: [] }, note: "Begins tracking objects better" },
      hearing: { both: { avg: ["Responsive to familiar sounds"], range: [] } },
      immunizationStatus: { both: { avg: ["Beginning"], range: [] } },
      notes: { both: { avg: [""], range: [] } }
    }
  },
  "3-6m": {
    label: "3–6 Months Stage",
    requiredFields: ["weight", "height", "createdAt"],
    optionalFields: [
      "headCircumference",
      "muscleMass",
      "bodyTemperature",
      "heartRate",
      "sleepDuration",
      "notes"
    ],
    reference: {
      weight: {
        male: { avg: [7.5, 7.9], range: [7.0, 8.5] },
        female: { avg: [7.0, 7.3], range: [6.5, 8.0] },
        note: "Approximately doubles birth weight"
      },
      height: {
        male: { avg: [66, 67.6], range: [65, 69] },
        female: { avg: [64, 65.7], range: [63, 67] },
        note: "Increase of about 2.5 cm/month"
      },
      headCircumference: { both: { avg: [42, 43], range: [41, 44] }, note: "Growth rate slows (~0.5 cm/month)" },
      muscleMass: { both: { avg: [1.0, 1.5], range: [0.9, 1.7] }, note: "Estimated in kg" },
      bodyTemperature: { both: { avg: [36.5, 37.5], range: [36, 38] } },
      heartRate: { both: { avg: [90, 130], range: [80, 140] } },
      sleepDuration: { both: { avg: [14, 15], range: [12, 16] } },
      notes: { both: { avg: [""], range: [] } }
    }
  },
  "6-12m": {
    label: "Sitting and Standing Stage (6–12 months)",
    requiredFields: ["weight", "height", "createdAt"],
    optionalFields: [
      "headCircumference",
      "muscleMass",
      "bodyTemperature",
      "heartRate",
      "bloodPressure",
      "oxygenSaturation",
      "sleepDuration",
      "vision",
      "hearing",
      "nutritionalStatus",
      "notes"
    ],
    reference: {
      weight: {
        male: { avg: [8.5, 9.7], range: [7.7, 11.5] },
        female: { avg: [8.0, 9.0], range: [7.0, 10.7] },
        note: "Triples birth weight by 12 months"
      },
      height: {
        male: { avg: [70, 75.8], range: [68, 78] },
        female: { avg: [68, 74.0], range: [65, 76] },
        note: "Increase of about 1–1.5 cm/month"
      },
      headCircumference: { both: { avg: [45, 46], range: [43, 49] }, note: "Grows slowly after 6 months" },
      muscleMass: { both: { avg: [1.5, 2.0], range: [1.4, 2.2] } },
      bodyTemperature: { both: { avg: [36.5, 37.5], range: [36, 38] } },
      heartRate: { both: { avg: [90, 120], range: [80, 130] } },
      bloodPressure: { both: { avg: [70, 90], range: [65, 95] } },
      oxygenSaturation: { both: { avg: [95, 100], range: [92, 100] } },
      sleepDuration: { both: { avg: [13, 15], range: [12, 16] } },
      vision: { both: { avg: ["Approaching adult-like near vision"], range: [] } },
      hearing: { both: { avg: ["Normal"], range: [] } },
      nutritionalStatus: { both: { avg: ["Normal"], range: [] } },
      notes: { both: { avg: [""], range: [] } }
    }
  },
  "1-2y": {
    label: "Toddler Stage (1–2 years)",
    requiredFields: ["weight", "height", "createdAt"],
    optionalFields: [
      "headCircumference",
      "heartRate",
      "bloodPressure",
      "sleepDuration",
      "nutritionalStatus",
      "notes"
    ],
    reference: {
      weight: {
        male: { avg: [10.9, 12.7], range: [10, 15.4] },
        female: { avg: [10.0, 12.1], range: [9, 14.5] },
        note: "Increase of about 2–3 kg in the second year"
      },
      height: {
        male: { avg: [78, 86.5], range: [76, 90] },
        female: { avg: [76, 85.0], range: [74, 88] },
        note: "Increase of about 12–13 cm in the second year"
      },
      headCircumference: { both: { avg: [47, 49], range: [45, 50] } },
      heartRate: { both: { avg: [80, 130], range: [70, 140] } },
      bloodPressure: { both: { avg: [90, 95], range: [85, 100] } },
      sleepDuration: { both: { avg: [11, 14], range: [10, 15] } },
      nutritionalStatus: { both: { avg: ["Normal"], range: [] } },
      notes: { both: { avg: [""], range: [] } }
    }
  },
  "2-5y": {
    label: "Preschool Stage (2–5 years)",
    requiredFields: ["weight", "height", "createdAt"],
    optionalFields: [
      "heartRate",
      "bloodPressure",
      "sleepDuration",
      "nutritionalStatus",
      "notes"
    ],
    reference: {
      weight: {
        male: { avg: [12.7, 18.5], range: [11, 24] },
        female: { avg: [12.1, 18.0], range: [10, 23] },
        note: "Increase of approximately 2 kg per year"
      },
      height: {
        male: { avg: [86.5, 109.2], range: [83, 115] },
        female: { avg: [85.0, 108.0], range: [82, 113] },
        note: "Increase of about 6–8 cm per year"
      },
      heartRate: { both: { avg: [80, 110], range: [70, 120] } },
      bloodPressure: { both: { avg: [80, 100], range: [75, 105] } },
      sleepDuration: { both: { avg: [10, 13], range: [9, 14] } },
      nutritionalStatus: { both: { avg: ["Normal"], range: [] } },
      notes: { both: { avg: [""], range: [] } }
    }
  },
  "6-12y": {
    label: "Childhood Stage (6–12 years)",
    requiredFields: ["weight", "height", "createdAt"],
    optionalFields: [
      "heartRate",
      "bloodPressure",
      "sleepDuration",
      "nutritionalStatus",
      "notes"
    ],
    reference: {
      weight: {
        male: { avg: [20, 40], range: [18, 59] },
        female: { avg: [20, 42], range: [18, 62] },
        note: "Increase of approximately 2–3 kg per year"
      },
      height: {
        male: { avg: [115, 150], range: [110, 161] },
        female: { avg: [115, 155], range: [110, 163] },
        note: "Increase of about 5–6 cm per year"
      },
      heartRate: { both: { avg: [70, 110], range: [60, 120] } },
      bloodPressure: { both: { avg: [90, 110], range: [85, 115] } },
      sleepDuration: { both: { avg: [9, 12], range: [8, 13] } },
      nutritionalStatus: { both: { avg: ["Normal"], range: [] } },
      notes: { both: { avg: [""], range: [] } }
    }
  },
  "13-18y": {
    label: "Adolescent Stage (13–18 years)",
    requiredFields: ["weight", "height", "createdAt"],
    optionalFields: [
      "heartRate",
      "bloodPressure",
      "sleepDuration",
      "nutritionalStatus",
      "growthHormoneLevel",
      "physicalActivityLevel",
      "mentalHealthStatus",
      "notes"
    ],
    reference: {
      weight: {
        male: { avg: [52, 72], range: [45, 92] },
        female: { avg: [45, 60], range: [40, 80] },
        note: "Significant increase during puberty"
      },
      height: {
        male: { avg: [160, 175], range: [150, 188] },
        female: { avg: [155, 165], range: [145, 174] },
        note: "Rapid growth during puberty then slows"
      },
      heartRate: { both: { avg: [60, 100], range: [50, 110] } },
      bloodPressure: { both: { avg: [110, 120], range: [100, 130] } },
      sleepDuration: { both: { avg: [8, 10], range: [7, 11] } },
      nutritionalStatus: { both: { avg: ["Normal"], range: [] } },
      growthHormoneLevel: { both: { avg: [15, 25], range: [13, 28] } },
      physicalActivityLevel: { both: { avg: ["Moderate"], range: [] } },
      mentalHealthStatus: { both: { avg: ["Variable"], range: [] } },
      notes: { both: { avg: [""], range: [] } }
    }
  },
};

// ====================
// Function to calculate age in months
// ====================
export function calculateAgeInMonths(dateString) {
  const birthDate = new Date(dateString);
  const today = new Date();
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
  if (today.getDate() < birthDate.getDate()) months--;
  return months < 0 ? 0 : months;
}

// ====================
// Function to determine growth stage based on age in months
// ====================
export function getGrowthStage(ageInMonths) {
  if (ageInMonths < 1) return "0-1m";
  if (ageInMonths < 3) return "1-3m";
  if (ageInMonths < 6) return "3-6m";
  if (ageInMonths < 12) return "6-12m";
  if (ageInMonths < 24) return "1-2y";
  if (ageInMonths < 60) return "2-5y";
  if (ageInMonths < 144) return "6-12y";
  return "13-18y";
}

// ====================
// Basic validation: Check for critical errors in growth record
// ====================
const MAX_WEIGHT = 150; // kg
const MAX_HEIGHT = 250; // cm

export function validateGrowthRecordErrors(growthForm) {
  const errors = {};
  if (!growthForm.createdAt) errors.createdAt = "Please enter the record date";
  if (!growthForm.weight) {
    errors.weight = "Please enter the weight";
  } else {
    const weight = parseFloat(growthForm.weight);
    if (weight < 0) {
      errors.weight = "Weight must not be less than 0";
    } else if (weight > MAX_WEIGHT) {
      errors.weight = `Weight must not exceed ${MAX_WEIGHT} kg`;
    }
  }
  if (!growthForm.height) {
    errors.height = "Please enter the height";
  } else {
    const height = parseFloat(growthForm.height);
    if (height < 40) {
      errors.height = "Height must not be less than 40";
    } else if (height > MAX_HEIGHT) {
      errors.height = `Height must not exceed ${MAX_HEIGHT} cm`;
    }
  }

  return errors;
}
// ====================
// Suggestion validation: Check metrics outside reference ranges and return suggestions (warnings)
// ====================
export function validateGrowthRecordSuggestions(growthForm, dateOfBirth, gender) {
  const ageInMonths = calculateAgeInMonths(dateOfBirth);
  const stage = getGrowthStage(ageInMonths);
  const ref = growthStages[stage]?.reference;
  const suggestions = {};

  if (!ref) return suggestions;

  Object.keys(ref).forEach((field) => {
    if (growthForm[field] && ref[field]) {
      // Use gender value, fallback to "both" if gender is not provided
      const genderKey = (gender && gender.toLowerCase()) || "both";
      const refValue = ref[field][genderKey] || ref[field].both;
      const value = parseFloat(growthForm[field]);
      if (refValue && (value < refValue.range[0] || value > refValue.range[1])) {
        suggestions[field] = `${
          field === "weight" ? "Weight" : field === "height" ? "Height" : field
        } average for ${growthStages[stage].label}: ${refValue.avg[0]}–${refValue.avg[1]} ${
          field === "weight" ? "kg" : field === "height" ? "cm" : ""
        }. Would you like to review it?`;
      }
    }
  });
  return suggestions;
}

export default {
  growthStages,
  calculateAgeInMonths,
  getGrowthStage,
  validateGrowthRecordErrors,
  validateGrowthRecordSuggestions,
};