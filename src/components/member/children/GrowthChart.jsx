import { useState, useEffect, useRef } from "react";
import calculateBMI from "../../../services/bmiUtils";
import childApi from "../../../services/childApi";
import Chart from "chart.js/auto"; // Đảm bảo Chart.js đã được cài đặt

const GrowthChart = ({ childId, selectedTool, startDate, endDate }) => {
  const [records, setRecords] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // 1. Lấy danh sách GrowthRecord theo childId và theo khoảng thời gian (startDate, endDate)
  useEffect(() => {
    const fetchGrowthRecordsRange = async () => {
      try {
        // Gọi API với childId, startDate và endDate (nếu có)
        const response = await childApi.getGrowthRecordsRange(childId, startDate, endDate);
        const fetchedRecords = response.data.data;
        // Nếu API trả về null hoặc mảng rỗng, vẫn giữ records là mảng rỗng
        setRecords(fetchedRecords || []);
      } catch (error) {
        console.error("Error fetching growth records:", error);
        setRecords([]);
      }
    };

    if (childId) {
      fetchGrowthRecordsRange();
    }
  }, [childId, startDate, endDate]);

  // 2. Vẽ lại biểu đồ khi records hoặc selectedTool thay đổi
  useEffect(() => {
    // Sử dụng records nhận được; ngay cả khi rỗng, ta vẫn tạo ra mảng label rỗng
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
            borderColor: "blue",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: { display: true, text: "Record Date" },
          },
          y: {
            title: { display: true, text: datasetLabel },
          },
        },
      },
    });
  }, [records, selectedTool]);
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
