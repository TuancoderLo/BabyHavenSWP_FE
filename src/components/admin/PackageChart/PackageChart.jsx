import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import "./PackageChart.css";
import membershipApi from "../../../services/memberShipApi";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PackageChart = () => {
  const [packageDistribution, setPackageDistribution] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy dữ liệu từ API
        const membershipsResponse = await membershipApi.getAllMemberships();
        const memberships = membershipsResponse.data?.data || [];

        // Tính toán phân bố gói thành viên
        const distribution = calculatePackageDistribution(memberships);
        setPackageDistribution(distribution);

        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Lỗi khi tải dữ liệu: " + (err.message || "Không xác định"));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tính toán phân bố gói thành viên
  const calculatePackageDistribution = (memberships) => {
    // Lọc ra các thành viên đang hoạt động
    const activeMembers = memberships.filter(
      (member) => member.status === "Active" && member.isActive
    );

    // Đếm số lượng thành viên theo từng gói
    const packageCounts = {
      Free: 0,
      Standard: 0,
      Premium: 0,
      Other: 0,
    };

    activeMembers.forEach((member) => {
      if (packageCounts.hasOwnProperty(member.packageName)) {
        packageCounts[member.packageName]++;
      } else {
        packageCounts.Other++;
      }
    });

    // Tính tổng số thành viên
    const totalMembers = activeMembers.length;

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

  // Chuẩn bị dữ liệu cho biểu đồ tròn
  const preparePackageDistributionData = () => {
    if (!packageDistribution.percentages) return null;

    return {
      labels: ["Free", "Standard", "Premium", "Khác"],
      datasets: [
        {
          data: [
            packageDistribution.counts.Free,
            packageDistribution.counts.Standard,
            packageDistribution.counts.Premium,
            packageDistribution.counts.Other,
          ],
          backgroundColor: [
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Tùy chọn cho biểu đồ tròn
  const packageDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Phân bố gói thành viên",
        font: {
          size: 16,
        },
      },
      tooltip: {
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
    },
  };

  const packageDistributionData = preparePackageDistributionData();

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="package-chart-container">
      <div className="package-summary">
        <div className="summary-item">
          <h3>Tổng số thành viên</h3>
          <p className="amount">{packageDistribution.total || 0}</p>
        </div>
        <div className="summary-item">
          <h3>Gói phổ biến nhất</h3>
          <p className="amount">
            {Object.entries(packageDistribution.counts || {})
              .sort((a, b) => b[1] - a[1])
              .filter(([name, count]) => count > 0)
              .map(([name, count]) => name)[0] || "N/A"}
          </p>
        </div>
      </div>

      <div className="chart-wrapper">
        <h2>Phân bố gói thành viên</h2>
        {packageDistributionData && (
          <div className="pie-chart">
            <Pie
              data={packageDistributionData}
              options={packageDistributionOptions}
            />
          </div>
        )}
      </div>

      <div className="package-stats">
        <h3>Chi tiết phân bố</h3>
        {packageDistribution.percentages && (
          <div className="stats-grid">
            <div className="package-stat-item">
              <div className="stat-header">
                <span className="color-indicator free"></span>
                <span className="package-name">Free</span>
              </div>
              <div className="stat-details">
                <div className="stat-count">
                  {packageDistribution.counts.Free} thành viên
                </div>
                <div className="stat-percentage">
                  {packageDistribution.percentages.Free.percentage.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="package-stat-item">
              <div className="stat-header">
                <span className="color-indicator standard"></span>
                <span className="package-name">Standard</span>
              </div>
              <div className="stat-details">
                <div className="stat-count">
                  {packageDistribution.counts.Standard} thành viên
                </div>
                <div className="stat-percentage">
                  {packageDistribution.percentages.Standard.percentage.toFixed(
                    1
                  )}
                  %
                </div>
              </div>
            </div>

            <div className="package-stat-item">
              <div className="stat-header">
                <span className="color-indicator premium"></span>
                <span className="package-name">Premium</span>
              </div>
              <div className="stat-details">
                <div className="stat-count">
                  {packageDistribution.counts.Premium} thành viên
                </div>
                <div className="stat-percentage">
                  {packageDistribution.percentages.Premium.percentage.toFixed(
                    1
                  )}
                  %
                </div>
              </div>
            </div>

            {packageDistribution.counts.Other > 0 && (
              <div className="package-stat-item">
                <div className="stat-header">
                  <span className="color-indicator other"></span>
                  <span className="package-name">Khác</span>
                </div>
                <div className="stat-details">
                  <div className="stat-count">
                    {packageDistribution.counts.Other} thành viên
                  </div>
                  <div className="stat-percentage">
                    {packageDistribution.percentages.Other.percentage.toFixed(
                      1
                    )}
                    %
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageChart;
