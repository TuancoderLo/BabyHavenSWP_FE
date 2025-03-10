import { useState, useEffect, useRef } from "react";
import calculateBMI from "../../../services/bmiUtils";
import childApi from "../../../services/childApi";
import Chart from "chart.js/auto"; // Đảm bảo Chart.js đã được cài đặt

// const GrowthChart = ({ childId, selectedTool, startDate, endDate }) => {
const GrowthChart = ({ childName, selectedTool, onRecordSelect}) => {
  const [records, setRecords] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // 1. Lấy danh sách GrowthRecord theo childId và theo khoảng thời gian (startDate, endDate)
  useEffect(() => {
    const fetchGrowthRecordsRange = async () => {
      try {
      //   // Gọi API với childId, startDate và endDate (nếu có)
      //   const response = await childApi.getGrowthRecordsRange(childId, startDate, endDate);
      //   const fetchedRecords = response.data.data;
      //   // Nếu API trả về null hoặc mảng rỗng, vẫn giữ records là mảng rỗng
      //   setRecords(fetchedRecords || []);
      // } catch (error) {
      //   console.error("Error fetching growth records:", error);
      //   setRecords([]);
      // }
        // Gọi API với childId, startDate và endDate (nếu có)
        const parentName = localStorage.getItem("name");
        console.log(parentName);
        const response = await childApi.getGrowthRecords(childName, parentName);
        const fetchedRecords = response.data;
        // Nếu API trả về null hoặc mảng rỗng, vẫn giữ records là mảng rỗng
        setRecords(fetchedRecords || []);
      } catch (error) {
        console.error("Error fetching growth records:", error);
        setRecords([]);
      }
    };

    if (childName) {
      fetchGrowthRecordsRange();
    }
  }, [childName]);

  // 2. Vẽ lại biểu đồ khi records hoặc selectedTool thay đổi
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    let dataRecords = records;
    let labels = [];
    let dataPoints = [];
    let datasetLabel = "";


    // Hàm tạo label dựa vào ngày ghi nhận, nếu không có thì hiển thị "Record X"
    const generateLabels = (record, index) => {
      const date = record.createdAt || record.recordDate;
      if (date) {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString();
      }
      return `Record ${index + 1}`;
    };

    switch (selectedTool) {
      case "BMI":
        // Tạo label cho mỗi record
        labels = dataRecords.map((r, index) => generateLabels(r, index));
        // Với mỗi record, nếu weight hoặc height null, dùng 0 làm giá trị mặc định
        dataPoints = dataRecords.map((r) => {
          // Kiểm tra cả 'weight' và 'Weight', tương tự với height
          const weight = r.weight != null ? r.weight : (r.Weight != null ? r.Weight : 0);
          const height = r.height != null ? r.height : (r.Height != null ? r.Height : 0);
          return weight > 0 && height > 0 ? parseFloat(calculateBMI(weight, height)) : 0;
        });        
        datasetLabel = "BMI (kg/m²)";
        break;

      case "Head measure":
        labels = dataRecords.map((r, index) => generateLabels(r, index));
        dataPoints = dataRecords.map((r) => r.headCircumference != null ? r.headCircumference : 0);
        datasetLabel = "Head Circumference (cm)";
        break;

      case "Global std":
        labels = dataRecords.map((r, index) => generateLabels(r, index));
        dataPoints = dataRecords.map((r) => {
          const weight = r.weight != null ? r.weight : 0;
          const height = r.height != null ? r.height : 0;
          return weight > 0 && height > 0 ? parseFloat(calculateBMI(weight, height)) : 0;
        });
        datasetLabel = "Child BMI vs Global Standard";
        break;

      case "Milestone":
        labels = dataRecords.map((r, index) => generateLabels(r, index));
        dataPoints = dataRecords.map((r) => r.milestoneValue != null ? r.milestoneValue : 0);
        datasetLabel = "Milestone";
        break;

      default:
        // Nếu không có tool nào được chọn, tạo mảng rỗng
        labels = dataRecords.map((_, index) => `Record ${index + 1}`);
        dataPoints = dataRecords.map(() => 0);
        datasetLabel = "Data";
        break;
    }

    // Hủy chart cũ nếu có
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Tạo chart mới
    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: datasetLabel,
            data: dataPoints,
            borderColor: "#064F83",
            borderWidth: 2,
            tension: 0.3,
            cubicInterpolationMode: "monotone",
            pointRadius: 4,
            pointBackgroundColor: "#fff",
            pointBorderColor: "#064F83",
            fill: false, // or true nếu muốn vùng tô
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, 
        devicePixelRatio: 4,
        onClick: (evt) => {
          // Lấy danh sách điểm data đang được click
          const points = chartInstance.current.getElementsAtEventForMode(
            evt,
            "nearest",
            { intersect: true },
            false
          );
          if (!points.length) return; // click ra vùng trống

          const index = points[0].index;
          // record tương ứng với dataRecords[index]
          const clickedRecord = dataRecords[index];
          console.log("Clicked record:", clickedRecord);

          // Gọi callback cho parent
          if (onRecordSelect) {
            onRecordSelect(clickedRecord);
          }
        },
        plugins: {
          legend: {
            labels: {
              color: "#333",
              font: {
                family: "'Inter', sans-serif",
                size: 14,
              },
            },
          },
          tooltip: {
            backgroundColor: "#fff",
            titleColor: "#333",
            bodyColor: "#333",
            borderColor: "#ccc",
            borderWidth: 1,
            displayColors: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Record Date",
              color: "#333",
              font: {
                family: "'Inter', sans-serif",
                size: 14,
                weight: "600",
              },
            },
            ticks: {
              color: "#333",
              font: {
                family: "'Inter', sans-serif",
                size: 13,
              },
            },
            grid: {
              color: "rgba(0,0,0,0.1)",
            },
          },
          y: {
            title: {
              display: true,
              text: datasetLabel,
              color: "#333",
              font: {
                family: "'Inter', sans-serif",
                size: 14,
                weight: "600",
              },
            },
            ticks: {
              color: "#333",
              font: {
                family: "'Inter', sans-serif",
                size: 13,
              },
            },
            grid: {
              color: "rgba(0,0,0,0.1)",
            },
          },
        },
      },
    });    
  }, [records, selectedTool, onRecordSelect]);
  useEffect(() => {
    console.log("Fetched records:", records);
  }, [records]);
  return (
    <div className="chart-area">
      <canvas ref={chartRef} />
    </div>
  );
};

export default GrowthChart;