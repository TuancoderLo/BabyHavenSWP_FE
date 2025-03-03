
export default function calculateBMI(weight, height) {
  if (!weight || !height) return "";
  const h = height / 100; // đổi cm -> m
  const bmiVal = weight / (h * h);
  return bmiVal.toFixed(2);
}

  