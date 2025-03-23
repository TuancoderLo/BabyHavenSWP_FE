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
import transactionApi from "../../../../services/transactionApi";

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
  const [packageRevenueData, setPackageRevenueData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // Default tab is overview
  const [showDetailModal, setShowDetailModal] = useState(false); // State controlling detail modal
  const [transactions, setTransactions] = useState([]); // State storing transactions
  const [transactionType, setTransactionType] = useState("all"); // Filter by package type: all, standard, premium
  const [statusFilter, setStatusFilter] = useState("all"); // Filter by status: all, completed, pending, failed, cancelled

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get data from Transactions API
        const transactionsResponse = await transactionApi.getAllTransactions();

        // Check returned data
        const allTransactions = transactionsResponse.data?.data || [];

        // Save all transactions to display in details
        setTransactions(allTransactions);

        // Filter to get only Completed transactions
        const completedTransactions = allTransactions.filter(
          (transaction) => transaction.paymentStatus === "Completed"
        );

        // Calculate revenue by month
        const revenueByMonth = calculateRevenueByMonth(completedTransactions);
        setRevenueData(revenueByMonth);

        // Calculate revenue by package
        const revenueByPackage = calculateRevenueByPackage(
          completedTransactions
        );
        setPackageRevenueData(revenueByPackage);

        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error loading data: " + (err.message || "Unknown"));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tính toán doanh thu theo tháng
  const calculateRevenueByMonth = (transactions) => {
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
        standardRevenue: 0,
        premiumRevenue: 0,
      });
    }

    // Tính toán doanh thu cho mỗi tháng
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.transactionDate);
      const amount = transaction.amount || 0;
      const packageName = transaction.packageName;

      // Tìm tháng tương ứng với giao dịch
      months.forEach((monthData) => {
        const monthStart = new Date(
          monthData.year,
          monthData.monthNumber - 1,
          1
        );
        const monthEnd = new Date(monthData.year, monthData.monthNumber, 0);

        // Kiểm tra xem giao dịch có trong tháng này không
        if (transactionDate >= monthStart && transactionDate <= monthEnd) {
          monthData.revenue += amount;

          // Phân loại theo gói
          if (packageName === "Standard") {
            monthData.standardRevenue += amount;
          } else if (packageName === "Premium") {
            monthData.premiumRevenue += amount;
          }
        }

        // Tính doanh thu năm trước
        const lastYearMonth = new Date(
          monthData.year - 1,
          monthData.monthNumber - 1
        );
        const lastYearMonthStart = new Date(
          lastYearMonth.getFullYear(),
          lastYearMonth.getMonth(),
          1
        );
        const lastYearMonthEnd = new Date(
          lastYearMonth.getFullYear(),
          lastYearMonth.getMonth() + 1,
          0
        );

        if (
          transactionDate >= lastYearMonthStart &&
          transactionDate <= lastYearMonthEnd
        ) {
          monthData.lastYearRevenue += amount;
        }
      });
    });

    return months;
  };

  // Tính toán doanh thu theo gói
  const calculateRevenueByPackage = (transactions) => {
    const packageRevenue = {
      Standard: 0,
      Premium: 0,
    };

    transactions.forEach((transaction) => {
      const packageName = transaction.packageName;
      const amount = transaction.amount || 0;

      if (packageName === "Standard") {
        packageRevenue.Standard += amount;
      } else if (packageName === "Premium") {
        packageRevenue.Premium += amount;
      }
    });

    return packageRevenue;
  };

  // Chuẩn bị dữ liệu cho biểu đồ đường (doanh thu theo tháng)
  const prepareRevenueChartData = () => {
    if (!revenueData.length) return null;

    const labels = revenueData.map((item) => item.month);
    const currentYearData = revenueData.map((item) => item.revenue);
    const lastYearData = revenueData.map((item) => item.lastYearRevenue);

    return {
      labels,
      datasets: [
        {
          label: "Revenue this year",
          data: currentYearData,
          borderColor: "rgba(53, 162, 235, 1)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "Revenue last year",
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

  // Chuẩn bị dữ liệu cho biểu đồ đường (phân tích theo gói)
  const preparePackageRevenueChartData = () => {
    if (!revenueData.length) return null;

    const labels = revenueData.map((item) => item.month);
    const standardData = revenueData.map((item) => item.standardRevenue);
    const premiumData = revenueData.map((item) => item.premiumRevenue);

    return {
      labels,
      datasets: [
        {
          label: "Standard Package",
          data: standardData,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          tension: 0.4,
        },
        {
          label: "Premium Package",
          data: premiumData,
          borderColor: "rgba(153, 102, 255, 1)",
          backgroundColor: "rgba(153, 102, 255, 0.5)",
          tension: 0.4,
        },
      ],
    };
  };

  // Chuẩn bị dữ liệu cho biểu đồ cột (tổng doanh thu theo gói)
  const preparePackageTotalChartData = () => {
    if (!packageRevenueData || Object.keys(packageRevenueData).length === 0)
      return null;

    return {
      labels: ["Standard", "Premium"],
      datasets: [
        {
          label: "Revenue by Package",
          data: [packageRevenueData.Standard, packageRevenueData.Premium],
          backgroundColor: [
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
          ],
          borderColor: ["rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)"],
          borderWidth: 1,
        },
      ],
    };
  };

  // Tùy chọn chung cho biểu đồ
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
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

  // Tùy chọn cho biểu đồ doanh thu theo tháng
  const revenueChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: "Monthly Revenue",
        font: {
          size: 16,
        },
      },
    },
  };

  // Tùy chọn cho biểu đồ doanh thu theo gói
  const packageRevenueChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: "Monthly Revenue by Package",
        font: {
          size: 16,
        },
      },
    },
  };

  // Tùy chọn cho biểu đồ cột tổng doanh thu theo gói
  const packageTotalChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: "Total Revenue by Package",
        font: {
          size: 16,
        },
      },
    },
  };

  // Chuẩn bị dữ liệu cho biểu đồ
  const revenueChartData = prepareRevenueChartData();
  const packageRevenueChartData = preparePackageRevenueChartData();
  const packageTotalChartData = preparePackageTotalChartData();

  if (loading)
    return (
      <div className="loading-container">
        <div className="loader"></div> <span>Loading data...</span>
      </div>
    );
  if (error)
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-circle"></i> {error}
      </div>
    );

  // Lọc giao dịch theo loại gói và trạng thái
  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // Lọc theo gói
    if (transactionType === "standard") {
      filtered = filtered.filter((t) => t.packageName === "Standard");
    } else if (transactionType === "premium") {
      filtered = filtered.filter((t) => t.packageName === "Premium");
    }

    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (t) => t.paymentStatus.toLowerCase() === statusFilter
      );
    }

    return filtered;
  };

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

  // Format ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Cải tiến hàm renderPaymentStatus với các trạng thái có màu sắc riêng
  const renderPaymentStatus = (status) => {
    const statusLower = status ? status.toLowerCase() : "";
    let statusClass = "simple-status";
    let text = "";

    switch (statusLower) {
      case "completed":
        statusClass += " completed";
        text = "Completed";
        break;
      case "pending":
        statusClass += " pending";
        text = "Pending";
        break;
      case "failed":
        statusClass += " failed";
        text = "Failed";
        break;
      case "cancelled":
        statusClass += " cancelled";
        text = "Cancelled";
        break;
      default:
        text = status || "Unknown";
    }

    return <span className={statusClass}>{text}</span>;
  };

  // Thêm hàm render gói dịch vụ
  const renderPackageBadge = (packageName) => {
    if (packageName === "Premium") {
      return (
        <span className="package-badge premium">
          <i className="fas fa-crown"></i> Premium
        </span>
      );
    } else {
      return (
        <span className="package-badge standard">
          <i className="fas fa-box"></i> Standard
        </span>
      );
    }
  };

  // Hàm format số tiền
  const formatAmount = (amount, currency = "VND") => {
    return (
      <span className="amount-value">
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: currency,
        }).format(amount)}
      </span>
    );
  };

  return (
    <div className="revenue-dashboard">
      {/* Card summaries */}
      <div className="summary-cards">
        <div className="summary-card total-revenue">
          <div className="card-icon">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="card-content">
            <h4>Total Revenue</h4>
            <div className="card-value">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalRevenue)}
            </div>
            <div
              className={`change-indicator ${
                revenueChange >= 0 ? "positive" : "negative"
              }`}
            >
              <i
                className={`fas ${
                  revenueChange >= 0 ? "fa-arrow-up" : "fa-arrow-down"
                }`}
              ></i>
              {revenueChangePercentage.toFixed(1)}% compared to last year
            </div>
          </div>
        </div>

        <div className="summary-card standard-revenue">
          <div className="card-icon">
            <i className="fas fa-box"></i>
          </div>
          <div className="card-content">
            <h4>Standard Package</h4>
            <div className="card-value">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(packageRevenueData.Standard || 0)}
            </div>
            <div className="package-percentage">
              {packageRevenueData.Standard
                ? ((packageRevenueData.Standard / totalRevenue) * 100).toFixed(
                    1
                  )
                : 0}
              % of total revenue
            </div>
          </div>
        </div>

        <div className="summary-card premium-revenue">
          <div className="card-icon">
            <i className="fas fa-crown"></i>
          </div>
          <div className="card-content">
            <h4>Premium Package</h4>
            <div className="card-value">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(packageRevenueData.Premium || 0)}
            </div>
            <div className="package-percentage">
              {packageRevenueData.Premium
                ? ((packageRevenueData.Premium / totalRevenue) * 100).toFixed(1)
                : 0}
              % of total revenue
            </div>
          </div>
        </div>

        <div className="summary-card monthly-average">
          <div className="card-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="card-content">
            <h4>Average Monthly Revenue</h4>
            <div className="card-value">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalRevenue / 12)}
            </div>
            <div className="package-percentage">Based on last 12 months</div>
          </div>
        </div>
      </div>

      {/* Chart navigation with Detail button */}
      <div className="chart-navigation">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          <i className="fas fa-chart-line"></i> Overview
        </button>
        <button
          className={activeTab === "packages" ? "active" : ""}
          onClick={() => setActiveTab("packages")}
        >
          <i className="fas fa-boxes"></i> Package Analysis
        </button>
        <button
          className={activeTab === "comparison" ? "active" : ""}
          onClick={() => setActiveTab("comparison")}
        >
          <i className="fas fa-balance-scale"></i> Comparison
        </button>
        <button
          className={activeTab === "details" ? "active" : ""}
          onClick={() => setActiveTab("details")}
        >
          <i className="fas fa-list-ul"></i> Details
        </button>
      </div>

      {/* Charts container */}
      <div className="revenue-charts">
        {activeTab === "overview" && (
          <div className="chart-panel">
            <div className="chart-card">
              <h3>
                <i className="fas fa-chart-line"></i> Monthly Revenue Chart
              </h3>
              <div className="chart-area">
                {revenueChartData && (
                  <Line data={revenueChartData} options={revenueChartOptions} />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "packages" && (
          <div className="chart-panel">
            <div className="chart-card">
              <h3>
                <i className="fas fa-boxes"></i> Revenue by Service Package
              </h3>
              <div className="chart-area">
                {packageRevenueChartData && (
                  <Line
                    data={packageRevenueChartData}
                    options={packageRevenueChartOptions}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "comparison" && (
          <div className="chart-panel">
            <div className="chart-card">
              <h3>
                <i className="fas fa-balance-scale"></i> Package Revenue
                Comparison
              </h3>
              <div className="chart-area">
                {packageTotalChartData && (
                  <Bar
                    data={packageTotalChartData}
                    options={packageTotalChartOptions}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Improved Detail tab */}
        {activeTab === "details" && (
          <div className="chart-panel">
            <div className="chart-card simple-detail">
              <h3>
                <i className="fas fa-file-invoice-dollar"></i> Transaction
                Details
              </h3>

              {/* Improved filters */}
              <div className="simple-filter">
                <div className="filter-row">
                  <label>Service Package:</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                  >
                    <option value="all">All Packages</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                <div className="filter-row">
                  <label>Payment Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Improved table */}
              <div className="simple-table-container">
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Package</th>
                      <th>Amount</th>
                      <th>Transaction Type</th>
                      <th>Method</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredTransactions().length > 0 ? (
                      getFilteredTransactions().map((transaction, index) => (
                        <tr key={index}>
                          <td>{transaction.fullName}</td>
                          <td>{renderPackageBadge(transaction.packageName)}</td>
                          <td>
                            {formatAmount(
                              transaction.amount,
                              transaction.currency || "VND"
                            )}
                          </td>
                          <td>{transaction.transactionType}</td>
                          <td>{transaction.paymentMethod}</td>
                          <td>{formatDate(transaction.transactionDate)}</td>
                          <td>
                            {renderPaymentStatus(transaction.paymentStatus)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="no-data">
                          <i className="fas fa-info-circle"></i> No data
                          matching the filter criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
