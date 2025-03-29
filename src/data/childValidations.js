export const WHO_GROWTH_REFERENCE = [
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

export function calculateAgeInMonths(dateOfBirth) {
  if (!dateOfBirth) return 0;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  return years * 12 + months;
}

export function validateDateOfBirth(dateString) {
  if (!dateString) return "Please select date of birth";
  const birthDate = new Date(dateString);
  const today = new Date();
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
  if (birthDate < eighteenYearsAgo) {
    return "Child must be under 18 years old";
  }
  return "";
}

export function validateName(name) {
  if (!name.trim()) {
    return "Please enter baby's name";
  }
  if (name.trim().length > 30) {
    return "Name cannot exceed 30 characters";
  }
  return "";
}

export function validateGender(gender) {
  if (!gender) {
    return "Please select gender";
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

// Hàm kiểm tra lỗi của dữ liệu growth record
export function validateGrowthRecordErrors(growthForm, childDateOfBirth) {
  const errors = {};

  // Kiểm tra ngày ghi nhận
  if (!growthForm.createdAt) {
    errors.createdAt = "Please select date";
  } else {
    const recordDate = new Date(growthForm.createdAt);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    if (recordDate < sixMonthsAgo) {
      errors.createdAt = "Record date cannot be older than 6 months";
    }
  }

  // Kiểm tra trọng lượng
  if (growthForm.weight === "") {
    errors.weight = "Please enter weight";
  } else if (parseFloat(growthForm.weight) < 0) {
    errors.weight = "Weight must not be less than 0";
  }

  // Kiểm tra chiều cao
  if (growthForm.height === "") {
    errors.height = "Please enter height";
  } else if (parseFloat(growthForm.height) < 0) {
    errors.height = "Height must not be less than 0";
  }

  // Kiểm tra nhiệt độ cơ thể
  if (growthForm.bodyTemperature !== "" && growthForm.bodyTemperature != null) {
    const bt = parseFloat(growthForm.bodyTemperature);
    if (bt < 0) {
      errors.bodyTemperature = "Body temperature must not be less than 0";
    }
  }

  // Kiểm tra oxy trong máu
  if (growthForm.oxygenSaturation !== "" && growthForm.oxygenSaturation != null) {
    const ox = parseFloat(growthForm.oxygenSaturation);
    if (ox < 0) {
      errors.oxygenSaturation = "Oxygen saturation must not be less than 0";
    }
  }

  // Kiểm tra thời gian ngủ
  if (growthForm.sleepDuration !== "" && growthForm.sleepDuration != null) {
    const sd = parseFloat(growthForm.sleepDuration);
    if (sd < 0) {
      errors.sleepDuration = "Sleep duration must not be less than 0";
    }
  }

  // Kiểm tra mức độ hormone tăng trưởng
  if (growthForm.growthHormoneLevel !== "" && growthForm.growthHormoneLevel != null) {
    const gh = parseFloat(growthForm.growthHormoneLevel);
    if (isNaN(gh) || gh < 0) {
      errors.growthHormoneLevel = "Growth hormone level must not be less than 0";
    }
  }

  return errors;
}

// Hàm kiểm tra cảnh báo cho dữ liệu growth record (không chặn submit)
export function validateGrowthRecordWarnings(growthForm, childDateOfBirth) {
  const warnings = {};

  // Cảnh báo cho trọng lượng và chiều cao dựa trên tuổi
  if (childDateOfBirth && (growthForm.weight !== "" || growthForm.height !== "")) {
    const ageInMonths = calculateAgeInMonths(childDateOfBirth);
    const ageGroup =
      WHO_GROWTH_REFERENCE.find((entry) => ageInMonths <= entry.age) ||
      WHO_GROWTH_REFERENCE[WHO_GROWTH_REFERENCE.length - 1];
    if (ageGroup) {
      const [minWeight, maxWeight] = ageGroup.weight;
      const [minHeight, maxHeight] = ageGroup.height;
      if (
        growthForm.weight !== "" &&
        (parseFloat(growthForm.weight) < minWeight ||
          parseFloat(growthForm.weight) > maxWeight)
      ) {
        warnings.weight = `Warning: Weight should be between ${minWeight}kg and ${maxWeight}kg for age ${ageGroup.age} months`;
      }
      if (
        growthForm.height !== "" &&
        (parseFloat(growthForm.height) < minHeight ||
          parseFloat(growthForm.height) > maxHeight)
      ) {
        warnings.height = `Warning: Height should be between ${minHeight}cm and ${maxHeight}cm for age ${ageGroup.age} months`;
      }
    }
  }

  // Cảnh báo nhiệt độ cơ thể
  if (growthForm.bodyTemperature !== "" && growthForm.bodyTemperature != null) {
    const bt = parseFloat(growthForm.bodyTemperature);
    if (bt >= 45) {
      warnings.bodyTemperature = "Warning: Body temperature is unusually high (should be below 45°C)";
    } else if (bt < 35 || bt > 38) {
      warnings.bodyTemperature = "Warning: Normal body temperature is typically between 35°C and 38°C";
    }
  }

  // Cảnh báo oxy trong máu
  if (growthForm.oxygenSaturation !== "" && growthForm.oxygenSaturation != null) {
    const ox = parseFloat(growthForm.oxygenSaturation);
    if (ox > 100) {
      warnings.oxygenSaturation = "Warning: Oxygen saturation cannot exceed 100%";
    } else if (ox < 95) {
      warnings.oxygenSaturation = "Warning: Oxygen saturation is typically 95-100%";
    }
  }

  // Cảnh báo thời gian ngủ
  if (growthForm.sleepDuration !== "" && growthForm.sleepDuration != null) {
    const sd = parseFloat(growthForm.sleepDuration);
    if (sd >= 24) {
      warnings.sleepDuration = "Warning: Sleep duration cannot exceed 24 hours";
    } else if (sd < 10) {
      warnings.sleepDuration = "Warning: Typical sleep duration for infants is 10-18 hours";
    }
  }

  return warnings;
}
