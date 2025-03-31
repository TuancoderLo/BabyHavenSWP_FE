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
import bmiPercentitleApi from "../../../../services/bmiPercentitleApi";

// Hàm lấy dữ liệu WHO BMI-for-age (giữ nguyên)
const getWHOBMIData = async (ageInYears, gender) => {
  try {
    const storageKey = "bmiPercentiles";
    const dataKey = `${ageInYears}_${gender}`;

    const storedData = localStorage.getItem(storageKey);
    let bmiData = storedData ? JSON.parse(storedData) : {};

    if (bmiData[dataKey]) {
      const lms = bmiData[dataKey];
      return {
        p01: Number(lms.P01.toFixed(1)),
        p50: Number(lms.P50.toFixed(1)),
        p75: Number(lms.P75.toFixed(1)),
        p99: Number(lms.P99.toFixed(1)),
      };
    }

    const response = await bmiPercentitleApi.getByAgeAndGender(ageInYears, gender);
    const lms = response.data?.data || response.data;
    const normalizedLms = {
      L: lms.L || lms.l,
      M: lms.M || lms.m,
      S: lms.S || lms.s,
      P01: lms.P01 || lms.p01,
      P50: lms.P50 || lms.p50,
      P75: lms.P75 || lms.p75,
      P99: lms.P99 || lms.p99,
    };

    if (
      !normalizedLms ||
      !normalizedLms.P01 ||
      !normalizedLms.P50 ||
      !normalizedLms.P75 ||
      !normalizedLms.P99
    ) {
      throw new Error("Invalid percentile data from API");
    }

    bmiData[dataKey] = normalizedLms;
    localStorage.setItem(storageKey, JSON.stringify(bmiData));

    return {
      p01: Number(normalizedLms.P01.toFixed(1)),
      p50: Number(normalizedLms.P50.toFixed(1)),
      p75: Number(normalizedLms.P75.toFixed(1)),
      p99: Number(normalizedLms.P99.toFixed(1)),
    };
  } catch (error) {
    console.error("Error fetching WHO BMI data:", error);
    return {
      p01: 12.0,
      p50: 15.3,
      p75: 16.2,
      p99: 20.8,
    };
  }
};

