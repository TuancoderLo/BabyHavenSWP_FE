import React, { useState, useEffect } from "react";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./PackageChart.css";
import { FaUsers, FaAward, FaChartPie, FaChartLine } from "react-icons/fa";

// Đăng ký các thành phần cần thiết cho Chart.js và plugin datalabels
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartDataLabels
);

const PackageChart = ({ onDataLoaded, period = "all" }) => {
  const [packageDistribution, setPackageDistribution] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [monthlyStats, setMonthlyStats] = useState({});

  useEffect(() => {
    if (!dataFetched) {
      const fetchData = async () => {
        try {
          setLoading(true);

          // Use direct API URL
          const response = await fetch(
            "https://babyhaven-swp-a3f2frh5g4gtf4ee.southeastasia-01.azurewebsites.net/api/MemberMemberships"
          );
          const responseData = await response.json();
          const memberships = responseData.data || [];

          // Calculate membership package distribution
          const distribution = calculatePackageDistribution(memberships);
          setPackageDistribution(distribution);

          // Calculate monthly statistics
          const monthStats = calculateMonthlyStats(memberships);
          setMonthlyStats(monthStats);

          // Send data to parent component if callback exists
          if (onDataLoaded) {
            onDataLoaded(distribution);
          }

          setDataFetched(true);
          setLoading(false);
        } catch (err) {
          console.error("Error loading data:", err);
          setError("Error loading data: " + (err.message || "Unknown"));
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [onDataLoaded, dataFetched]);

  // Tính toán phân bố gói thành viên
  const calculatePackageDistribution = (memberships) => {
    // Lọc ra các thành viên đang hoạt động (status = "Active")
    const activeMembers = memberships.filter(
      (member) => member.status === "Active"
    );

    // Đếm số lượng thành viên theo từng gói - chỉ giữ lại 3 gói chính
    const packageCounts = {
      Free: 0,
      Standard: 0,
      Premium: 0,
    };

    activeMembers.forEach((member) => {
      // Chỉ tính 3 gói chính, bỏ qua các gói khác
      if (packageCounts.hasOwnProperty(member.packageName)) {
        packageCounts[member.packageName]++;
      }
    });

    // Tính tổng số thành viên
    const totalMembers = Object.values(packageCounts).reduce(
      (a, b) => a + b,
      0
    );

    // Tính phần trăm
    const packagePercentages = {};
    for (const [packageName, count] of Object.entries(packageCounts)) {
      packagePercentages[packageName] = {
        count,
        percentage: totalMembers > 0 ? (count / totalMembers) * 100 : 0,
      };
    }

    return {
      counts: packageCounts,
      percentages: packagePercentages,
      total: totalMembers,
    };
  };

  // Tính toán thống kê theo tháng
  const calculateMonthlyStats = (memberships) => {
    const monthlyData = {};

    // Thay đổi từ ngày hiện tại sang ngày trong tương lai để phù hợp với dữ liệu
    // Vì dữ liệu bắt đầu từ 2025-03-18, nên lấy thời điểm đó làm mốc
    const futureDate = new Date("2025-09-18"); // 6 tháng sau ngày bắt đầu

    // Tạo mảng cho 12 tháng, bao gồm trước và sau thời điểm startDate
    for (let i = -6; i < 6; i++) {
      const date = new Date(futureDate);
      date.setMonth(futureDate.getMonth() + i);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthlyData[monthKey] = {
        Free: 0,
        Standard: 0,
        Premium: 0,
        total: 0, // Loại bỏ phần "Other"
      };
    }

    // Lọc các thành viên có status = "Active"
    const activeMembers = memberships.filter(
      (member) => member.status === "Active"
    );

    activeMembers.forEach((member) => {
      const startDate = new Date(member.startDate);
      const endDate = new Date(member.endDate);

      // Kiểm tra từng tháng trong dữ liệu monthly
      Object.keys(monthlyData).forEach((monthKey) => {
        const [year, month] = monthKey.split("-").map((num) => parseInt(num));
        const checkDate = new Date(year, month - 1, 15); // Giữa tháng

        // Nếu thời gian đăng ký bao gồm tháng này
        if (startDate <= checkDate && endDate >= checkDate) {
          // Chỉ tính 3 gói chính
          if (
            member.packageName === "Free" ||
            member.packageName === "Standard" ||
            member.packageName === "Premium"
          ) {
            monthlyData[monthKey][member.packageName]++;
            monthlyData[monthKey].total++;
          }
        }
      });
    });

    return monthlyData;
  };

  // Xử lý thay đổi khoảng thời gian
  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
  };

  // Chuẩn bị dữ liệu cho biểu đồ tròn
  const preparePackageDistributionData = () => {
    if (!packageDistribution.percentages) return null;

    return {
      labels: ["Free", "Standard", "Premium"], // Loại bỏ "Khác"
      datasets: [
        {
          data: [
            packageDistribution.counts.Free,
            packageDistribution.counts.Standard,
            packageDistribution.counts.Premium,
          ],
          backgroundColor: [
            "rgba(77, 144, 254, 0.8)",
            "rgba(255, 193, 7, 0.8)",
            "rgba(0, 200, 151, 0.8)",
          ],
          borderColor: [
            "rgba(77, 144, 254, 1)",
            "rgba(255, 193, 7, 1)",
            "rgba(0, 200, 151, 1)",
          ],
          borderWidth: 1,
          hoverBackgroundColor: [
            "rgba(77, 144, 254, 1)",
            "rgba(255, 193, 7, 1)",
            "rgba(0, 200, 151, 1)",
          ],
          hoverBorderWidth: 2,
        },
      ],
    };
  };

  // Chuẩn bị dữ liệu cho biểu đồ tháng
  const prepareMonthlyChartData = () => {
    if (!monthlyStats || Object.keys(monthlyStats).length === 0) return null;

    // Sort months in order
    const sortedMonths = Object.keys(monthlyStats).sort();

    // List of months to display (formatted for better display)
    const labels = sortedMonths.map((monthKey) => {
      const [year, month] = monthKey.split("-");
      return `Month ${month}/${year}`;
    });

    // Data for each package - keep only the 3 main packages
    const freeCounts = sortedMonths.map((month) => monthlyStats[month].Free);
    const standardCounts = sortedMonths.map(
      (month) => monthlyStats[month].Standard
    );
    const premiumCounts = sortedMonths.map(
      (month) => monthlyStats[month].Premium
    );

    return {
      labels,
      datasets: [
        {
          label: "Free",
          data: freeCounts,
          backgroundColor: "rgba(77, 144, 254, 0.2)",
          borderColor: "rgba(77, 144, 254, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(77, 144, 254, 1)",
          pointBorderColor: "#fff",
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: true,
        },
        {
          label: "Standard",
          data: standardCounts,
          backgroundColor: "rgba(255, 193, 7, 0.2)",
          borderColor: "rgba(255, 193, 7, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(255, 193, 7, 1)",
          pointBorderColor: "#fff",
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: true,
        },
        {
          label: "Premium",
          data: premiumCounts,
          backgroundColor: "rgba(0, 200, 151, 0.2)",
          borderColor: "rgba(0, 200, 151, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(0, 200, 151, 1)",
          pointBorderColor: "#fff",
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: true,
        },
      ],
    };
  };

  // Tùy chọn cho biểu đồ tròn - giữ hiển thị nhãn phần trăm
  const packageDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      title: {
        display: true,
        text: "Active Member Package Distribution",
        font: {
          family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          size: 14,
        },
        bodyFont: {
          family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          size: 13,
        },
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const percentage = packageDistribution.total
              ? ((value / packageDistribution.total) * 100).toFixed(1)
              : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
      // Giữ lại plugin datalabels để hiển thị nhãn phần trăm trực tiếp trên biểu đồ
      datalabels: {
        display: true,
        color: "#fff",
        font: {
          weight: "bold",
          size: 16, // Tăng kích thước để dễ đọc hơn
          family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        },
        textStrokeColor: "rgba(0, 0, 0, 0.5)",
        textStrokeWidth: 2,
        formatter: (value, ctx) => {
          const dataset = ctx.chart.data.datasets[0];
          const sum = dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / sum) * 100).toFixed(1) + "%";
          return percentage;
        },
        align: "center",
        anchor: "center",
      },
    },
    cutout: "60%",
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };

  // Tùy chọn cho biểu đồ tháng - điều chỉnh thang đo trục Y
  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            size: 11,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: 100, // Điều chỉnh thang đo tối đa lên 100
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            size: 12,
          },
          stepSize: 10, // Khoảng cách giữa các mốc là 10
          callback: function (value) {
            return value + ""; // Hiển thị giá trị số nguyên
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: {
          font: {
            family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15,
        },
      },
      title: {
        display: true,
        text: "Monthly Member Package Trends",
        font: {
          family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          size: 14,
        },
        bodyFont: {
          family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          size: 13,
        },
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + " members";
            }
            return label;
          },
        },
      },
    },
    animations: {
      tension: {
        duration: 1000,
        easing: "linear",
        from: 0.5,
        to: 0.3,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  const packageDistributionData = preparePackageDistributionData();
  const monthlyChartData = prepareMonthlyChartData();

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading data...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error}</p>
      </div>
    );

  // Tìm gói phổ biến nhất
  const mostPopularPackage =
    Object.entries(packageDistribution.counts || {})
      .sort((a, b) => b[1] - a[1])
      .filter(([name, count]) => count > 0)
      .map(([name, count]) => name)[0] || "N/A";

  // Xác định màu cho gói phổ biến nhất
  const getPackageColor = (packageName) => {
    switch (packageName) {
      case "Free":
        return "var(--free-color)";
      case "Standard":
        return "var(--standard-color)";
      case "Premium":
        return "var(--premium-color)";
      default:
        return "var(--other-color)";
    }
  };

  return (
    <div className="package-chart-container">
      <h1 className="dashboard-title">Member Package Statistics</h1>

      <div className="dashboard-summary">
        <div className="summary-card total-members">
          <div className="summary-icon">
            <FaUsers />
          </div>
          <div className="summary-content">
            <h3>Total Active Members</h3>
            <p className="summary-value">{packageDistribution.total || 0}</p>
          </div>
        </div>

        <div className="summary-card popular-package">
          <div className="summary-icon">
            <FaAward />
          </div>
          <div className="summary-content">
            <h3>Most Popular Package</h3>
            <p
              className="summary-value"
              style={{ color: getPackageColor(mostPopularPackage) }}
            >
              {mostPopularPackage}
            </p>
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <div className="chart-header">
            <FaChartPie className="chart-icon" />
            <h2>Member Package Distribution</h2>
          </div>
          {packageDistributionData && (
            <div className="pie-chart-container">
              <Pie
                data={packageDistributionData}
                options={packageDistributionOptions}
              />
            </div>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <FaChartLine className="chart-icon" />
            <h2>Monthly Trends</h2>
          </div>
          {monthlyChartData && (
            <div className="line-chart-container">
              <Line data={monthlyChartData} options={monthlyChartOptions} />
            </div>
          )}
        </div>
      </div>

      <div className="stats-card">
        <h2 className="stats-title">Member Package Details</h2>
        {packageDistribution.percentages && (
          <div className="package-stats-grid">
            <div className="package-stat-card free">
              <div className="package-stat-header">
                <div className="package-stat-icon"></div>
                <h3 className="package-name">Free</h3>
              </div>
              <div className="package-stat-body">
                <div className="stat-number">
                  {packageDistribution.counts.Free}
                </div>
                <div className="stat-label">members</div>
              </div>
              <div className="package-stat-footer">
                <div className="percentage-bar">
                  <div
                    className="percentage-value"
                    style={{
                      width: `${packageDistribution.percentages.Free.percentage}%`,
                    }}
                  ></div>
                </div>
                <div className="percentage-text">
                  {packageDistribution.percentages.Free.percentage.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="package-stat-card standard">
              <div className="package-stat-header">
                <div className="package-stat-icon"></div>
                <h3 className="package-name">Standard</h3>
              </div>
              <div className="package-stat-body">
                <div className="stat-number">
                  {packageDistribution.counts.Standard}
                </div>
                <div className="stat-label">members</div>
              </div>
              <div className="package-stat-footer">
                <div className="percentage-bar">
                  <div
                    className="percentage-value"
                    style={{
                      width: `${packageDistribution.percentages.Standard.percentage}%`,
                    }}
                  ></div>
                </div>
                <div className="percentage-text">
                  {packageDistribution.percentages.Standard.percentage.toFixed(
                    1
                  )}
                  %
                </div>
              </div>
            </div>

            <div className="package-stat-card premium">
              <div className="package-stat-header">
                <div className="package-stat-icon"></div>
                <h3 className="package-name">Premium</h3>
              </div>
              <div className="package-stat-body">
                <div className="stat-number">
                  {packageDistribution.counts.Premium}
                </div>
                <div className="stat-label">members</div>
              </div>
              <div className="package-stat-footer">
                <div className="percentage-bar">
                  <div
                    className="percentage-value"
                    style={{
                      width: `${packageDistribution.percentages.Premium.percentage}%`,
                    }}
                  ></div>
                </div>
                <div className="percentage-text">
                  {packageDistribution.percentages.Premium.percentage.toFixed(
                    1
                  )}
                  %
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageChart;
