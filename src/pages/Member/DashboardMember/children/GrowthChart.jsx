import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./GrowthChart.css";
import childApi from "../../../../services/childApi";

// Dữ liệu LMS từ WHO Growth Reference 5-19 years (mẫu cho nam, 108 tháng)
const WHO_LMS_BMI = {
  108: {
    // 108 tháng = 9 tuổi, nam
    L: -0.3529,
    M: 16.8,
    S: 0.1324,
  },
  // Có thể mở rộng cho các độ tuổi và giới tính khác
};

// Hàm tính độ tuổi bằng tháng
const calculateAgeInMonths = (dateOfBirth) => {
  if (!dateOfBirth) {
    console.warn("dateOfBirth is not provided, defaulting to 108 months");
    return 108; // Mặc định 108 tháng nếu không có dữ liệu
  }

  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMonths = years * 12 + months;
  console.log("Calculated ageInMonths:", totalMonths);
  return totalMonths;
};

// Hàm tính BMI từ z-score
const calculateBMIFromZScore = (ageInMonths, zScore) => {
  const lms = WHO_LMS_BMI[ageInMonths] || WHO_LMS_BMI[108];
  const { L, M, S } = lms;

  if (L === 0) {
    return M * Math.exp(S * zScore);
  }
  return M * Math.pow(1 + L * S * zScore, 1 / L);
};

// Hàm lấy dữ liệu WHO BMI-for-age từ LMS cục bộ
const getWHOBMIData = (ageInMonths) => {
  try {
    const median = calculateBMIFromZScore(ageInMonths, 0);
    const plus1SD = calculateBMIFromZScore(ageInMonths, 1);
    const minus1SD = calculateBMIFromZScore(ageInMonths, -1);
    const plus2SD = calculateBMIFromZScore(ageInMonths, 2);
    const minus2SD = calculateBMIFromZScore(ageInMonths, -2);

    const whoData = {
      median: Number(median.toFixed(1)),
      plus1SD: Number(plus1SD.toFixed(1)),
      minus1SD: Number(minus1SD.toFixed(1)),
      plus2SD: Number(plus2SD.toFixed(1)),
      minus2SD: Number(minus2SD.toFixed(1)),
    };

    console.log("WHO BMI Data:", whoData);
    return whoData;
  } catch (error) {
    console.error("Error calculating WHO BMI data:", error);
    return {
      median: 16.8,
      plus1SD: 18.5,
      minus1SD: 15.2,
      plus2SD: 20.5,
      minus2SD: 13.8,
    };
  }
};

