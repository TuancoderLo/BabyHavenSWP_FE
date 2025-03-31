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

// Hàm lấy dữ liệu WHO BMI-for-age từ API hoặc localStorage
const getWHOBMIData = async (ageInYears, gender) => {
  try {
    const storageKey = "bmiPercentiles";
    const dataKey = `${ageInYears}_${gender}`;

    const storedData = localStorage.getItem(storageKey);
    let bmiData = storedData ? JSON.parse(storedData) : {};

    if (bmiData[dataKey]) {
      console.log(`Using cached BMI data for ${dataKey} from localStorage`);
      const lms = bmiData[dataKey];

      const whoData = {
        p01: Number(lms.P01.toFixed(1)),
        p50: Number(lms.P50.toFixed(1)),
        p75: Number(lms.P75.toFixed(1)),
        p99: Number(lms.P99.toFixed(1)),
      };

      console.log("WHO BMI Data from localStorage:", whoData);
      return whoData;
    }

    console.log(`Fetching BMI data for ${dataKey} from API`);
    const response = await bmiPercentitleApi.getByAgeAndGender(ageInYears, gender);
    console.log("API Response:", response);

    const lms = response.data?.data || response.data;
    console.log("LMS Data:", lms);

    // Chuẩn hóa dữ liệu từ API
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
    console.log(`Saved BMI data for ${dataKey} to localStorage`);

    const whoData = {
      p01: Number(normalizedLms.P01.toFixed(1)),
      p50: Number(normalizedLms.P50.toFixed(1)),
      p75: Number(normalizedLms.P75.toFixed(1)),
      p99: Number(normalizedLms.P99.toFixed(1)),
    };

    console.log("WHO BMI Data from API:", whoData);
    return whoData;
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
  const [allRecords, setAllRecords] = useState([]); // Store all processed records for plotting dots
  const [loading, setLoading] = useState(true);
  const [whoBMIData, setWhoBMIData] = useState(null);

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

      if (!gender || (gender !== "Male" && gender !== "Female")) {
        console.error("Gender is invalid or not provided");
        setLoading(false);
        return;
      }

      if (ageInMonths === undefined || ageInYears === undefined) {
        console.error("Age information is not provided");
        setLoading(false);
        setData([]);
        alert("Age information is required to display the growth chart.");
        return;
      }

      setLoading(true);
      try {
        const parentName = localStorage.getItem("name");
        if (!parentName) {
          throw new Error("parentName is undefined or empty");
        }

        // Fetch WHO BMI data if needed
        let whoData = null;
        if (selectedTool === "BMI" || selectedTool === "ALL") {
          whoData = await getWHOBMIData(ageInYears, gender);
          setWhoBMIData(whoData);
        }

        const response = await childApi.getGrowthRecords(childName, parentName);
        console.log("Full API Response:", response);

        const records = Array.isArray(response.data)
          ? response.data
          : [response.data];

        // Process records with day-based x-axis positioning
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
            const x = month + (day - 1) / 31; // Calculate x position based on month and day

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
        setAllRecords(processedRecords); // Store all records for plotting dots

        // Create chart data for 12 months (for percentile lines)
        const chartData = Array.from({ length: 12 }, (_, i) => {
          const recordsInMonth = processedRecords.filter(
            (r) => Math.floor(r.x) === i
          );
          return {
            x: i,
            month: new Date(2025, i).toLocaleDateString("en-US", {
              month: "short",
            }),
            records: recordsInMonth,
            p01: whoData ? whoData.p01 : null,
            p50: whoData ? whoData.p50 : null,
            p75: whoData ? whoData.p75 : null,
            p99: whoData ? whoData.p99 : null,
          };
        });

        console.log("Chart Data:", chartData);
        setData(chartData);
      } catch (error) {
        console.error("Error fetching growth data:", error);
        setData([]);
        setAllRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, [
    childName,
    refreshTrigger,
    gender,
    ageInMonths,
    ageInYears,
    selectedTool,
  ]);

  if (loading) {
    return <div className="loading">Loading chart...</div>;
  }

  const renderChart = () => {
    if (!data || data.length === 0 || allRecords.length === 0) {
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
          No data available
        </div>
      );
    }

    switch (selectedTool) {
      case "BMI":
        return (
          <ResponsiveContainer width="100%" height={320}>
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
                label={{
                  value: "Month",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                yAxisId="bmi"
                orientation="left"
                stroke="#FF9AA2"
                tick={{ fill: "#666", fontSize: 11 }}
                domain={[0, 50]}
                ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]}
                label={{
                  value: "BMI (kg/m²)",
                  angle: -90,
                  position: "insideLeft",
                }}
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
                  if (name.includes("Percentile")) {
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
                dataKey="p01"
                stroke="#ff4040"
                strokeWidth={1}
                dot={false}
                name="1st Percentile"
                connectNulls={true}
              />
              <Line
                yAxisId="bmi"
                type="monotone"
                dataKey="p50"
                stroke="#82ca9d"
                strokeWidth={1}
                dot={false}
                name="50th Percentile"
                connectNulls={true}
              />
              <Line
                yAxisId="bmi"
                type="monotone"
                dataKey="p75"
                stroke="#ffa500"
                strokeWidth={1}
                dot={false}
                name="75th Percentile"
                connectNulls={true}
              />
              <Line
                yAxisId="bmi"
                type="monotone"
                dataKey="p99"
                stroke="#ff7300"
                strokeWidth={1}
                dot={false}
                name="99th Percentile"
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "Height":
        return (
          <ResponsiveContainer width="100%" height={320}>
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
                label={{
                  value: "Month",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                orientation="left"
                stroke="#008cff"
                tick={{ fill: "#666", fontSize: 11 }}
                label={{
                  value: "Height (cm)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                }}
                formatter={(value, name) => [`${value}`, name]}
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
                data={allRecords}
                type="monotone"
                dataKey="height"
                stroke="#008cff"
                strokeWidth={2}
                dot={{ r: 4, fill: "#008cff" }}
                activeDot={{ r: 6, fill: "#008cff" }}
                name="Height"
                connectNulls={true}
                onClick={(point) => {
                  if (onRecordSelect && point) onRecordSelect(point);
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "Weight":
        return (
          <ResponsiveContainer width="100%" height={320}>
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
                label={{
                  value: "Month",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                orientation="left"
                stroke="#ff7300"
                tick={{ fill: "#666", fontSize: 11 }}
                label={{
                  value: "Weight (kg)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                }}
                formatter={(value, name) => [`${value}`, name]}
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
                data={allRecords}
                type="monotone"
                dataKey="weight"
                stroke="#ff7300"
                strokeWidth={2}
                dot={{ r: 4, fill: "#ff7300" }}
                activeDot={{ r: 6, fill: "#ff7300" }}
                name="Weight"
                connectNulls={true}
                onClick={(point) => {
                  if (onRecordSelect && point) onRecordSelect(point);
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "ALL":
        return (
          <ResponsiveContainer width="100%" height={320}>
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
                label={{
                  value: "Month",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              {/* Trục Y bên trái cho BMI */}
              <YAxis
                yAxisId="bmi"
                orientation="left"
                stroke="#FF9AA2"
                domain={[0, 50]}
                tick={{ fill: "#666", fontSize: 11 }}
                label={{
                  value: "BMI (kg/m²)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              {/* Trục Y bên phải cho Weight */}
              <YAxis
                yAxisId="weight"
                orientation="right"
                stroke="#ff7300"
                domain={[0, 70]}
                tick={{ fill: "#666", fontSize: 11 }}
                label={{
                  value: "Weight (kg)",
                  angle: -90,
                  position: "insideRight",
                  offset: 20,
                }}
              />
              {/* Trục Y thứ 3 cho Height */}
              <YAxis
                yAxisId="height"
                orientation="right"
                stroke="#008cff"
                domain={[0, 180]}
                tick={{ fill: "#666", fontSize: 11 }}
                label={{
                  value: "Height (cm)",
                  angle: -90,
                  position: "insideRight",
                  offset: 20,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                }}
                formatter={(value, name) => [`${value}`, name]}
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
                  display: "flex",
                }}
              />
              {/* Đường biểu diễn BMI */}
              <Line
                type="monotone"
                data={allRecords}
                dataKey="bmi"
                yAxisId="bmi"
                stroke="#FF9AA2"
                strokeWidth={2}
                dot={{ r: 4, fill: "#FF9AA2" }}
                activeDot={{ r: 6, fill: "#FF9AA2" }}
                name="BMI"
                connectNulls={true}
                onClick={(point) => {
                  if (onRecordSelect && point) onRecordSelect(point);
                }}
              />
              {/* Đường biểu diễn Weight */}
              <Line
                type="monotone"
                data={allRecords}
                dataKey="weight"
                yAxisId="weight"
                stroke="#ff7300"
                strokeWidth={2}
                dot={{ r: 4, fill: "#ff7300" }}
                activeDot={{ r: 6, fill: "#ff7300" }}
                name="Weight"
                connectNulls={true}
                onClick={(point) => {
                  if (onRecordSelect && point) onRecordSelect(point);
                }}
              />
              {/* Đường biểu diễn Height */}
              <Line
                type="monotone"
                data={allRecords}
                dataKey="height"
                yAxisId="height"
                stroke="#008cff"
                strokeWidth={2}
                dot={{ r: 4, fill: "#008cff" }}
                activeDot={{ r: 6, fill: "#008cff" }}
                name="Height"
                connectNulls={true}
                onClick={(point) => {
                  if (onRecordSelect && point) onRecordSelect(point);
                }}
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