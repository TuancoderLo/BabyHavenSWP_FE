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
import axios from "axios";

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
  const [statusFilter, setStatusFilter] = useState("completed"); // Mặc định hiển thị giao dịch thành công
  const [searchQuery, setSearchQuery] = useState(""); // Thay thế nameFilter và emailFilter
  const [selectedTransaction, setSelectedTransaction] = useState(null); // Giao dịch được chọn để xem chi tiết
  const [showTransactionDetail, setShowTransactionDetail] = useState(false); // Hiển thị modal chi tiết giao dịch
  const [comparisonMetric, setComparisonMetric] = useState("revenue"); // Tiêu chí so sánh: revenue, transactions

  // Paging
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [userAccountDetail, setUserAccountDetail] = useState(null); // Thêm state lưu thông tin chi tiết tài khoản người dùng
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false); // State loading khi đang lấy thông tin chi tiết

  // Thêm lại state timeFrame
  const [startDate, setStartDate] = useState(null); // Ngày bắt đầu lọc
  const [endDate, setEndDate] = useState(null); // Ngày kết thúc lọc
  const [timeFrame, setTimeFrame] = useState("all"); // Khung thời gian: all, today, yesterday, thisWeek, thisMonth, thisQuarter, thisYear

  // Lấy danh sách các năm có dữ liệu từ quarterlyRevenueData
  const getAvailableYears = () => {
    if (!quarterlyRevenueData || quarterlyRevenueData.length === 0) {
      return [new Date().getFullYear()];
    }

    const years = [...new Set(quarterlyRevenueData.map((q) => q.year))];
    return years.sort((a, b) => b - a); // Sắp xếp giảm dần (năm mới nhất trước)
  };

  // Giới hạn số năm hiển thị trong bảng
  const getDefaultYear = () => {
    const years = getAvailableYears();
    return years.length > 0
      ? years[0].toString()
      : new Date().getFullYear().toString();
  };

  // Cập nhật state selectedYear
  const [selectedYear, setSelectedYear] = useState("current");

  // Cập nhật selectedYear khi có dữ liệu
  useEffect(() => {
    if (quarterlyRevenueData && quarterlyRevenueData.length > 0) {
      setSelectedYear(getDefaultYear());
    }
  }, [quarterlyRevenueData]);

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

  // Tính toán doanh thu theo quý - Cập nhật để hỗ trợ hiển thị đa năm
  const calculateRevenueByQuarter = (transactions) => {
    // Tìm năm bắt đầu và năm kết thúc từ dữ liệu giao dịch
    const years = {};

    // Nếu không có dữ liệu giao dịch, trả về một mảng trống
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Duyệt qua tất cả giao dịch để xác định các năm có dữ liệu
    transactions.forEach((transaction) => {
      if (transaction.transactionDate) {
        const transactionDate = new Date(transaction.transactionDate);
        const year = transactionDate.getFullYear();
        years[year] = true;
      }
    });

    // Lấy danh sách các năm có dữ liệu, sắp xếp tăng dần
    const yearsList = Object.keys(years)
      .map((year) => parseInt(year))
      .sort();

    // Nếu không có năm nào, thêm năm hiện tại
    if (yearsList.length === 0) {
      yearsList.push(new Date().getFullYear());
    }

    // Danh sách các quý của tất cả các năm
    const quarters = [];

    // Tạo dữ liệu cho 4 quý của mỗi năm
    yearsList.forEach((year) => {
      for (let i = 1; i <= 4; i++) {
        quarters.push({
          quarter: `Q${i}/${year}`,
          year: year,
          quarterNumber: i,
          revenue: 0,
          standardRevenue: 0,
          premiumRevenue: 0,
          transactionCount: 0,
        });
      }
    });

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

    // Sắp xếp các quý theo năm và số thứ tự quý (từ gần đến xa)
    return quarters.sort((a, b) =>
      a.year !== b.year ? b.year - a.year : a.quarterNumber - b.quarterNumber
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

    // Nếu không có dữ liệu năm hiện tại, lấy năm gần nhất có dữ liệu
    let quartersToDisplay = currentYearQuarters;
    if (currentYearQuarters.length === 0) {
      // Tìm năm gần nhất có dữ liệu
      const years = [...new Set(quarterlyRevenueData.map((q) => q.year))].sort(
        (a, b) => b - a
      );
      if (years.length > 0) {
        const nearestYear = years[0];
        quartersToDisplay = quarterlyRevenueData.filter(
          (q) => q.year === nearestYear
        );
      }
    }

    // Sắp xếp theo thứ tự quý
    quartersToDisplay.sort((a, b) => a.quarterNumber - b.quarterNumber);

    const labels = quartersToDisplay.map((item) => item.quarter);
    const standardData = quartersToDisplay.map((item) => item.standardRevenue);
    const premiumData = quartersToDisplay.map((item) => item.premiumRevenue);

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

  // Lọc giao dịch theo các tiêu chí - Dùng cho tất cả các tab trừ tab Báo cáo theo Quý
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

    // Lọc theo tên hoặc email (gộp lại)
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (t) =>
          (t.fullName &&
            t.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (t.email && t.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Lọc theo thời gian
    if (startDate) {
      filtered = filtered.filter((t) => {
        if (!t.transactionDate) return false;
        const date = new Date(t.transactionDate);
        return date >= startDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter((t) => {
        if (!t.transactionDate) return false;
        const date = new Date(t.transactionDate);
        return date <= endDate;
      });
    }

    // Sắp xếp giao dịch mới nhất lên đầu
    filtered.sort(
      (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
    );

    return filtered;
  };

  // Lọc dữ liệu quý theo năm được chọn - CHỈ dùng cho tab Báo cáo theo Quý
  const getFilteredQuarterlyData = () => {
    // Chỉ hiển thị dữ liệu của năm đã chọn, không bị ảnh hưởng bởi bộ lọc thời gian khác
    return quarterlyRevenueData.filter(
      (quarter) => quarter.year === parseInt(selectedYear)
    );
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

  // Hàm lấy thông tin chi tiết người dùng từ API
  const fetchUserAccountDetail = async (email) => {
    if (!email) return null;

    setIsLoadingUserDetail(true);
    try {
      const response = await axios.get(
        "https://babyhaven-swp-web-emhrccb7hfh7bkf5.southeastasia-01.azurewebsites.net/api/UserAccounts/odata"
      );

      if (response.data && Array.isArray(response.data)) {
        // Tìm người dùng theo email
        const userDetail = response.data.find(
          (user) => user.email.toLowerCase() === email.toLowerCase()
        );

        setUserAccountDetail(userDetail || null);
      } else {
        setUserAccountDetail(null);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setUserAccountDetail(null);
    } finally {
      setIsLoadingUserDetail(false);
    }
  };

  // Mở modal xem chi tiết giao dịch - Cập nhật để gọi API lấy thông tin người dùng
  const openTransactionDetail = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);

    // Chỉ khi mở modal mới gọi API lấy thông tin người dùng
    if (transaction && transaction.email) {
      fetchUserAccountDetail(transaction.email);
    } else {
      setUserAccountDetail(null);
    }
  };

  // Đóng modal chi tiết và reset thông tin người dùng
  const closeTransactionDetail = () => {
    setSelectedTransaction(null);
    setShowTransactionDetail(false);
    setUserAccountDetail(null); // Reset thông tin người dùng khi đóng modal
  };

  // Hàm lấy ngày giao dịch đầu tiên của người dùng (thời điểm bắt đầu sử dụng dịch vụ)
  const getUserFirstTransaction = (userId) => {
    if (!userId) return null;

    const userTransactions = transactions.filter((t) => t.userId === userId);
    if (!userTransactions.length) return null;

    // Sắp xếp theo ngày tăng dần để lấy giao dịch đầu tiên
    userTransactions.sort(
      (a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)
    );

    return userTransactions[0].transactionDate;
  };

  // Hàm lấy danh sách tất cả giao dịch của người dùng
  const getUserTransactions = (userId) => {
    if (!userId) return [];
    return transactions.filter((t) => t.userId === userId);
  };

  // Hàm tính tổng số tiền người dùng đã chi tiêu (chỉ tính giao dịch thành công)
  const calculateUserTotalSpent = (userId) => {
    if (!userId) return 0;

    return getUserTransactions(userId)
      .filter((t) => t.paymentStatus === "Completed")
      .reduce((total, t) => total + (t.amount || 0), 0);
  };

  // Hàm tính tỷ lệ thành công trong các giao dịch của người dùng
  const calculateUserSuccessRate = (userId) => {
    const userTransactions = getUserTransactions(userId);
    if (!userTransactions.length) return 0;

    const successfulTransactions = userTransactions.filter(
      (t) => t.paymentStatus === "Completed"
    );
    return Math.round(
      (successfulTransactions.length / userTransactions.length) * 100
    );
  };

  // Hàm lấy danh sách các gói dịch vụ đã mua
  const getUserPackageHistory = (userId) => {
    if (!userId) return [];

    const userTransactions = getUserTransactions(userId);

    // Chỉ hiển thị giao dịch thành công và sắp xếp theo ngày giao dịch gần nhất
    return userTransactions
      .filter((t) => t.paymentStatus.toLowerCase() === "completed")
      .sort(
        (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
      );
  };

  // Hàm lấy các giao dịch gần đây nhất của người dùng
  const getUserRecentTransactions = (userId, limit = 5) => {
    const userTransactions = getUserTransactions(userId);

    // Chỉ lấy giao dịch thành công
    return userTransactions
      .filter((t) => t.paymentStatus.toLowerCase() === "completed")
      .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
      .slice(0, limit);
  };

  // Hàm lấy danh sách tất cả giao dịch của người dùng trong quý hiện tại
  const getUserTransactionsForCurrentQuarter = (userId) => {
    if (!userId) return [];

    // Lấy tất cả giao dịch của người dùng
    const userTxs = transactions.filter((t) => t.userId === userId);

    // Lấy quý hiện tại
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const currentYear = now.getFullYear();

    // Lọc giao dịch thành công trong quý hiện tại
    const quarterTransactions = userTxs.filter((t) => {
      if (t.paymentStatus.toLowerCase() !== "completed") return false;

      const txDate = new Date(t.transactionDate);
      const txQuarter = Math.floor(txDate.getMonth() / 3);
      const txYear = txDate.getFullYear();

      return txQuarter === currentQuarter && txYear === currentYear;
    });

    // Sắp xếp giao dịch mới nhất lên đầu
    return quarterTransactions.sort(
      (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
    );
  };

  // Hàm thống kê gói dịch vụ đã mua
  const getUserPackageStats = (userId) => {
    const userTransactions = getUserTransactions(userId);
    if (!userTransactions.length) return [];

    // Nhóm theo tên gói
    const packageStats = {};

    userTransactions.forEach((transaction) => {
      const packageName = transaction.packageName;

      if (!packageStats[packageName]) {
        packageStats[packageName] = {
          packageName,
          count: 0,
          total: 0,
          successful: 0,
        };
      }

      packageStats[packageName].count++;

      if (transaction.paymentStatus === "Completed") {
        packageStats[packageName].total += transaction.amount || 0;
        packageStats[packageName].successful++;
      }
    });

    return Object.values(packageStats);
  };

  // Hàm chuẩn bị dữ liệu cho biểu đồ chi tiêu theo thời gian
  const prepareUserSpendingChartData = (userId) => {
    const userTransactions = getUserTransactions(userId);
    if (!userTransactions.length) return null;

    // Chỉ lấy các giao dịch thành công
    const completedTransactions = userTransactions.filter(
      (t) => t.paymentStatus === "Completed"
    );
    if (!completedTransactions.length) return null;

    // Nhóm các giao dịch theo tháng
    const spendingByMonth = {};

    // Sắp xếp giao dịch theo ngày
    completedTransactions.sort(
      (a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)
    );

    // Lấy tháng đầu tiên và tháng cuối cùng
    const firstDate = new Date(completedTransactions[0].transactionDate);
    const lastDate = new Date(
      completedTransactions[completedTransactions.length - 1].transactionDate
    );

    // Tạo mảng các tháng từ tháng đầu đến tháng cuối
    const months = [];
    let currentDate = new Date(
      firstDate.getFullYear(),
      firstDate.getMonth(),
      1
    );

    while (currentDate <= lastDate) {
      const monthKey = `${
        currentDate.getMonth() + 1
      }/${currentDate.getFullYear()}`;
      months.push(monthKey);
      spendingByMonth[monthKey] = 0;

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Tính tổng chi tiêu cho mỗi tháng
    completedTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.transactionDate);
      const monthKey = `${
        transactionDate.getMonth() + 1
      }/${transactionDate.getFullYear()}`;

      if (spendingByMonth[monthKey] !== undefined) {
        spendingByMonth[monthKey] += transaction.amount || 0;
      }
    });

    // Chuyển đổi dữ liệu cho biểu đồ
    const labels = months;
    const data = months.map((month) => spendingByMonth[month]);

    return {
      labels,
      datasets: [
        {
          label: "Chi Tiêu",
          data,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  // Hàm chuẩn bị dữ liệu biểu đồ phân bổ gói dịch vụ
  const prepareUserPackageDistributionChart = (userId) => {
    const packageStats = getUserPackageStats(userId);
    if (!packageStats.length) return null;

    const labels = packageStats.map((stat) => stat.packageName);
    const data = packageStats.map((stat) => stat.successful);

    // Màu sắc dựa trên tên gói
    const backgroundColor = packageStats.map((stat) =>
      stat.packageName === "Premium"
        ? "rgba(153, 102, 255, 0.8)"
        : "rgba(75, 192, 192, 0.8)"
    );

    const borderColor = packageStats.map((stat) =>
      stat.packageName === "Premium"
        ? "rgba(153, 102, 255, 1)"
        : "rgba(75, 192, 192, 1)"
    );

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor,
          borderWidth: 1,
        },
      ],
    };
  };

  // Thay thế đoạn code renderCharts() lỗi bằng cấu hình biểu đồ tròn trực tiếp
  const renderDashboard = () => {
    return (
      <div className="chart-panel">
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
                className={comparisonMetric === "transactions" ? "active" : ""}
                onClick={() => setComparisonMetric("transactions")}
              >
                Số lượng
              </button>
            </div>
            <div className="chart-area">
              {packageComparisonPieChartData ? (
                <div className="pie-chart-container">
                  <Doughnut
                    data={packageComparisonPieChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: "65%",
                      plugins: {
                        legend: {
                          position: "bottom",
                          align: "center",
                          labels: {
                            padding: 20,
                            boxWidth: 15,
                            font: {
                              size: 13,
                            },
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              const value = context.raw;
                              const total = context.dataset.data.reduce(
                                (a, b) => a + b,
                                0
                              );
                              const percentage = Math.round(
                                (value / total) * 100
                              );
                              return `${context.label}: ${formatAmount(
                                value
                              )} (${percentage}%)`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="no-data-message">
                  <i className="fas fa-info-circle"></i> Không có dữ liệu để
                  hiển thị
                </div>
              )}
            </div>
          </div>

          {/* Giữ nguyên phần code cho thẻ còn lại */}
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
                <div className="stat-value pending">{statusCounts.pending}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Giao dịch thất bại:</div>
                <div className="stat-value failed">{statusCounts.failed}</div>
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
    );
  };

  // Tính toán doanh thu theo gói CÓ áp dụng bộ lọc thời gian
  const calculateFilteredRevenueByPackage = () => {
    // Lấy các giao dịch đã được lọc theo thời gian và trạng thái
    const filteredTransactions = getFilteredTransactions().filter(
      (t) => t.paymentStatus.toLowerCase() === "completed"
    );

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

    filteredTransactions.forEach((transaction) => {
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

  // Thêm hàm mới để chuẩn bị dữ liệu biểu đồ theo quý - không bị ảnh hưởng bởi bộ lọc thời gian
  const prepareQuarterlyChartDataForSelectedYear = () => {
    if (!quarterlyRevenueData.length) return null;

    // Lọc theo năm đã chọn
    const yearQuarters = getFilteredQuarterlyData();

    // Sắp xếp theo thứ tự quý
    yearQuarters.sort((a, b) => a.quarterNumber - b.quarterNumber);

    const labels = yearQuarters.map((item) => item.quarter);
    const standardData = yearQuarters.map((item) => item.standardRevenue);
    const premiumData = yearQuarters.map((item) => item.premiumRevenue);

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

      {/* Card summaries - Cập nhật để sử dụng dữ liệu đã lọc */}
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

        {/* Sử dụng dữ liệu đã lọc theo thời gian */}
        {(() => {
          const filteredPackageData = calculateFilteredRevenueByPackage();
          return (
            <>
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
                    }).format(filteredPackageData.Standard?.revenue || 0)}
                  </div>
                  <div className="package-percentage">
                    {filteredPackageData.Standard &&
                    filteredPackageData.totalRevenue > 0
                      ? (
                          (filteredPackageData.Standard.revenue /
                            filteredPackageData.totalRevenue) *
                          100
                        ).toFixed(1)
                      : "0"}
                    % doanh thu | {filteredPackageData.Standard?.count || 0}{" "}
                    giao dịch
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
                    }).format(filteredPackageData.Premium?.revenue || 0)}
                  </div>
                  <div className="package-percentage">
                    {filteredPackageData.Premium &&
                    filteredPackageData.totalRevenue > 0
                      ? (
                          (filteredPackageData.Premium.revenue /
                            filteredPackageData.totalRevenue) *
                          100
                        ).toFixed(1)
                      : "0"}
                    % doanh thu | {filteredPackageData.Premium?.count || 0} giao
                    dịch
                  </div>
                </div>
              </div>
            </>
          );
        })()}
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
            <div className="chart-card full-width">
              <h3>
                <i className="fas fa-chart-line"></i> Biểu Đồ Doanh Thu Hàng
                Tháng
              </h3>
              <div className="chart-area">
                {revenueChartData ? (
                  <Line data={revenueChartData} options={revenueChartOptions} />
                ) : (
                  <div className="no-data-message">
                    <i className="fas fa-info-circle"></i> Không có dữ liệu
                    doanh thu để hiển thị
                  </div>
                )}
              </div>
            </div>

            <div className="chart-row">{renderDashboard()}</div>
          </div>
        )}

        {/* Tab Phân Tích Gói Dịch Vụ */}
        {activeTab === "packages" && (
          <div className="chart-panel">
            <div className="chart-card full-width">
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
              {(() => {
                const filteredPackageData = calculateFilteredRevenueByPackage();
                return (
                  <>
                    <div className="chart-card half">
                      <h3>
                        <i className="fas fa-box"></i> Chi Tiết Gói Standard
                      </h3>
                      <div className="package-details">
                        <div className="package-detail-item">
                          <div className="detail-label">Tổng doanh thu:</div>
                          <div className="detail-value">
                            {formatAmount(
                              filteredPackageData.Standard?.revenue || 0
                            )}
                          </div>
                        </div>
                        <div className="package-detail-item">
                          <div className="detail-label">
                            Số lượng giao dịch:
                          </div>
                          <div className="detail-value">
                            {filteredPackageData.Standard?.count || 0}
                          </div>
                        </div>
                        <div className="package-detail-item">
                          <div className="detail-label">Đơn giá:</div>
                          <div className="detail-value">379.000 VNĐ</div>
                        </div>
                        <div className="package-detail-item">
                          <div className="detail-label">Tỷ lệ doanh thu:</div>
                          <div className="detail-value">
                            {filteredPackageData.Standard?.percentageOfTotal.toFixed(
                              1
                            ) || "0"}
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
                            {formatAmount(
                              filteredPackageData.Premium?.revenue || 0
                            )}
                          </div>
                        </div>
                        <div className="package-detail-item">
                          <div className="detail-label">
                            Số lượng giao dịch:
                          </div>
                          <div className="detail-value">
                            {filteredPackageData.Premium?.count || 0}
                          </div>
                        </div>
                        <div className="package-detail-item">
                          <div className="detail-label">Đơn giá:</div>
                          <div className="detail-value">1.279.000 VNĐ</div>
                        </div>
                        <div className="package-detail-item">
                          <div className="detail-label">Tỷ lệ doanh thu:</div>
                          <div className="detail-value">
                            {filteredPackageData.Premium?.percentageOfTotal.toFixed(
                              1
                            ) || "0"}
                            %
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab Báo Cáo Theo Quý */}
        {activeTab === "quarterly" && (
          <div className="chart-panel">
            <div className="chart-card full-width">
              <h3>
                <i className="fas fa-calendar-alt"></i> Doanh Thu Theo Quý
              </h3>
              {/* Dropdown chọn năm cho báo cáo theo quý */}
              <div
                className="year-selector"
                style={{
                  marginBottom: "15px",
                  display: "flex",
                  alignItems: "center",
                  background: "#f8f9fa",
                  padding: "8px 15px",
                  borderRadius: "6px",
                }}
              >
                <label
                  htmlFor="yearSelect"
                  style={{ marginRight: "10px", fontWeight: "500" }}
                >
                  <i
                    className="fas fa-calendar-year"
                    style={{ marginRight: "5px" }}
                  ></i>
                  Chọn năm:
                </label>
                <select
                  id="yearSelect"
                  className="year-dropdown"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    backgroundColor: "#fff",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  {getAvailableYears().map((year) => (
                    <option key={year} value={year}>
                      Năm {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="chart-area">
                {getFilteredQuarterlyData().length > 0 ? (
                  <Bar
                    data={prepareQuarterlyChartDataForSelectedYear()}
                    options={quarterlyChartOptions}
                  />
                ) : (
                  <div className="no-data-message">
                    <i className="fas fa-info-circle"></i> Không có dữ liệu
                    doanh thu theo quý để hiển thị cho năm {selectedYear}
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
                    {getFilteredQuarterlyData().length > 0 ? (
                      getFilteredQuarterlyData().map((quarter, index) => (
                        <tr key={index}>
                          <td>{quarter.quarter}</td>
                          <td>{formatAmount(quarter.revenue)}</td>
                          <td>{formatAmount(quarter.standardRevenue)}</td>
                          <td>{formatAmount(quarter.premiumRevenue)}</td>
                          <td>{quarter.transactionCount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="no-data-message">
                          <i className="fas fa-info-circle"></i> Không có dữ
                          liệu cho năm {selectedYear}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>
                        <strong>Tổng Cộng</strong>
                      </td>
                      <td>
                        {formatAmount(
                          getFilteredQuarterlyData().reduce(
                            (sum, q) => sum + q.revenue,
                            0
                          )
                        )}
                      </td>
                      <td>
                        {formatAmount(
                          getFilteredQuarterlyData().reduce(
                            (sum, q) => sum + q.standardRevenue,
                            0
                          )
                        )}
                      </td>
                      <td>
                        {formatAmount(
                          getFilteredQuarterlyData().reduce(
                            (sum, q) => sum + q.premiumRevenue,
                            0
                          )
                        )}
                      </td>
                      <td>
                        {getFilteredQuarterlyData().reduce(
                          (sum, q) => sum + q.transactionCount,
                          0
                        )}
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
                    <label>Tìm kiếm:</label>
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên hoặc email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-filter-input"
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
                      <th>Chi Tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginateTransactions(getFilteredTransactions()).length >
                    0 ? (
                      paginateTransactions(getFilteredTransactions()).map(
                        (transaction, index) => (
                          <tr key={index}>
                            <td>{transaction.gatewayTransactionId || "N/A"}</td>
                            <td>
                              {transaction.fullName || "Chưa có tên"}
                              {transaction.email && (
                                <div
                                  style={{ fontSize: "0.85em", color: "#666" }}
                                >
                                  {transaction.email}
                                </div>
                              )}
                            </td>
                            <td>
                              {renderPackageBadge(transaction.packageName)}
                            </td>
                            <td className="amount-value">
                              {formatAmount(transaction.amount)}
                            </td>
                            <td>
                              {transaction.paymentMethod || "Không xác định"}
                            </td>
                            <td>{formatDate(transaction.transactionDate)}</td>
                            <td>
                              {transaction.paymentDate
                                ? formatDate(transaction.paymentDate)
                                : "Chưa thanh toán"}
                            </td>
                            <td>
                              {renderPaymentStatus(transaction.paymentStatus)}
                            </td>
                            <td>
                              <button
                                className="view-detail-btn"
                                title="Xem chi tiết"
                                onClick={() =>
                                  openTransactionDetail(transaction)
                                }
                              >
                                <i className="fas fa-info-circle"></i>
                              </button>
                            </td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td colSpan="9" className="no-data">
                          <i className="fas fa-info-circle"></i> Không có dữ
                          liệu giao dịch
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
                <i className="fas fa-user-circle"></i> Thông Tin Chi Tiết Khách
                Hàng
              </h3>
              <button className="close-modal" onClick={closeTransactionDetail}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              {/* Thông tin cơ bản của khách hàng */}
              <div className="user-profile-section">
                <div className="user-basic-info">
                  <div className="user-name">
                    <h4>{selectedTransaction.fullName}</h4>
                    <span className="user-since">
                      Khách hàng từ:{" "}
                      {formatDate(
                        getUserFirstTransaction(selectedTransaction.userId)
                      )}
                    </span>
                  </div>
                  <div className="user-contact">
                    <p>
                      <i className="fas fa-envelope"></i>{" "}
                      {selectedTransaction.email || "Không có thông tin email"}
                    </p>
                    {isLoadingUserDetail ? (
                      <div className="loading-user-details">
                        <div className="spinner"></div>
                        <span>Đang tải thông tin chi tiết...</span>
                      </div>
                    ) : userAccountDetail ? (
                      <>
                        <p>
                          <i className="fas fa-phone"></i>{" "}
                          {userAccountDetail.phoneNumber ||
                            "Không có số điện thoại"}
                        </p>
                        <p>
                          <i className="fas fa-birthday-cake"></i>{" "}
                          {userAccountDetail.dateOfBirth
                            ? formatDate(userAccountDetail.dateOfBirth).split(
                                " "
                              )[0]
                            : "Không có ngày sinh"}
                        </p>
                        <p>
                          <i className="fas fa-venus-mars"></i>{" "}
                          {userAccountDetail.gender === "Male"
                            ? "Nam"
                            : userAccountDetail.gender === "Female"
                            ? "Nữ"
                            : "Không xác định"}
                        </p>
                        <p>
                          <i className="fas fa-map-marker-alt"></i>{" "}
                          {userAccountDetail.address || "Không có địa chỉ"}
                        </p>
                        <p>
                          <i className="fas fa-user-tag"></i>{" "}
                          {userAccountDetail.roleName || "Không có vai trò"}
                        </p>
                        <p>
                          <i className="fas fa-shield-alt"></i>{" "}
                          {userAccountDetail.status || "Không xác định"}
                        </p>
                      </>
                    ) : (
                      <p>
                        <i className="fas fa-exclamation-circle"></i> Không tìm
                        thấy thông tin chi tiết người dùng
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tổng hợp và thống kê */}
              <div className="user-stats-section">
                <div className="stats-cards">
                  <div className="user-stat-card total-spent">
                    <div className="stat-icon">
                      <i className="fas fa-money-bill-wave"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-title">Tổng Chi Tiêu</div>
                      <div className="stat-value">
                        {formatAmount(
                          calculateUserTotalSpent(selectedTransaction.userId)
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="user-stat-card total-transactions">
                    <div className="stat-icon">
                      <i className="fas fa-shopping-cart"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-title">Tổng Giao Dịch</div>
                      <div className="stat-value">
                        {getUserTransactions(selectedTransaction.userId).length}
                      </div>
                    </div>
                  </div>

                  <div className="user-stat-card success-rate">
                    <div className="stat-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-title">Tỷ Lệ Thành Công</div>
                      <div className="stat-value">
                        {calculateUserSuccessRate(selectedTransaction.userId)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lịch sử gói dịch vụ đã mua */}
              <div className="purchase-history-section">
                <h4>
                  <i className="fas fa-history"></i> Lịch Sử Mua Gói Dịch Vụ
                </h4>
                <div className="package-history-container">
                  <table className="package-history-table">
                    <thead>
                      <tr>
                        <th>Gói Dịch Vụ</th>
                        <th>Ngày Mua</th>
                        <th>Số Tiền</th>
                        <th>Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getUserPackageHistory(selectedTransaction.userId).map(
                        (transaction, index) => (
                          <tr key={index}>
                            <td>
                              {renderPackageBadge(transaction.packageName)}
                            </td>
                            <td>{formatDate(transaction.transactionDate)}</td>
                            <td>{formatAmount(transaction.amount)}</td>
                            <td>
                              {renderPaymentStatus(transaction.paymentStatus)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Biểu đồ chi tiêu theo thời gian */}
              <div className="user-spending-chart">
                <h4>
                  <i className="fas fa-chart-line"></i> Biểu Đồ Chi Tiêu Theo
                  Thời Gian
                </h4>
                <div className="chart-area user-chart">
                  {/* Biểu đồ chi tiêu được render tại đây */}
                  {prepareUserSpendingChartData(selectedTransaction.userId) ? (
                    <Line
                      data={prepareUserSpendingChartData(
                        selectedTransaction.userId
                      )}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: "Chi Tiêu Theo Thời Gian",
                            font: {
                              size: 14,
                              weight: "bold",
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
                        layout: {
                          padding: {
                            left: 10,
                            right: 10,
                            top: 20,
                            bottom: 10,
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="no-data-message">
                      <i className="fas fa-info-circle"></i> Không đủ dữ liệu để
                      hiển thị biểu đồ
                    </div>
                  )}
                </div>
              </div>

              {/* Phân tích gói dịch vụ */}
              <div className="package-analysis-section">
                <h4>
                  <i className="fas fa-boxes"></i> Phân Tích Gói Dịch Vụ
                </h4>
                <div className="package-stats">
                  <div className="package-donut-chart">
                    {prepareUserPackageDistributionChart(
                      selectedTransaction.userId
                    ) ? (
                      <Doughnut
                        data={prepareUserPackageDistributionChart(
                          selectedTransaction.userId
                        )}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          cutout: "60%",
                          plugins: {
                            legend: {
                              position: "right",
                              align: "center",
                              labels: {
                                padding: 15,
                                boxWidth: 12,
                                font: {
                                  size: 12,
                                },
                              },
                            },
                            title: {
                              display: true,
                              text: "Phân Bổ Gói Dịch Vụ",
                              font: {
                                size: 14,
                                weight: "bold",
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  const value = context.raw;
                                  const total = context.dataset.data.reduce(
                                    (a, b) => a + b,
                                    0
                                  );
                                  const percentage = Math.round(
                                    (value / total) * 100
                                  );
                                  return `${context.label}: ${value} gói (${percentage}%)`;
                                },
                              },
                            },
                          },
                          layout: {
                            padding: {
                              left: 5,
                              right: 5,
                              top: 5,
                              bottom: 5,
                            },
                          },
                        }}
                      />
                    ) : (
                      <div className="no-data-message">
                        <i className="fas fa-info-circle"></i> Không đủ dữ liệu
                      </div>
                    )}
                  </div>
                  <div className="package-stats-details">
                    {getUserPackageStats(selectedTransaction.userId).map(
                      (stat, index) => (
                        <div key={index} className="package-stat-item">
                          <div className="package-icon">
                            <i
                              className={
                                stat.packageName === "Premium"
                                  ? "fas fa-crown"
                                  : "fas fa-box"
                              }
                            ></i>
                          </div>
                          <div className="package-stat-content">
                            <h5>{stat.packageName}</h5>
                            <div className="package-stat-values">
                              <div className="package-count">
                                <span>{stat.count}</span> gói
                              </div>
                              <div className="package-total">
                                {formatAmount(stat.total)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Giao dịch gần đây */}
              <div className="recent-transactions-section">
                <h4>
                  <i className="fas fa-clock"></i> Giao Dịch Gần Đây
                </h4>
                <div className="recent-transactions-container">
                  <table className="recent-transactions-table">
                    <thead>
                      <tr>
                        <th>ID Giao Dịch</th>
                        <th>Gói</th>
                        <th>Ngày Giao Dịch</th>
                        <th>Số Tiền</th>
                        <th>Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getUserRecentTransactions(
                        selectedTransaction.userId,
                        5
                      ).map((transaction, index) => (
                        <tr key={index}>
                          <td>{transaction.gatewayTransactionId || "N/A"}</td>
                          <td>{renderPackageBadge(transaction.packageName)}</td>
                          <td>{formatDate(transaction.transactionDate)}</td>
                          <td>{formatAmount(transaction.amount)}</td>
                          <td>
                            {renderPaymentStatus(transaction.paymentStatus)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Giao dịch thành công trong quý hiện tại */}
              <div className="recent-transactions-section">
                <h4>
                  <i className="fas fa-chart-line"></i> Giao Dịch Thành Công
                  Trong Quý Hiện Tại
                </h4>
                <div className="recent-transactions-container">
                  <table className="recent-transactions-table">
                    <thead>
                      <tr>
                        <th>ID Giao Dịch</th>
                        <th>Gói</th>
                        <th>Ngày Giao Dịch</th>
                        <th>Số Tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getUserTransactionsForCurrentQuarter(
                        selectedTransaction.userId
                      ).length > 0 ? (
                        getUserTransactionsForCurrentQuarter(
                          selectedTransaction.userId
                        ).map((transaction, index) => (
                          <tr key={index}>
                            <td>{transaction.gatewayTransactionId || "N/A"}</td>
                            <td>
                              {renderPackageBadge(transaction.packageName)}
                            </td>
                            <td>{formatDate(transaction.transactionDate)}</td>
                            <td>{formatAmount(transaction.amount)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="no-data-message">
                            <i className="fas fa-info-circle"></i> Không có giao
                            dịch thành công nào trong quý này
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-btn primary"
                onClick={closeTransactionDetail}
              >
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