const GrowthChart = ({
  childName,
  selectedTool,
  onRecordSelect,
  refreshTrigger = 0,
  dateOfBirth,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whoBMIData, setWhoBMIData] = useState(null);

  // Hàm tính BMI
  const calculateBMI = (weight, height) => {
    console.log("calculateBMI input:", { weight, height });

    const validWeight = parseFloat(weight);
    const validHeight = parseFloat(height);

    if (
      isNaN(validWeight) ||
      isNaN(validHeight) ||
      validWeight <= 0 ||
      validHeight <= 0
    ) {
      console.log("BMI calculation skipped - invalid input");
      return null;
    }

    const heightInMeters = validHeight / 100;
    const bmi = Number(
      (validWeight / (heightInMeters * heightInMeters)).toFixed(1)
    );

    if (isNaN(bmi) || !isFinite(bmi)) {
      console.log("BMI calculation resulted in invalid value");
      return null;
    }

    console.log("Calculated BMI:", bmi);
    return bmi;
  };

  useEffect(() => {
    const fetchGrowthData = async () => {
      if (!childName) {
        console.error("childName is undefined or empty");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const parentName = localStorage.getItem("name");
        if (!parentName) {
          throw new Error("parentName is undefined or empty");
        }

        // Tính độ tuổi của trẻ từ dateOfBirth (truyền qua props)
        const ageInMonths = calculateAgeInMonths(dateOfBirth);

        // Lấy dữ liệu WHO BMI-for-age từ LMS cục bộ
        const whoData = getWHOBMIData(ageInMonths);
        setWhoBMIData(whoData);

        // Lấy dữ liệu tăng trưởng từ API
        const response = await childApi.getGrowthRecords(childName, parentName);
        console.log("Full API Response:", response);

        const records = Array.isArray(response.data)
          ? response.data
          : [response.data];

        const processedRecords = records
          .filter((record) => record && (record.weight || record.height))
          .map((record) => {
            const recordDate = new Date(record.createdAt || record.recordDate);

            const weight = parseFloat(record.weight);
            const height = parseFloat(record.height);

            if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0)
              return null;

            const bmi = calculateBMI(weight, height);
            if (bmi === null) return null;

            const month = recordDate.getMonth();
            const day = recordDate.getDate();
            const x = month + (day - 1) / 31;

            return {
              x,
              month: recordDate.toLocaleDateString("en-US", { month: "short" }),
              date: recordDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              }),
              bmi,
              weight,
              height,
              dayOfMonth: day,
              timestamp: recordDate.getTime(),
            };
          })
          .filter((record) => record !== null)
          .sort((a, b) => a.timestamp - b.timestamp);

        console.log("Processed Records:", processedRecords);

        // Tạo dữ liệu gộp cho biểu đồ
        const chartData = Array.from({ length: 12 }, (_, i) => {
          // Lấy tất cả record trong tháng i
          const recordsInMonth = processedRecords.filter(
            (r) => Math.floor(r.x) === i
          );
          return {
            x: i,
            month: new Date(2025, i).toLocaleDateString("en-US", {
              month: "short",
            }),
            records: recordsInMonth, // Lưu tất cả record trong tháng
            median: whoData.median,
            plus1SD: whoData.plus1SD,
            minus1SD: whoData.minus1SD,
            plus2SD: whoData.plus2SD,
            minus2SD: whoData.minus2SD,
          };
        });

        console.log("Chart Data:", chartData);
        setData(chartData);
      } catch (error) {
        console.error("Error fetching growth data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, [childName, refreshTrigger, dateOfBirth]);

  if (loading) {
    return <div className="loading">Loading chart...</div>;
  }

  const renderChart = () => {
    switch (selectedTool) {
      case "BMI":
        if (!data || data.length === 0) {
          return (
            <div
              style={{
                height: "350px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
              }}
            >
              No BMI data available
            </div>
          );
        }

        // Tạo danh sách tất cả record để vẽ đường
        const allRecords = data.flatMap((monthData) => monthData.records);

        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, 11]}
                ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
                tickFormatter={(value) => {
                  const months = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ];
                  return months[Math.floor(value)];
                }}
                stroke="#666"
                tick={{ fill: "#666", fontSize: 10 }}
              />
              <YAxis
                yAxisId="bmi"
                orientation="left"
                stroke="#FF9AA2"
                tick={{ fill: "#666", fontSize: 11 }}
                domain={[0, 50]}
                ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#B5EAD7"
                tick={{ fill: "#666", fontSize: 11 }}
                hide={true}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                }}
                formatter={(value, name) => {
                  if (name === "bmi") {
                    return [`${value}`, "BMI (kg/m²)"];
                  }
                  if (name.includes("WHO")) {
                    return [`${value}`, name];
                  }
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const recordsInMonth = payload[0].payload.records;
                    if (recordsInMonth && recordsInMonth.length > 0) {
                      return recordsInMonth
                        .map((r) => `Date: ${r.date}`)
                        .join(", ");
                    }
                  }
                  return "";
                }}
              />
              <Legend
                verticalAlign="top"
                height={30}
                wrapperStyle={{
                  paddingTop: "5px",
                  fontSize: "12px",
                }}
              />
              <Line
                yAxisId="bmi"
                data={allRecords}
                type="monotone"
                dataKey="bmi"
                stroke="#FF9AA2"
                strokeWidth={2}
                dot={{ fill: "#FF9AA2", r: 4 }}
                activeDot={{ r: 6, fill: "#FF9AA2" }}
                name="BMI"
                connectNulls={true}
                onClick={(point) => {
                  if (onRecordSelect && point) {
                    onRecordSelect(point);
                  }
                }}
              />
              <Line
                yAxisId="bmi"
                type="monotone"
                dataKey="median"
                stroke="#8884d8"
                strokeWidth={1}
                dot={false}
                name="WHO Median"
                connectNulls={true}
              />
              <Line
                yAxisId="bmi"
                type="monotone"
                dataKey="plus1SD"
                stroke="#82ca9d"
                strokeWidth={1}
                dot={false}
                name="WHO +1SD"
                connectNulls={true}
              />
              <Line
                yAxisId="bmi"
                type="monotone"
                dataKey="minus1SD"
                stroke="#ff7300"
                strokeWidth={1}
                dot={false}
                name="WHO -1SD"
                connectNulls={true}
              />
              <Line
                yAxisId="bmi"
                type="monotone"
                dataKey="plus2SD"
                stroke="#ff4040"
                strokeWidth={1}
                dot={false}
                name="WHO +2SD (Obesity)"
                connectNulls={true}
              />
              <Line
                yAxisId="bmi"
                type="monotone"
                dataKey="minus2SD"
                stroke="#ffa500"
                strokeWidth={1}
                dot={false}
                name="WHO -2SD (Thinness)"
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return <div>Select a measurement tool</div>;
    }
  };

  return <div className="growth-chart-container">{renderChart()}</div>;
};

export default GrowthChart;
