import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./RevenueChart.css";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueChart = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [memberData, setMemberData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Giả lập việc lấy dữ liệu từ API
    const fetchData = async () => {
      try {
        setLoading(true);

        // Trong thực tế, bạn sẽ gọi API ở đây
        // const response = await fetch('https://api.example.com/revenue');
        // const data = await response.json();

        // Giả lập dữ liệu doanh thu theo tháng
        const mockRevenueData = generateMockRevenueData();
        setRevenueData(mockRevenueData);

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

  // Tạo dữ liệu giả về doanh thu theo tháng
  const generateMockRevenueData = () => {
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
      // Tạo doanh thu ngẫu nhiên từ 10 triệu đến 50 triệu
      const revenue = Math.floor(Math.random() * 40000000) + 10000000;

      // Tạo doanh thu tháng trước đó (để so sánh)
      const lastYearRevenue = Math.floor(revenue * (0.7 + Math.random() * 0.5));

      return {
        month: `${month}/${currentYear}`,
        revenue: revenue,
        lastYearRevenue: lastYearRevenue,
      };
    });
  };

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

  // Chuẩn bị dữ liệu cho biểu đồ đường (doanh thu)
  const prepareRevenueChartData = () => {
    if (!revenueData.length) return null;

    const labels = revenueData.map((item) => item.month);
    const currentYearData = revenueData.map((item) => item.revenue);
    const lastYearData = revenueData.map((item) => item.lastYearRevenue);

    return {
      labels,
      datasets: [
        {
          label: "Doanh thu năm nay",
          data: currentYearData,
          borderColor: "rgba(53, 162, 235, 1)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "Doanh thu năm trước",
          data: lastYearData,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          tension: 0.4,
          fill: false,
          borderDash: [5, 5],
        },
      ],
    };
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

  // Tùy chọn cho biểu đồ đường
  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Doanh thu theo tháng",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              notation: "compact",
              compactDisplay: "short",
            }).format(value);
          },
        },
      },
    },
  };

  // Tùy chọn cho biểu đồ cột
  const memberChartOptions = {
    responsive: true,
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

  const revenueChartData = prepareRevenueChartData();
  const memberChartData = prepareMemberChartData();

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="revenue-chart-container">
      <div className="chart-wrapper">
        <h2>Thống kê doanh thu</h2>
        {revenueChartData && (
          <div className="line-chart">
            <Line data={revenueChartData} options={revenueChartOptions} />
          </div>
        )}
      </div>

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

export default RevenueChart;
