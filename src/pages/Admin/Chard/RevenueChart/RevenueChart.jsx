import React, { useState, useEffect } from "react";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RevenueChart.css";
import transactionApi from "../../../../services/transactionApi";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueChart = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [packageRevenueData, setPackageRevenueData] = useState({});
  const [quarterlyRevenueData, setQuarterlyRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // Default tab is overview
  const [transactions, setTransactions] = useState([]); // State storing transactions

  // Filters
  const [transactionType, setTransactionType] = useState("all"); // Filter by package type: all, standard, premium
  const [statusFilter, setStatusFilter] = useState("all"); // Filter by status: all, completed, pending, failed, cancelled
  const [nameFilter, setNameFilter] = useState(""); // Tìm kiếm theo tên khách hàng
  const [startDate, setStartDate] = useState(null); // Ngày bắt đầu lọc
  const [endDate, setEndDate] = useState(null); // Ngày kết thúc lọc
  const [dateFilterType, setDateFilterType] = useState("transaction"); // Lọc theo ngày giao dịch (transaction) hoặc ngày thanh toán (payment)
  const [timeFrame, setTimeFrame] = useState("all"); // Khung thời gian: all, today, yesterday, thisWeek, thisMonth, thisQuarter, thisYear
  const [selectedTransaction, setSelectedTransaction] = useState(null); // Giao dịch được chọn để xem chi tiết
  const [showTransactionDetail, setShowTransactionDetail] = useState(false); // Hiển thị modal chi tiết giao dịch
  const [comparisonMetric, setComparisonMetric] = useState("revenue"); // Tiêu chí so sánh: revenue, transactions

  // Paging
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

        // Filter to get only Completed transactions for revenue calculations
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

        // Calculate revenue by quarter
        const revenueByQuarter = calculateRevenueByQuarter(
          completedTransactions
        );
        setQuarterlyRevenueData(revenueByQuarter);

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
    // Thiết lập ngày bắt đầu là ngày hiện tại - 12 tháng
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setFullYear(currentDate.getFullYear() - 1);
    startDate.setDate(1);

    // Tính số tháng để hiển thị (12 tháng gần nhất)
    const monthDiff = 12;

    // Mảng để lưu dữ liệu của các tháng
    const months = [];

    // Tạo dữ liệu cho 12 tháng gần nhất
    for (let i = 0; i < monthDiff; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const month = `${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}/${date.getFullYear()}`;
      months.push({
        month,
        year: date.getFullYear(),
        monthNumber: date.getMonth() + 1,
        revenue: 0,
        standardRevenue: 0,
        premiumRevenue: 0,
        transactionCount: 0,
        standardCount: 0,
        premiumCount: 0,
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
          monthData.transactionCount += 1;

          // Phân loại theo gói
          if (packageName === "Standard") {
            monthData.standardRevenue += amount;
            monthData.standardCount += 1;
          } else if (packageName === "Premium") {
            monthData.premiumRevenue += amount;
            monthData.premiumCount += 1;
          }
        }
      });
    });

    return months;
  };

  // Tính toán doanh thu theo gói
  const calculateRevenueByPackage = (transactions) => {
    const packageRevenue = {
      Standard: {
        revenue: 0,
        count: 0,
        percentageOfTotal: 0,
      },
      Premium: {
        revenue: 0,
        count: 0,
        percentageOfTotal: 0,
      },
    };

    let totalRevenue = 0;
    let totalCount = 0;

    transactions.forEach((transaction) => {
      const packageName = transaction.packageName;
      const amount = transaction.amount || 0;
      totalRevenue += amount;
      totalCount += 1;

      if (packageName === "Standard") {
        packageRevenue.Standard.revenue += amount;
        packageRevenue.Standard.count += 1;
      } else if (packageName === "Premium") {
        packageRevenue.Premium.revenue += amount;
        packageRevenue.Premium.count += 1;
      }
    });

    // Tính phần trăm của tổng doanh thu
    if (totalRevenue > 0) {
      packageRevenue.Standard.percentageOfTotal =
        (packageRevenue.Standard.revenue / totalRevenue) * 100;
      packageRevenue.Premium.percentageOfTotal =
        (packageRevenue.Premium.revenue / totalRevenue) * 100;
    }

    // Thêm tổng doanh thu vào kết quả
    packageRevenue.totalRevenue = totalRevenue;
    packageRevenue.totalCount = totalCount;

    return packageRevenue;
  };

  // Tính toán doanh thu theo quý
  const calculateRevenueByQuarter = (transactions) => {
    // Khởi tạo dữ liệu cho 4 quý của năm hiện tại và năm trước
    const currentYear = new Date().getFullYear();
    const quarters = [];

    // Tạo dữ liệu cho 4 quý của năm hiện tại
    for (let i = 1; i <= 4; i++) {
      quarters.push({
        quarter: `Q${i}/${currentYear}`,
        year: currentYear,
        quarterNumber: i,
        revenue: 0,
        standardRevenue: 0,
        premiumRevenue: 0,
        transactionCount: 0,
      });

      // Thêm quý của năm trước để so sánh
      quarters.push({
        quarter: `Q${i}/${currentYear - 1}`,
        year: currentYear - 1,
        quarterNumber: i,
        revenue: 0,
        standardRevenue: 0,
        premiumRevenue: 0,
        transactionCount: 0,
      });
    }

    // Tính toán doanh thu cho mỗi quý
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.transactionDate);
      const year = transactionDate.getFullYear();
      // Tính quý dựa trên tháng (0-11)
      const quarter = Math.floor(transactionDate.getMonth() / 3) + 1;
      const amount = transaction.amount || 0;
      const packageName = transaction.packageName;

      // Tìm quý tương ứng và cập nhật doanh thu
      const quarterData = quarters.find(
        (q) => q.year === year && q.quarterNumber === quarter
      );

      if (quarterData) {
        quarterData.revenue += amount;
        quarterData.transactionCount += 1;

        // Phân loại theo gói
        if (packageName === "Standard") {
          quarterData.standardRevenue += amount;
        } else if (packageName === "Premium") {
          quarterData.premiumRevenue += amount;
        }
      }
    });

    // Sắp xếp các quý theo năm và số thứ tự quý
    return quarters.sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.quarterNumber - b.quarterNumber
    );
  };

  // Chuẩn bị dữ liệu cho biểu đồ đường (doanh thu theo tháng)
  const prepareRevenueChartData = () => {
    if (!revenueData.length) return null;

    const labels = revenueData.map((item) => item.month);
    const revenueValues = revenueData.map((item) => item.revenue);

    return {
      labels,
      datasets: [
        {
          label: "Doanh thu hàng tháng",
          data: revenueValues,
          borderColor: "rgba(53, 162, 235, 1)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          tension: 0.4,
          fill: true,
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
          label: "Gói Standard",
          data: standardData,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          tension: 0.4,
        },
        {
          label: "Gói Premium",
          data: premiumData,
          borderColor: "rgba(153, 102, 255, 1)",
          backgroundColor: "rgba(153, 102, 255, 0.5)",
          tension: 0.4,
        },
      ],
    };
  };

  // Chuẩn bị dữ liệu cho biểu đồ doanh thu theo quý
  const prepareQuarterlyRevenueChartData = () => {
    if (!quarterlyRevenueData.length) return null;

    // Lọc ra các quý của năm hiện tại
    const currentYear = new Date().getFullYear();
    const currentYearQuarters = quarterlyRevenueData.filter(
      (q) => q.year === currentYear
    );

    const labels = currentYearQuarters.map((item) => item.quarter);
    const standardData = currentYearQuarters.map(
      (item) => item.standardRevenue
    );
    const premiumData = currentYearQuarters.map((item) => item.premiumRevenue);

    return {
      labels,
      datasets: [
        {
          label: "Gói Standard",
          data: standardData,
          backgroundColor: "rgba(75, 192, 192, 0.8)",
        },
        {
          label: "Gói Premium",
          data: premiumData,
          backgroundColor: "rgba(153, 102, 255, 0.8)",
        },
      ],
    };
  };

  // Chuẩn bị dữ liệu cho biểu đồ tròn (so sánh gói dịch vụ)
  const preparePackageComparisonPieChart = () => {
    if (!packageRevenueData || !packageRevenueData.Standard) return null;

    let dataValues = [];
    let labels = [];

    if (comparisonMetric === "revenue") {
      dataValues = [
        packageRevenueData.Standard.revenue,
        packageRevenueData.Premium.revenue,
      ];
      labels = [
        `Standard: ${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(packageRevenueData.Standard.revenue)}`,
        `Premium: ${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(packageRevenueData.Premium.revenue)}`,
      ];
    } else {
      dataValues = [
        packageRevenueData.Standard.count,
        packageRevenueData.Premium.count,
      ];
      labels = [
        `Standard: ${packageRevenueData.Standard.count} giao dịch`,
        `Premium: ${packageRevenueData.Premium.count} giao dịch`,
      ];
    }

    return {
      labels: labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: [
            "rgba(75, 192, 192, 0.8)",
            "rgba(153, 102, 255, 0.8)",
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
            } else if (context.parsed !== null) {
              label += new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(context.parsed);
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
        text: "Doanh Thu Hàng Tháng",
        font: {
          size: 16,
          weight: "bold",
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
        text: "Doanh Thu Theo Gói Dịch Vụ",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
  };

  // Tùy chọn cho biểu đồ doanh thu theo quý
  const quarterlyChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: "Doanh Thu Theo Quý",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
  };

  // Tùy chọn cho biểu đồ tròn
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `So Sánh Gói Dịch Vụ (${
          comparisonMetric === "revenue" ? "Doanh Thu" : "Số Lượng"
        })`,
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
  };

  // Chuẩn bị dữ liệu cho biểu đồ
  const revenueChartData = prepareRevenueChartData();
  const packageRevenueChartData = preparePackageRevenueChartData();
  const quarterlyRevenueChartData = prepareQuarterlyRevenueChartData();
  const packageComparisonPieChartData = preparePackageComparisonPieChart();

  if (loading)
    return (
      <div className="loading-container">
        <div className="loader"></div> <span>Đang tải dữ liệu...</span>
      </div>
    );
  if (error)
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-circle"></i> {error}
      </div>
    );

  // Xử lý lọc theo thời gian
  const applyTimeFrameFilter = () => {
    const now = new Date();
    let newStartDate = null;
    let newEndDate = new Date();

    switch (timeFrame) {
      case "today":
        newStartDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "yesterday":
        newStartDate = new Date(now);
        newStartDate.setDate(newStartDate.getDate() - 1);
        newStartDate.setHours(0, 0, 0, 0);
        newEndDate = new Date(now);
        newEndDate.setDate(newEndDate.getDate() - 1);
        newEndDate.setHours(23, 59, 59, 999);
        break;
      case "thisWeek":
        // Lấy ngày đầu tuần (Thứ Hai)
        newStartDate = new Date(now);
        const dayOfWeek = now.getDay() || 7; // Chuyển 0 (Chủ Nhật) thành 7
        newStartDate.setDate(now.getDate() - dayOfWeek + 1);
        newStartDate.setHours(0, 0, 0, 0);
        break;
      case "thisMonth":
        newStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "thisQuarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        newStartDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
      case "thisYear":
        newStartDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        // "all" - không áp dụng lọc theo thời gian
        break;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Thiết lập khung thời gian và lọc
  const handleTimeFrameChange = (newTimeFrame) => {
    setTimeFrame(newTimeFrame);

    // Nếu chọn "all", xóa bỏ các giới hạn thời gian
    if (newTimeFrame === "all") {
      setStartDate(null);
      setEndDate(null);
    } else {
      applyTimeFrameFilter();
    }
  };

  // Lọc giao dịch theo các tiêu chí
  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // Lọc theo gói
    if (transactionType !== "all") {
      filtered = filtered.filter(
        (t) => t.packageName.toLowerCase() === transactionType
      );
    }

    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (t) => t.paymentStatus.toLowerCase() === statusFilter
      );
    }

    // Lọc theo tên
    if (nameFilter.trim() !== "") {
      filtered = filtered.filter(
        (t) =>
          t.fullName &&
          t.fullName.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Lọc theo thời gian
    if (startDate) {
      const filterDate =
        dateFilterType === "transaction" ? "transactionDate" : "paymentDate";
      filtered = filtered.filter((t) => {
        if (!t[filterDate]) return false;
        const date = new Date(t[filterDate]);
        return date >= startDate;
      });
    }

    if (endDate) {
      const filterDate =
        dateFilterType === "transaction" ? "transactionDate" : "paymentDate";
      filtered = filtered.filter((t) => {
        if (!t[filterDate]) return false;
        const date = new Date(t[filterDate]);
        return date <= endDate;
      });
    }

    return filtered;
  };

  // Phân trang
  const paginateTransactions = (transactions) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return transactions.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Tính tổng số trang
  const totalPages = Math.ceil(getFilteredTransactions().length / itemsPerPage);

  // Chuyển đến trang cụ thể
  const goToPage = (pageNumber) => {
    setCurrentPage(Math.min(Math.max(1, pageNumber), totalPages));
  };

  // Tính tổng doanh thu từ các giao dịch đã lọc
  const calculateFilteredTotalRevenue = () => {
    const filteredTransactions = getFilteredTransactions().filter(
      (t) => t.paymentStatus.toLowerCase() === "completed"
    );
    return filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  // Tính số lượng giao dịch theo mỗi trạng thái
  const countTransactionsByStatus = () => {
    const filtered = getFilteredTransactions();
    const counts = {
      completed: 0,
      pending: 0,
      failed: 0,
      cancelled: 0,
      total: filtered.length,
    };

    filtered.forEach((t) => {
      const status = (t.paymentStatus || "").toLowerCase();
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });

    return counts;
  };

  // Thống kê trạng thái
  const statusCounts = countTransactionsByStatus();

  // Tính tổng doanh thu từ các giao dịch đã lọc
  const filteredTotalRevenue = calculateFilteredTotalRevenue();

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Hiển thị trạng thái thanh toán với màu sắc
  const renderPaymentStatus = (status) => {
    const statusLower = status ? status.toLowerCase() : "";
    let statusClass = "status-badge";
    let text = "";

    switch (statusLower) {
      case "completed":
        statusClass += " completed";
        text = "Đã thanh toán";
        break;
      case "pending":
        statusClass += " pending";
        text = "Đang chờ";
        break;
      case "failed":
        statusClass += " failed";
        text = "Thất bại";
        break;
      case "cancelled":
        statusClass += " cancelled";
        text = "Đã hủy";
        break;
      default:
        text = status || "Không xác định";
    }

    return <span className={statusClass}>{text}</span>;
  };

  // Hiển thị gói dịch vụ
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

  // Format số tiền
  const formatAmount = (amount, currency = "VND") => {
    return (
      <span className="amount-value">
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: currency || "VND",
          maximumFractionDigits: 0,
        }).format(amount || 0)}
      </span>
    );
  };

  // Mở modal xem chi tiết giao dịch
  const openTransactionDetail = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);
  };

  // Đóng modal chi tiết
  const closeTransactionDetail = () => {
    setSelectedTransaction(null);
    setShowTransactionDetail(false);
  };

  return (
    <div className="revenue-dashboard">
      {/* Tiêu đề */}
      <div className="dashboard-header">
        <h2>
          <i className="fas fa-chart-line"></i> Báo Cáo Doanh Thu
        </h2>
        <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-sync-alt"></i> Làm mới
          </button>
        </div>
      </div>

      {/* Bộ lọc thời gian và khung thời gian */}
      <div className="time-filter-container">
        <div className="time-frame-selector">
          <button
            className={timeFrame === "all" ? "active" : ""}
            onClick={() => handleTimeFrameChange("all")}
          >
            Tất cả
          </button>
          <button
            className={timeFrame === "today" ? "active" : ""}
            onClick={() => handleTimeFrameChange("today")}
          >
            Hôm nay
          </button>
          <button
            className={timeFrame === "thisWeek" ? "active" : ""}
            onClick={() => handleTimeFrameChange("thisWeek")}
          >
            Tuần này
          </button>
          <button
            className={timeFrame === "thisMonth" ? "active" : ""}
            onClick={() => handleTimeFrameChange("thisMonth")}
          >
            Tháng này
          </button>
          <button
            className={timeFrame === "thisQuarter" ? "active" : ""}
            onClick={() => handleTimeFrameChange("thisQuarter")}
          >
            Quý này
          </button>
          <button
            className={timeFrame === "thisYear" ? "active" : ""}
            onClick={() => handleTimeFrameChange("thisYear")}
          >
            Năm nay
          </button>
        </div>

        <div className="custom-date-range">
          <div className="date-filter-type">
            <label>
              <input
                type="radio"
                name="dateFilterType"
                value="transaction"
                checked={dateFilterType === "transaction"}
                onChange={() => setDateFilterType("transaction")}
              />
              Ngày giao dịch
            </label>
            <label>
              <input
                type="radio"
                name="dateFilterType"
                value="payment"
                checked={dateFilterType === "payment"}
                onChange={() => setDateFilterType("payment")}
              />
              Ngày thanh toán
            </label>
          </div>

          <div className="date-range-inputs">
            <div className="date-range-input">
              <label>Từ ngày:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn ngày bắt đầu"
                className="date-picker"
              />
            </div>

            <div className="date-range-input">
              <label>Đến ngày:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn ngày kết thúc"
                className="date-picker"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card summaries */}
      <div className="summary-cards">
        <div className="summary-card total-revenue">
          <div className="card-icon">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="card-content">
            <h4>Tổng Doanh Thu</h4>
            <div className="card-value">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(filteredTotalRevenue)}
            </div>
            <div className="card-subtitle">
              {statusCounts.completed} giao dịch thành công
            </div>
          </div>
        </div>

        <div className="summary-card transaction-counts">
          <div className="card-icon">
            <i className="fas fa-receipt"></i>
          </div>
          <div className="card-content">
            <h4>Tổng Giao Dịch</h4>
            <div className="card-value">{statusCounts.total}</div>
            <div className="transaction-status-summary">
              <span className="status-dot completed"></span> Thành công:{" "}
              {statusCounts.completed}
              <span className="status-dot pending"></span> Đang chờ:{" "}
              {statusCounts.pending}
              <span className="status-dot failed"></span> Thất bại:{" "}
              {statusCounts.failed}
            </div>
          </div>
        </div>

        <div className="summary-card standard-revenue">
          <div className="card-icon">
            <i className="fas fa-box"></i>
          </div>
          <div className="card-content">
            <h4>Gói Standard</h4>
            <div className="card-value">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(packageRevenueData.Standard?.revenue || 0)}
            </div>
            <div className="package-percentage">
              {packageRevenueData.Standard && packageRevenueData.totalRevenue
                ? (
                    (packageRevenueData.Standard.revenue /
                      packageRevenueData.totalRevenue) *
                    100
                  ).toFixed(1)
                : 0}
              % doanh thu | {packageRevenueData.Standard?.count || 0} giao dịch
            </div>
          </div>
        </div>

        <div className="summary-card premium-revenue">
          <div className="card-icon">
            <i className="fas fa-crown"></i>
          </div>
          <div className="card-content">
            <h4>Gói Premium</h4>
            <div className="card-value">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(packageRevenueData.Premium?.revenue || 0)}
            </div>
            <div className="package-percentage">
              {packageRevenueData.Premium && packageRevenueData.totalRevenue
                ? (
                    (packageRevenueData.Premium.revenue /
                      packageRevenueData.totalRevenue) *
                    100
                  ).toFixed(1)
                : 0}
              % doanh thu | {packageRevenueData.Premium?.count || 0} giao dịch
            </div>
          </div>
        </div>
      </div>

      {/* Điều hướng tab */}
      <div className="chart-navigation">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          <i className="fas fa-chart-line"></i> Tổng Quan
        </button>
        <button
          className={activeTab === "packages" ? "active" : ""}
          onClick={() => setActiveTab("packages")}
        >
          <i className="fas fa-boxes"></i> Phân Tích Gói Dịch Vụ
        </button>
        <button
          className={activeTab === "quarterly" ? "active" : ""}
          onClick={() => setActiveTab("quarterly")}
        >
          <i className="fas fa-calendar-alt"></i> Báo Cáo Theo Quý
        </button>
        <button
          className={activeTab === "details" ? "active" : ""}
          onClick={() => setActiveTab("details")}
        >
          <i className="fas fa-list-ul"></i> Chi Tiết Giao Dịch
        </button>
      </div>

      {/* Khu vực biểu đồ */}
      <div className="revenue-charts">
        {/* Tab Tổng Quan */}
        {activeTab === "overview" && (
          <div className="chart-panel">
            <div className="chart-row">
              <div className="chart-card">
                <h3>
                  <i className="fas fa-chart-line"></i> Biểu Đồ Doanh Thu Hàng
                  Tháng
                </h3>
                <div className="chart-area">
                  {revenueChartData ? (
                    <Line
                      data={revenueChartData}
                      options={revenueChartOptions}
                    />
                  ) : (
                    <div className="no-data-message">
                      <i className="fas fa-info-circle"></i> Không có dữ liệu
                      doanh thu để hiển thị
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="chart-row">
              <div className="chart-card half">
                <h3>
                  <i className="fas fa-chart-pie"></i> Tỷ Lệ Doanh Thu Theo Gói
                </h3>
                <div className="chart-controls">
                  <button
                    className={comparisonMetric === "revenue" ? "active" : ""}
                    onClick={() => setComparisonMetric("revenue")}
                  >
                    Doanh thu
                  </button>
                  <button
                    className={
                      comparisonMetric === "transactions" ? "active" : ""
                    }
                    onClick={() => setComparisonMetric("transactions")}
                  >
                    Số lượng
                  </button>
                </div>
                <div className="chart-area">
                  {packageComparisonPieChartData ? (
                    <Doughnut
                      data={packageComparisonPieChartData}
                      options={pieChartOptions}
                    />
                  ) : (
                    <div className="no-data-message">
                      <i className="fas fa-info-circle"></i> Không có dữ liệu để
                      hiển thị
                    </div>
                  )}
                </div>
              </div>

              <div className="chart-card half">
                <h3>
                  <i className="fas fa-funnel-dollar"></i> Thống Kê Giao Dịch
                </h3>
                <div className="stats-container">
                  <div className="stat-item">
                    <div className="stat-label">Tổng số giao dịch:</div>
                    <div className="stat-value">{statusCounts.total}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Giao dịch thành công:</div>
                    <div className="stat-value success">
                      {statusCounts.completed}
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Đang chờ thanh toán:</div>
                    <div className="stat-value pending">
                      {statusCounts.pending}
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Giao dịch thất bại:</div>
                    <div className="stat-value failed">
                      {statusCounts.failed}
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Giao dịch đã hủy:</div>
                    <div className="stat-value cancelled">
                      {statusCounts.cancelled}
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Tỷ lệ thành công:</div>
                    <div className="stat-value">
                      {statusCounts.total
                        ? (
                            (statusCounts.completed / statusCounts.total) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Phân Tích Gói Dịch Vụ */}
        {activeTab === "packages" && (
          <div className="chart-panel">
            <div className="chart-card">
              <h3>
                <i className="fas fa-boxes"></i> So Sánh Doanh Thu Theo Gói Dịch
                Vụ
              </h3>
              <div className="chart-area">
                {packageRevenueChartData ? (
                  <Line
                    data={packageRevenueChartData}
                    options={packageRevenueChartOptions}
                  />
                ) : (
                  <div className="no-data-message">
                    <i className="fas fa-info-circle"></i> Không có dữ liệu để
                    hiển thị
                  </div>
                )}
              </div>
            </div>

            <div className="chart-row">
              <div className="chart-card half">
                <h3>
                  <i className="fas fa-box"></i> Chi Tiết Gói Standard
                </h3>
                <div className="package-details">
                  <div className="package-detail-item">
                    <div className="detail-label">Tổng doanh thu:</div>
                    <div className="detail-value">
                      {formatAmount(packageRevenueData.Standard?.revenue || 0)}
                    </div>
                  </div>
                  <div className="package-detail-item">
                    <div className="detail-label">Số lượng giao dịch:</div>
                    <div className="detail-value">
                      {packageRevenueData.Standard?.count || 0}
                    </div>
                  </div>
                  <div className="package-detail-item">
                    <div className="detail-label">Đơn giá:</div>
                    <div className="detail-value">379.000 VNĐ</div>
                  </div>
                  <div className="package-detail-item">
                    <div className="detail-label">Tỷ lệ doanh thu:</div>
                    <div className="detail-value">
                      {packageRevenueData.Standard?.percentageOfTotal.toFixed(
                        1
                      ) || 0}
                      %
                    </div>
                  </div>
                </div>
              </div>

              <div className="chart-card half">
                <h3>
                  <i className="fas fa-crown"></i> Chi Tiết Gói Premium
                </h3>
                <div className="package-details">
                  <div className="package-detail-item">
                    <div className="detail-label">Tổng doanh thu:</div>
                    <div className="detail-value">
                      {formatAmount(packageRevenueData.Premium?.revenue || 0)}
                    </div>
                  </div>
                  <div className="package-detail-item">
                    <div className="detail-label">Số lượng giao dịch:</div>
                    <div className="detail-value">
                      {packageRevenueData.Premium?.count || 0}
                    </div>
                  </div>
                  <div className="package-detail-item">
                    <div className="detail-label">Đơn giá:</div>
                    <div className="detail-value">1.279.000 VNĐ</div>
                  </div>
                  <div className="package-detail-item">
                    <div className="detail-label">Tỷ lệ doanh thu:</div>
                    <div className="detail-value">
                      {packageRevenueData.Premium?.percentageOfTotal.toFixed(
                        1
                      ) || 0}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Báo Cáo Theo Quý */}
        {activeTab === "quarterly" && (
          <div className="chart-panel">
            <div className="chart-card">
              <h3>
                <i className="fas fa-calendar-alt"></i> Doanh Thu Theo Quý
              </h3>
              <div className="chart-area">
                {quarterlyRevenueChartData ? (
                  <Bar
                    data={quarterlyRevenueChartData}
                    options={quarterlyChartOptions}
                  />
                ) : (
                  <div className="no-data-message">
                    <i className="fas fa-info-circle"></i> Không có dữ liệu
                    doanh thu theo quý để hiển thị
                  </div>
                )}
              </div>
            </div>

            <div className="quarterly-summary">
              <h3>
                <i className="fas fa-list"></i> Tổng Hợp Doanh Thu Theo Quý
              </h3>

              <div className="quarterly-table-container">
                <table className="quarterly-table">
                  <thead>
                    <tr>
                      <th>Quý</th>
                      <th>Tổng Doanh Thu</th>
                      <th>Gói Standard</th>
                      <th>Gói Premium</th>
                      <th>Số Giao Dịch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quarterlyRevenueData
                      .filter((q) => q.year === new Date().getFullYear())
                      .map((quarter, index) => (
                        <tr key={index}>
                          <td>{quarter.quarter}</td>
                          <td>{formatAmount(quarter.revenue)}</td>
                          <td>{formatAmount(quarter.standardRevenue)}</td>
                          <td>{formatAmount(quarter.premiumRevenue)}</td>
                          <td>{quarter.transactionCount}</td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>
                        <strong>Tổng Cộng</strong>
                      </td>
                      <td>
                        {formatAmount(
                          quarterlyRevenueData
                            .filter((q) => q.year === new Date().getFullYear())
                            .reduce((sum, q) => sum + q.revenue, 0)
                        )}
                      </td>
                      <td>
                        {formatAmount(
                          quarterlyRevenueData
                            .filter((q) => q.year === new Date().getFullYear())
                            .reduce((sum, q) => sum + q.standardRevenue, 0)
                        )}
                      </td>
                      <td>
                        {formatAmount(
                          quarterlyRevenueData
                            .filter((q) => q.year === new Date().getFullYear())
                            .reduce((sum, q) => sum + q.premiumRevenue, 0)
                        )}
                      </td>
                      <td>
                        {quarterlyRevenueData
                          .filter((q) => q.year === new Date().getFullYear())
                          .reduce((sum, q) => sum + q.transactionCount, 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Chi Tiết Giao Dịch */}
        {activeTab === "details" && (
          <div className="chart-panel">
            <div className="chart-card detail-card">
              <h3>
                <i className="fas fa-file-invoice-dollar"></i> Chi Tiết Giao
                Dịch
              </h3>

              {/* Bộ lọc chi tiết */}
              <div className="advanced-filter">
                <div className="filter-section">
                  <div className="filter-row">
                    <label>Gói Dịch Vụ:</label>
                    <select
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value)}
                    >
                      <option value="all">Tất cả gói</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>

                  <div className="filter-row">
                    <label>Trạng Thái:</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="completed">Đã thanh toán</option>
                      <option value="pending">Đang chờ</option>
                      <option value="failed">Thất bại</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                </div>

                <div className="filter-section">
                  <div className="filter-row">
                    <label>Tên Khách Hàng:</label>
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên..."
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                      className="name-filter-input"
                    />
                  </div>
                </div>
              </div>

              {/* Hiển thị tổng số kết quả và doanh thu */}
              <div className="filter-summary">
                <div className="result-count">
                  Hiển thị {getFilteredTransactions().length} giao dịch
                </div>
                <div className="filtered-revenue">
                  Tổng doanh thu: {formatAmount(filteredTotalRevenue)}
                </div>
              </div>

              {/* Bảng giao dịch cải tiến */}
              <div className="detailed-table-container">
                <table className="detailed-table">
                  <thead>
                    <tr>
                      <th>ID Giao Dịch</th>
                      <th>Khách Hàng</th>
                      <th>Gói</th>
                      <th>Số Tiền</th>
                      <th>Phương Thức</th>
                      <th>Ngày Giao Dịch</th>
                      <th>Ngày Thanh Toán</th>
                      <th>Trạng Thái</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredTransactions().length > 0 ? (
                      paginateTransactions(getFilteredTransactions()).map(
                        (transaction, index) => (
                          <tr key={index}>
                            <td>{transaction.gatewayTransactionId || "N/A"}</td>
                            <td>{transaction.fullName}</td>
                            <td>
                              {renderPackageBadge(transaction.packageName)}
                            </td>
                            <td>
                              {formatAmount(
                                transaction.amount,
                                transaction.currency || "VND"
                              )}
                            </td>
                            <td>{transaction.paymentMethod || "N/A"}</td>
                            <td>{formatDate(transaction.transactionDate)}</td>
                            <td>{formatDate(transaction.paymentDate)}</td>
                            <td>
                              {renderPaymentStatus(transaction.paymentStatus)}
                            </td>
                            <td>
                              <button
                                className="view-detail-btn"
                                onClick={() =>
                                  openTransactionDetail(transaction)
                                }
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                            </td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td colSpan="9" className="no-data">
                          <i className="fas fa-info-circle"></i> Không có dữ
                          liệu giao dịch phù hợp với tiêu chí lọc
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Phân trang */}
              {getFilteredTransactions().length > 0 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(1)}
                  >
                    <i className="fas fa-angle-double-left"></i>
                  </button>
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    <i className="fas fa-angle-left"></i>
                  </button>

                  <span className="pagination-info">
                    Trang {currentPage} / {totalPages}
                  </span>

                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    <i className="fas fa-angle-right"></i>
                  </button>
                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(totalPages)}
                  >
                    <i className="fas fa-angle-double-right"></i>
                  </button>

                  <select
                    className="items-per-page"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={5}>5 / trang</option>
                    <option value={10}>10 / trang</option>
                    <option value={20}>20 / trang</option>
                    <option value={50}>50 / trang</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal chi tiết giao dịch */}
      {showTransactionDetail && selectedTransaction && (
        <div className="transaction-detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <i className="fas fa-file-invoice"></i> Chi Tiết Giao Dịch
              </h3>
              <button className="close-modal" onClick={closeTransactionDetail}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="transaction-detail-info">
                <div className="detail-row">
                  <div className="detail-label">ID Giao dịch:</div>
                  <div className="detail-value">
                    {selectedTransaction.gatewayTransactionId || "N/A"}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Khách hàng:</div>
                  <div className="detail-value">
                    {selectedTransaction.fullName}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Gói dịch vụ:</div>
                  <div className="detail-value">
                    {renderPackageBadge(selectedTransaction.packageName)}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Số tiền:</div>
                  <div className="detail-value">
                    {formatAmount(
                      selectedTransaction.amount,
                      selectedTransaction.currency || "VND"
                    )}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Loại giao dịch:</div>
                  <div className="detail-value">
                    {selectedTransaction.transactionType || "N/A"}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Phương thức thanh toán:</div>
                  <div className="detail-value">
                    {selectedTransaction.paymentMethod || "N/A"}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Ngày giao dịch:</div>
                  <div className="detail-value">
                    {formatDate(selectedTransaction.transactionDate)}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Ngày thanh toán:</div>
                  <div className="detail-value">
                    {formatDate(selectedTransaction.paymentDate)}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Trạng thái:</div>
                  <div className="detail-value">
                    {renderPaymentStatus(selectedTransaction.paymentStatus)}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn" onClick={closeTransactionDetail}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
