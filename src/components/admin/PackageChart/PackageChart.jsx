import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./PackageChart.css";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const PackageChart = () => {
  const [packageData, setPackageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState({});

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://localhost:7279/api/PackagePromotions"
        );
        const result = await response.json();

        if (result.status === 1 && result.data) {
          setPackageData(result.data);
          processMonthlyData(result.data);
        } else {
          setError("Không thể lấy dữ liệu package");
        }
      } catch (err) {
        setError("Lỗi khi kết nối đến API: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, []);

  // Xử lý dữ liệu để tính toán số lượng và doanh thu theo tháng
  const processMonthlyData = (data) => {
    // Giả lập dữ liệu số lượng người mua mỗi gói
    // Trong thực tế, dữ liệu này sẽ đến từ API
    const mockPurchaseData = {
      Free: 150,
      Standard: 80,
      Premium: 45,
    };

    // Giả lập giá của mỗi gói
    const packagePrices = {
      Free: 0,
      Standard: 200000,
      Premium: 500000,
    };

    // Tính toán doanh thu theo tháng (giả lập)
    const monthlyData = {};
    const currentDate = new Date();

    // Tạo dữ liệu cho 6 tháng gần nhất
    for (let i = 0; i < 6; i++) {
      const month = new Date(currentDate);
      month.setMonth(currentDate.getMonth() - i);
      const monthKey = `${month.getMonth() + 1}/${month.getFullYear()}`;

      // Giả lập số lượng mua mỗi tháng (với một chút biến động)
      const monthFactor = 1 - i * 0.05; // Giảm dần theo thời gian

      monthlyData[monthKey] = {
        Free: Math.round(
          mockPurchaseData["Free"] * monthFactor * (0.9 + Math.random() * 0.2)
        ),
        Standard: Math.round(
          mockPurchaseData["Standard"] *
            monthFactor *
            (0.9 + Math.random() * 0.2)
        ),
        Premium: Math.round(
          mockPurchaseData["Premium"] *
            monthFactor *
            (0.9 + Math.random() * 0.2)
        ),
      };

      // Tính doanh thu
      monthlyData[monthKey].revenue = {
        Free: monthlyData[monthKey]["Free"] * packagePrices["Free"],
        Standard: monthlyData[monthKey]["Standard"] * packagePrices["Standard"],
        Premium: monthlyData[monthKey]["Premium"] * packagePrices["Premium"],
      };

      // Tính tổng doanh thu
      monthlyData[monthKey].totalRevenue =
        monthlyData[monthKey].revenue["Free"] +
        monthlyData[monthKey].revenue["Standard"] +
        monthlyData[monthKey].revenue["Premium"];
    }

    setMonthlyRevenue(monthlyData);
  };

  // Chuẩn bị dữ liệu cho biểu đồ tròn
  const preparePieChartData = () => {
    // Đếm số lượng mỗi loại package
    const packageCounts = {};

    // Sử dụng dữ liệu từ tháng hiện tại
    const currentDate = new Date();
    const currentMonthKey = `${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}`;
    const currentMonthData = monthlyRevenue[currentMonthKey];

    if (!currentMonthData) return null;

    const totalUsers =
      currentMonthData["Free"] +
      currentMonthData["Standard"] +
      currentMonthData["Premium"];

    const data = {
      labels: ["Free", "Standard", "Premium"],
      datasets: [
        {
          label: "Số lượng người dùng",
          data: [
            currentMonthData["Free"],
            currentMonthData["Standard"],
            currentMonthData["Premium"],
          ],
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    return data;
  };

  // Tạo dữ liệu cho bảng tổng hợp theo tháng
  const renderMonthlyTable = () => {
    if (Object.keys(monthlyRevenue).length === 0) return null;

    return (
      <div className="monthly-table-container">
        <h3>Doanh thu theo tháng</h3>
        <table className="monthly-table">
          <thead>
            <tr>
              <th>Tháng</th>
              <th>Free</th>
              <th>Standard</th>
              <th>Premium</th>
              <th>Tổng doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(monthlyRevenue)
              .sort((a, b) => {
                const [monthA, yearA] = a.split("/");
                const [monthB, yearB] = b.split("/");
                return (
                  new Date(yearB, monthB - 1) - new Date(yearA, monthA - 1)
                );
              })
              .map((month) => (
                <tr key={month}>
                  <td>{month}</td>
                  <td>{monthlyRevenue[month]["Free"]} người</td>
                  <td>{monthlyRevenue[month]["Standard"]} người</td>
                  <td>{monthlyRevenue[month]["Premium"]} người</td>
                  <td>
                    {monthlyRevenue[month].totalRevenue.toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  };

  const pieChartData = preparePieChartData();

  // Thêm tùy chọn này vào biểu đồ Pie
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Quan trọng: cho phép biểu đồ thay đổi kích thước
    plugins: {
      // các tùy chọn khác giữ nguyên
    },
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="package-chart-container">
      <div className="chart-section">
        <h2>Phân bố người dùng theo gói dịch vụ</h2>
        {pieChartData && (
          <div className="pie-chart">
            <Pie
              data={pieChartData}
              options={{
                ...pieChartOptions,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || "";
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce(
                          (a, b) => a + b,
                          0
                        );
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} người (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      <div className="table-section">{renderMonthlyTable()}</div>
    </div>
  );
};

export default PackageChart;
