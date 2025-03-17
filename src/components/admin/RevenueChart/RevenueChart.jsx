import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./RevenueChart.css";
import membershipApi from "../../../services/memberShipApi";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueChart = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy dữ liệu từ cả hai API
        const membershipsResponse = await membershipApi.getAllMemberships();
        const packagesResponse = await membershipApi.getAllPackages();

        // Kiểm tra dữ liệu trả về
        const memberships = membershipsResponse.data?.data || [];
        const packages = packagesResponse.data?.data || [];

        // Tạo map để lưu trữ thông tin về các gói
        const packageMap = {};
        packages.forEach((pkg) => {
          packageMap[pkg.packageName] = {
            price: pkg.price,
            durationMonths: pkg.durationMonths,
          };
        });

        // Tính toán doanh thu theo tháng
        const revenueByMonth = calculateRevenueByMonth(memberships, packageMap);
        setRevenueData(revenueByMonth);

        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Lỗi khi tải dữ liệu: " + (err.message || "Không xác định"));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tính toán doanh thu theo tháng
  const calculateRevenueByMonth = (memberships, packageMap) => {
    // Lấy 12 tháng gần nhất
    const months = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      const month = `${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}/${date.getFullYear()}`;
      months.push({
        month,
        year: date.getFullYear(),
        monthNumber: date.getMonth() + 1,
        revenue: 0,
        lastYearRevenue: 0,
      });
    }

    // Tính toán doanh thu cho mỗi tháng
    memberships.forEach((membership) => {
      if (membership.status !== "Active" || !membership.isActive) return;

      const packageInfo = packageMap[membership.packageName];
      if (!packageInfo || packageInfo.price <= 0) return;

      const startDate = new Date(membership.startDate);
      const endDate = new Date(membership.endDate);
      const currentDate = new Date();

      // Tính toán số tiền mỗi tháng
      const monthlyPrice = packageInfo.price / packageInfo.durationMonths;

      // Duyệt qua các tháng và tính doanh thu
      months.forEach((monthData) => {
        const monthStart = new Date(
          monthData.year,
          monthData.monthNumber - 1,
          1
        );
        const monthEnd = new Date(monthData.year, monthData.monthNumber, 0);

        // Kiểm tra xem gói thành viên có hoạt động trong tháng này không
        if (startDate <= monthEnd && endDate >= monthStart) {
          monthData.revenue += monthlyPrice;
        }

        // Tính doanh thu năm trước
        const lastYearMonthStart = new Date(
          monthData.year - 1,
          monthData.monthNumber - 1,
          1
        );
        const lastYearMonthEnd = new Date(
          monthData.year - 1,
          monthData.monthNumber,
          0
        );

        if (startDate <= lastYearMonthEnd && endDate >= lastYearMonthStart) {
          monthData.lastYearRevenue += monthlyPrice;
        }
      });
    });

    return months;
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

  // Thêm các tùy chọn này vào biểu đồ Line
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
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

  // Áp dụng vào revenueChartOptions
  const revenueChartOptions = {
    ...commonOptions,
  };

  const revenueChartData = prepareRevenueChartData();

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">{error}</div>;

  // Tính tổng doanh thu
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalLastYearRevenue = revenueData.reduce(
    (sum, item) => sum + item.lastYearRevenue,
    0
  );
  const revenueChange = totalRevenue - totalLastYearRevenue;
  const revenueChangePercentage = totalLastYearRevenue
    ? (revenueChange / totalLastYearRevenue) * 100
    : 0;

  return (
    <div className="revenue-chart-container">
      <div className="revenue-summary">
        <div className="summary-item">
          <h3>Tổng doanh thu năm nay</h3>
          <p className="amount">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(totalRevenue)}
          </p>
        </div>
        <div className="summary-item">
          <h3>So với năm trước</h3>
          <p
            className={`change ${revenueChange >= 0 ? "positive" : "negative"}`}
          >
            {revenueChange >= 0 ? "+" : ""}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(revenueChange)}{" "}
            ({revenueChangePercentage >= 0 ? "+" : ""}
            {revenueChangePercentage.toFixed(2)}%)
          </p>
        </div>
      </div>
      <div className="chart-wrapper">
        <h2>Thống kê doanh thu</h2>
        {revenueChartData && (
          <div className="line-chart">
            <Line data={revenueChartData} options={revenueChartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