const GrowthChart = ({
  childName,
  selectedTool,
  onRecordSelect,
  refreshTrigger = 0,
  gender,
  ageInMonths,
  ageInYears,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whoBMIData, setWhoBMIData] = useState(null);

  const calculateBMI = (weight, height) => {
    const validWeight = parseFloat(weight);
    const validHeight = parseFloat(height);
    if (isNaN(validWeight) || isNaN(validHeight) || validWeight <= 0 || validHeight <= 0) {
      return null;
    }
    const heightInMeters = validHeight / 100;
    return Number((validWeight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  useEffect(() => {
    const fetchGrowthData = async () => {
      if (!childName || !gender || (gender !== "Male" && gender !== "Female") || ageInMonths === undefined || ageInYears === undefined) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const parentName = localStorage.getItem("name");
        if (!parentName) {
          throw new Error("parentName is undefined or empty");
        }

        // Nếu chế độ hiển thị là BMI hoặc ALL, lấy thêm dữ liệu WHO
        let whoData = null;
        if (selectedTool === "BMI" || selectedTool === "ALL") {
          whoData = await getWHOBMIData(ageInYears, gender);
          setWhoBMIData(whoData);
        }

        const response = await childApi.getGrowthRecords(childName, parentName);
        const records = Array.isArray(response.data) ? response.data : [response.data];

        // Xử lý từng bản ghi, thêm thông tin tháng và giá trị chỉ số
        const procRecords = records
          .filter(record => record && record.weight && record.height)
          .map(record => {
            const recordDate = new Date(record.createdAt || record.recordDate);
            return {
              timestamp: recordDate.getTime(),
              month: recordDate.getMonth(), // lưu lại tháng (0-11)
              bmi: calculateBMI(record.weight, record.height),
              weight: parseFloat(record.weight),
              height: parseFloat(record.height),
            };
          })
          .filter(r => r !== null)
          .sort((a, b) => a.timestamp - b.timestamp);

        // Gom nhóm dữ liệu theo tháng (0 đến 11) và tính trung bình cho từng chỉ số
        const monthlyChartData = Array.from({ length: 12 }, (_, i) => {
          const recordsInMonth = procRecords.filter(r => r.month === i);
          let avgBMI = null, avgHeight = null, avgWeight = null;
          if (recordsInMonth.length > 0) {
            avgBMI = recordsInMonth.reduce((sum, r) => sum + (r.bmi || 0), 0) / recordsInMonth.length;
            avgBMI = Number(avgBMI.toFixed(1));
            avgHeight = recordsInMonth.reduce((sum, r) => sum + r.height, 0) / recordsInMonth.length;
            avgHeight = Number(avgHeight.toFixed(1));
            avgWeight = recordsInMonth.reduce((sum, r) => sum + r.weight, 0) / recordsInMonth.length;
            avgWeight = Number(avgWeight.toFixed(1));
          }
          return {
            x: i,
            monthLabel: new Date(2025, i).toLocaleDateString("en-US", { month: "short" }),
            bmi: avgBMI,
            height: avgHeight,
            weight: avgWeight,
            records: recordsInMonth,
            p01: whoData ? whoData.p01 : null,
            p50: whoData ? whoData.p50 : null,
            p75: whoData ? whoData.p75 : null,
            p99: whoData ? whoData.p99 : null,
          };
        });
        setData(monthlyChartData);
      } catch (error) {
        console.error("Error fetching growth data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, [childName, refreshTrigger, gender, ageInMonths, ageInYears, selectedTool]);

  if (loading) {
    return <div className="loading">Loading chart...</div>;
  }

  const renderChart = () => {
    switch (selectedTool) {
      case "BMI":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 20, right: 40, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, 11]}
                ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
                tickFormatter={(value) => {
                  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  return months[value];
                }}
                stroke="#333"
                tick={{ fill: "#333", fontSize: 14, fontWeight: "bold" }}
                label={{ value: "Month", position: "insideBottom", offset: -5, fill: "#333", fontSize: 16, fontWeight: "bold" }}
              />
              <YAxis
                yAxisId="bmi"
                orientation="left"
                stroke="#FF9AA2"
                tick={{ fill: "#333", fontSize: 14, fontWeight: "bold" }}
                domain={[0, 50]}
                ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]}
                label={{ value: "BMI (kg/m²)", angle: -90, position: "insideLeft", fill: "#333", fontSize: 16, fontWeight: "bold" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: "500",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                formatter={(value, name) => {
                  if (name === "bmi") return [`${value}`, "BMI (kg/m²)"];
                  if (name.includes("Percentile")) return [`${value}`, name];
                  return [value, name];
                }}
                labelFormatter={(label) => data.find(d => d.x === label)?.monthLabel || ""}
              />
              <Legend
                verticalAlign="top"
                height={40}
                wrapperStyle={{ paddingTop: "10px", fontSize: "14px", fontWeight: "bold", color: "#333" }}
              />
              <Line
                yAxisId="bmi"
                dataKey="bmi"
                type="monotone"
                stroke="#FF9AA2"
                strokeWidth={3}
                dot={{ fill: "#FF9AA2", r: 6 }}
                activeDot={{ r: 8 }}
                name="BMI"
                connectNulls={true}
              />
              <Line yAxisId="bmi" type="monotone" dataKey="p01" stroke="#ff4040" strokeWidth={2} dot={false} name="1st Percentile" connectNulls={true} />
              <Line yAxisId="bmi" type="monotone" dataKey="p50" stroke="#82ca9d" strokeWidth={2} dot={false} name="50th Percentile" connectNulls={true} />
              <Line yAxisId="bmi" type="monotone" dataKey="p75" stroke="#ffa500" strokeWidth={2} dot={false} name="75th Percentile" connectNulls={true} />
              <Line yAxisId="bmi" type="monotone" dataKey="p99" stroke="#ff7300" strokeWidth={2} dot={false} name="99th Percentile" connectNulls={true} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "Height":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 20, right: 40, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, 11]}
                ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
                tickFormatter={(value) => {
                  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  return months[value];
                }}
                stroke="#333"
                tick={{ fill: "#333", fontSize: 14, fontWeight: "bold" }}
                label={{ value: "Month", position: "insideBottom", offset: -5, fill: "#333", fontSize: 16, fontWeight: "bold" }}
              />
              <YAxis
                orientation="left"
                stroke="#008cff"
                tick={{ fill: "#333", fontSize: 14, fontWeight: "bold" }}
                label={{ value: "Height (cm)", angle: -90, position: "insideLeft", fill: "#333", fontSize: 16, fontWeight: "bold" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: "500",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                formatter={(value, name) => ([`${value}`, name])}
                labelFormatter={(label) => data.find(d => d.x === label)?.monthLabel || ""}
              />
              <Legend
                verticalAlign="top"
                height={40}
                wrapperStyle={{ paddingTop: "10px", fontSize: "14px", fontWeight: "bold", color: "#333" }}
              />
              <Line
                type="monotone"
                dataKey="height"
                stroke="#008cff"
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
                name="Height"
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "Weight":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 20, right: 40, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, 11]}
                ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
                tickFormatter={(value) => {
                  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  return months[value];
                }}
                stroke="#333"
                tick={{ fill: "#333", fontSize: 14, fontWeight: "bold" }}
                label={{ value: "Month", position: "insideBottom", offset: -5, fill: "#333", fontSize: 16, fontWeight: "bold" }}
              />
              <YAxis
                orientation="left"
                stroke="#ff7300"
                tick={{ fill: "#333", fontSize: 14, fontWeight: "bold" }}
                label={{ value: "Weight (kg)", angle: -90, position: "insideLeft", fill: "#333", fontSize: 16, fontWeight: "bold" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: "500",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                formatter={(value, name) => ([`${value}`, name])}
                labelFormatter={(label) => data.find(d => d.x === label)?.monthLabel || ""}
              />
              <Legend
                verticalAlign="top"
                height={40}
                wrapperStyle={{ paddingTop: "10px", fontSize: "14px", fontWeight: "bold", color: "#333" }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#ff7300"
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
                name="Weight"
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        case "ALL":
          return (
<ResponsiveContainer width="100%" height={350}>
<LineChart data={data} margin={{ top: 20, right: 40, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[0, 11]}
                  ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
                  tickFormatter={(value) => {
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return months[value];
                  }}
                  stroke="#333"
                  tick={{ fill: "#333", fontSize: 14, fontWeight: "bold" }}
                  label={{
                    value: "Month",
                    position: "insideBottom",
                    offset: -5,
                    fill: "#333",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                />
                {/* Trục Y bên trái cho BMI */}
                <YAxis
                  yAxisId="bmi"
                  orientation="left"
                  stroke="#FF9AA2"
                  domain={[0, 50]}
                  tick={{ fill: "#333", fontSize: 14, fontWeight: "bold" }}
                  label={{
                    value: "BMI (kg/m²)",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#333",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                />
                {/* Trục Y bên phải cho Weight */}
                <YAxis
                  yAxisId="weight"
                  orientation="right"
                  stroke="#ff7300"
                  domain={[0, 70]}
                  tick={{ fill: "#333", fontSize: 14, fontWeight: "bold" }}
                  label={{
                    value: "Weight (kg)",
                    angle: -90,
                    position: "insideRight",
                    fill: "#333",
                    fontSize: 16,
                    fontWeight: "bold",
                    offset: 20
                  }}
                />
                {/* Trục Y thứ 3 cho Height, tăng offset để tách biệt */}
                <YAxis
                  yAxisId="height"
                  orientation="right"
                  stroke="#008cff"
                  domain={[0, 180]}
                  tick={{ fill: "#333", fontSize: 14, fontWeight: "bold" }}
                  label={{
                    value: "Height (cm)",
                    angle: -90,
                    position: "insideRight",
                    fill: "#333",
                    fontSize: 16,
                    fontWeight: "bold",
                    offset: 20
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value, name) => ([`${value}`, name])}
                  labelFormatter={(label) => data.find(d => d.x === label)?.monthLabel || ""}
                />
                <Legend
                  verticalAlign="top"
                  height={40}
                  wrapperStyle={{
                    paddingTop: "10px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#333",
                    display: "flex",
                  }}
                />
                {/* Đường biểu diễn BMI */}
                <Line
                  type="monotone"
                  dataKey="bmi"
                  yAxisId="bmi"
                  stroke="#FF9AA2"
                  strokeWidth={3}
                  dot={{ r: 6, fill: "#FF9AA2" }}
                  activeDot={null}
                  name="BMI"
                  connectNulls={true}
                  onClick={(point) => {
                    if (onRecordSelect && point) onRecordSelect(point);
                  }}
                />
                {/* Đường biểu diễn Weight */}
                <Line
                  type="monotone"
                  dataKey="weight"
                  yAxisId="weight"
                  stroke="#ff7300"
                  strokeWidth={3}
                  dot={{ r: 6, fill: "#ff7300" }}
                  activeDot={null}
                  name="Weight"
                  connectNulls={true}
                  onClick={(point) => {
                    if (onRecordSelect && point) onRecordSelect(point);
                  }}
                />
                {/* Đường biểu diễn Height */}
                <Line
                  type="monotone"
                  dataKey="height"
                  yAxisId="height"
                  stroke="#008cff"
                  strokeWidth={3}
                  dot={{ r: 6, fill: "#008cff" }}
                  activeDot={null}
                  name="Height"
                  connectNulls={true}
                  onClick={(point) => {
                    if (onRecordSelect && point) onRecordSelect(point);
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          );  
        }            
  };

  return <div className="growth-chart-container">{renderChart()}</div>;
};

export default GrowthChart;
