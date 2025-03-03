const GrowthChart = ({ childId, selectedTool }) => {
    const [records, setRecords] = useState([]);
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
  
    // 1. Lấy danh sách GrowthRecord theo childId
    useEffect(() => {
      const fetchGrowthRecords = async () => {
        try {
          const response = await childApi.getGrowthRecords(childId);
          // Giả sử API trả về mảng record trong response.data.data
          setRecords(response.data.data || []);
        } catch (error) {
          console.error("Error fetching growth records:", error);
        }
      };
  
      if (childId) {
        fetchGrowthRecords();
      }
    }, [childId]);
  
    // 2. Khi records hoặc selectedTool thay đổi => vẽ lại biểu đồ
    useEffect(() => {
      if (records.length === 0) return;
  
      let labels = [];
      let dataPoints = [];
      let datasetLabel = "";
  
      switch (selectedTool) {
        case "BMI":
          labels = records.map((r) => {
            const dateObj = new Date(r.createdAt || r.recordDate);
            return dateObj.toLocaleDateString();
          });
          dataPoints = records.map((r) => {
            if (r.weight && r.height) {
              return parseFloat(calculateBMI(r.weight, r.height));
            }
            return null;
          });
          datasetLabel = "BMI (kg/m²)";
          break;
  
        case "Head measure":
          labels = records.map((r) => {
            const dateObj = new Date(r.createdAt || r.recordDate);
            return dateObj.toLocaleDateString();
          });
          dataPoints = records.map((r) => r.headCircumference);
          datasetLabel = "Head Circumference (cm)";
          break;
  
        case "Global std":
          // Tạm ví dụ: hiển thị BMI để so sánh với một đường chuẩn
          labels = records.map((r) => {
            const dateObj = new Date(r.createdAt || r.recordDate);
            return dateObj.toLocaleDateString();
          });
          dataPoints = records.map((r) => {
            if (r.weight && r.height) {
              return parseFloat(calculateBMI(r.weight, r.height));
            }
            return null;
          });
          datasetLabel = "Child BMI vs Global Standard";
          break;
  
        case "Milestone":
          labels = records.map((r) => {
            const dateObj = new Date(r.createdAt || r.recordDate);
            return dateObj.toLocaleDateString();
          });
          dataPoints = records.map((r) => r.milestoneValue || 0);
          datasetLabel = "Milestone";
          break;
  
        default:
          break;
      }
  
      // Hủy chart cũ nếu tồn tại
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
  
    return (
      <div className="chart-area">
        <canvas ref={chartRef} />
      </div>
    );
  };
  
  export default GrowthChart;