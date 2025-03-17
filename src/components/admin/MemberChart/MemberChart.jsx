import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./MemberChart.css";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MemberChart = () => {
  const [memberData, setMemberData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Giả lập việc lấy dữ liệu từ API
    const fetchData = async () => {
      try {
        setLoading(true);

        // Trong thực tế, bạn sẽ gọi API ở đây
        // const response = await fetch('https://api.example.com/members');
        // const data = await response.json();

        // Giả lập dữ liệu thành viên đăng ký theo tháng
        const mockMemberData = generateMockMemberData();
        setMemberData(mockMemberData);

        setLoading(false);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu: " + err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tạo dữ liệu giả về số lượng thành viên đăng ký theo tháng
  const generateMockMemberData = () => {
    const months = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ];
    const currentYear = new Date().getFullYear();

    // Tạo dữ liệu cho 12 tháng gần nhất
    return months.map((month) => {
      // Tạo số lượng thành viên mới ngẫu nhiên từ 20 đến 150
      const newMembers = Math.floor(Math.random() * 130) + 20;

      return {
        month: `${month}/${currentYear}`,
        newMembers: newMembers,
      };
    });
  };

  // Chuẩn bị dữ liệu cho biểu đồ cột (thành viên mới)
  const prepareMemberChartData = () => {
    if (!memberData.length) return null;

    const labels = memberData.map((item) => item.month);
    const newMembersData = memberData.map((item) => item.newMembers);

    return {
      labels,
      datasets: [
        {
          label: "Thành viên mới đăng ký",
          data: newMembersData,
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Tùy chọn cho biểu đồ cột
  const memberChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Thành viên mới đăng ký theo tháng",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const memberChartData = prepareMemberChartData();

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="member-chart-container">
      <div className="chart-wrapper">
        <h2>Thống kê thành viên mới</h2>
        {memberChartData && (
          <div className="bar-chart">
            <Bar data={memberChartData} options={memberChartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberChart;
