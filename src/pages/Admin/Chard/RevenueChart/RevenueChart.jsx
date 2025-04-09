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
import userAccountsApi from "../../../../services/userAccountsApi";

// Configure axios to handle CORS errors
const axiosInstance = axios.create({
  baseURL:
    "https://babyhaven-swp-web-emhrccb7hfh7bkf5.southeastasia-01.azurewebsites.net",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Interceptor to add CORS headers to each request
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers["Access-Control-Allow-Origin"] = "*";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Register necessary components for Chart.js
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
  const [statusFilter, setStatusFilter] = useState("completed"); // Default to display successful transactions
  const [searchQuery, setSearchQuery] = useState(""); // Replace nameFilter and emailFilter
  const [selectedTransaction, setSelectedTransaction] = useState(null); // Selected transaction for details view
  const [showTransactionDetail, setShowTransactionDetail] = useState(false); // Show transaction detail modal
  const [comparisonMetric, setComparisonMetric] = useState("revenue"); // Comparison metric: revenue, transactions

  // Add state for quarterly data
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [showQuarterDetail, setShowQuarterDetail] = useState(false);

  // Paging
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [userAccountDetail, setUserAccountDetail] = useState(null); // State for user account details
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false); // Loading state for user details

  // Add back timeFrame state
  const [startDate, setStartDate] = useState(null); // Start date filter
  const [endDate, setEndDate] = useState(null); // End date filter
  const [timeFrame, setTimeFrame] = useState("all"); // Time frame: all, today, yesterday, thisWeek, thisMonth, thisQuarter, thisYear

  // Get list of years with data from quarterlyRevenueData
  const getAvailableYears = () => {
    if (!quarterlyRevenueData || quarterlyRevenueData.length === 0) {
      return [new Date().getFullYear()];
    }

    const years = [...new Set(quarterlyRevenueData.map((q) => q.year))];
    return years.sort((a, b) => b - a); // Sort descending (newest year first)
  };

  // Limit the number of years displayed in the table
  const getDefaultYear = () => {
    const years = getAvailableYears();
    return years.length > 0
      ? years[0].toString()
      : new Date().getFullYear().toString();
  };

  // Update selectedYear state
  const [selectedYear, setSelectedYear] = useState(getDefaultYear());

  // Update selectedYear when data is available
  useEffect(() => {
    if (quarterlyRevenueData && quarterlyRevenueData.length > 0) {
      setSelectedYear(getDefaultYear());
    }
  }, [quarterlyRevenueData]);

  // Add state to store selected year for monthly revenue chart
  const [selectedMonthlyYear, setSelectedMonthlyYear] = useState(
    new Date().getFullYear()
  );

  // Function to return available years in revenue data
  const getAvailableYearsForMonthly = () => {
    if (!revenueData || revenueData.length === 0) {
      return [new Date().getFullYear()];
    }

    const years = [...new Set(revenueData.map((item) => item.year))];
    return years.sort((a, b) => b - a); // Sort descending (newest year first)
  };

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

  // Calculate revenue by month - updated to calculate for multiple years
  const calculateRevenueByMonth = (transactions) => {
    // Array to store monthly data by year
    const monthlyDataByYear = {};

    // Process transactions to categorize by year and month
    transactions.forEach((transaction) => {
      if (!transaction.transactionDate) return;

      const transactionDate = new Date(transaction.transactionDate);
      const year = transactionDate.getFullYear();
      const month = transactionDate.getMonth() + 1; // 1-12
      const amount = transaction.amount || 0;
      const packageName = transaction.packageName;

      // Initialize data for the year if it doesn't exist
      if (!monthlyDataByYear[year]) {
        monthlyDataByYear[year] = Array(12)
          .fill()
          .map((_, index) => {
            return {
              month: `${String(index + 1).padStart(2, "0")}/${year}`,
              year: year,
              monthNumber: index + 1,
              revenue: 0,
              standardRevenue: 0,
              premiumRevenue: 0,
              transactionCount: 0,
              standardCount: 0,
              premiumCount: 0,
            };
          });
      }

      // Update data for the corresponding month
      const monthIndex = month - 1;
      monthlyDataByYear[year][monthIndex].revenue += amount;
      monthlyDataByYear[year][monthIndex].transactionCount += 1;

      // Categorize by package
      if (packageName === "Standard") {
        monthlyDataByYear[year][monthIndex].standardRevenue += amount;
        monthlyDataByYear[year][monthIndex].standardCount += 1;
      } else if (packageName === "Premium") {
        monthlyDataByYear[year][monthIndex].premiumRevenue += amount;
        monthlyDataByYear[year][monthIndex].premiumCount += 1;
      }
    });

    // Convert from object to array for easier use
    const result = [];
    Object.keys(monthlyDataByYear).forEach((year) => {
      result.push(...monthlyDataByYear[year]);
    });

    return result;
  };

  // Calculate revenue by package
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

    // Calculate percentage of total revenue
    if (totalRevenue > 0) {
      packageRevenue.Standard.percentageOfTotal =
        (packageRevenue.Standard.revenue / totalRevenue) * 100;
      packageRevenue.Premium.percentageOfTotal =
        (packageRevenue.Premium.revenue / totalRevenue) * 100;
    }

    // Add total revenue to the result
    packageRevenue.totalRevenue = totalRevenue;
    packageRevenue.totalCount = totalCount;

    return packageRevenue;
  };

  // Calculate revenue by quarter - Updated to support multi-year display
  const calculateRevenueByQuarter = (transactions) => {
    // Find start and end years from transaction data
    const years = {};

    // If no transaction data, return an empty array
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Go through all transactions to identify years with data
    transactions.forEach((transaction) => {
      if (transaction.transactionDate) {
        const transactionDate = new Date(transaction.transactionDate);
        const year = transactionDate.getFullYear();
        years[year] = true;
      }
    });

    // Get the list of years with data, sorted in ascending order
    const yearsList = Object.keys(years)
      .map((year) => parseInt(year))
      .sort();

    // If no years, add the current year
    if (yearsList.length === 0) {
      yearsList.push(new Date().getFullYear());
    }

    // List of quarters for all years
    const quarters = [];

    // Create data for 4 quarters of each year
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

    // Calculate revenue for each quarter
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.transactionDate);
      const year = transactionDate.getFullYear();
      // Calculate quarter based on month (0-11)
      const quarter = Math.floor(transactionDate.getMonth() / 3) + 1;
      const amount = transaction.amount || 0;
      const packageName = transaction.packageName;

      // Find corresponding quarter and update revenue
      const quarterData = quarters.find(
        (q) => q.year === year && q.quarterNumber === quarter
      );

      if (quarterData) {
        quarterData.revenue += amount;
        quarterData.transactionCount += 1;

        // Categorize by package
        if (packageName === "Standard") {
          quarterData.standardRevenue += amount;
        } else if (packageName === "Premium") {
          quarterData.premiumRevenue += amount;
        }
      }
    });

    // Sort quarters by year and quarter number (from recent to older)
    return quarters.sort((a, b) =>
      a.year !== b.year ? b.year - a.year : a.quarterNumber - b.quarterNumber
    );
  };

  // Prepare data for line chart (revenue by month) - updated to filter by selected year
  const prepareRevenueChartData = () => {
    if (!revenueData.length) return null;

    // Filter data by selected year
    const yearData = revenueData.filter(
      (item) => item.year === selectedMonthlyYear
    );

    // Sort by month in ascending order
    yearData.sort((a, b) => a.monthNumber - b.monthNumber);

    const labels = yearData.map((item) => item.month);
    const revenueValues = yearData.map((item) => item.revenue);

    return {
      labels,
      datasets: [
        {
          label: "Monthly Revenue",
          data: revenueValues,
          borderColor: "rgba(53, 162, 235, 1)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  // Prepare data for line chart (package analysis)
  const preparePackageRevenueChartData = () => {
    if (!revenueData.length) return null;

    // Filter data by selected year
    const yearData = revenueData.filter(
      (item) => item.year === selectedMonthlyYear
    );

    // Sort by month in ascending order
    yearData.sort((a, b) => a.monthNumber - b.monthNumber);

    const labels = yearData.map((item) => item.month);
    const standardData = yearData.map((item) => item.standardRevenue);
    const premiumData = yearData.map((item) => item.premiumRevenue);

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

  // Prepare data for quarterly revenue chart
  const prepareQuarterlyRevenueChartData = () => {
    if (!quarterlyRevenueData.length) return null;

    // Filter quarters for the current year
    const currentYear = new Date().getFullYear();
    const currentYearQuarters = quarterlyRevenueData.filter(
      (q) => q.year === currentYear
    );

    // If no data for current year, get the nearest year with data
    let quartersToDisplay = currentYearQuarters;
    if (currentYearQuarters.length === 0) {
      // Find the nearest year with data
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

    // Sort by quarter order
    quartersToDisplay.sort((a, b) => a.quarterNumber - b.quarterNumber);

    const labels = quartersToDisplay.map((item) => item.quarter);
    const standardData = quartersToDisplay.map((item) => item.standardRevenue);
    const premiumData = quartersToDisplay.map((item) => item.premiumRevenue);

    return {
      labels,
      datasets: [
        {
          label: "Standard Package",
          data: standardData,
          backgroundColor: "rgba(75, 192, 192, 0.8)",
        },
        {
          label: "Premium Package",
          data: premiumData,
          backgroundColor: "rgba(153, 102, 255, 0.8)",
        },
      ],
    };
  };

  // Prepare data for pie chart (package comparison)
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
        `Standard: ${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(packageRevenueData.Standard.revenue)}`,
        `Premium: ${new Intl.NumberFormat("en-US", {
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
        `Standard: ${packageRevenueData.Standard.count} transactions`,
        `Premium: ${packageRevenueData.Premium.count} transactions`,
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

  // Common options for charts
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
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "VND",
              }).format(context.parsed.y);
            } else if (context.parsed !== null) {
              label += new Intl.NumberFormat("en-US", {
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
            return new Intl.NumberFormat("en-US", {
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

  // Options for monthly revenue chart
  const revenueChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: `Monthly Revenue - Year ${selectedMonthlyYear}`,
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
  };

  // Options for package revenue chart
  const packageRevenueChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: `Revenue by Package - Year ${selectedMonthlyYear}`,
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
  };

  // Options for quarterly revenue chart
  const quarterlyChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: "Quarterly Revenue",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
  };

  // Options for pie chart
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            size: 10,
          },
          boxWidth: 10,
          padding: 5,
        },
      },
      title: {
        display: true,
        text: `Package Comparison (${
          comparisonMetric === "revenue" ? "Revenue" : "Quantity"
        })`,
        font: {
          size: 12,
          weight: "bold",
        },
        padding: {
          top: 5,
          bottom: 5,
        },
      },
      tooltip: {
        titleFont: {
          size: 10,
        },
        bodyFont: {
          size: 10,
        },
        padding: 6,
      },
    },
    layout: {
      padding: {
        top: 5,
        bottom: 5,
        left: 5,
        right: 5,
      },
    },
  };

  // Prepare chart data
  const revenueChartData = prepareRevenueChartData();
  const packageRevenueChartData = preparePackageRevenueChartData();
  const quarterlyRevenueChartData = prepareQuarterlyRevenueChartData();
  const packageComparisonPieChartData = preparePackageComparisonPieChart();

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

  // Process time frame filter
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
        // Get the first day of the week (Monday)
        newStartDate = new Date(now);
        const dayOfWeek = now.getDay() || 7; // Convert 0 (Sunday) to 7
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
        // "all" - no time filter applied
        break;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Set time frame and filter
  const handleTimeFrameChange = (newTimeFrame) => {
    // If newTimeFrame was already selected before and clicked again, deselect it
    if (timeFrame === newTimeFrame) {
      setTimeFrame("all");
      setStartDate(null);
      setEndDate(null);
    } else {
      setTimeFrame(newTimeFrame);

      // If "all" is selected, remove all time constraints
      if (newTimeFrame === "all") {
        setStartDate(null);
        setEndDate(null);
      } else {
        applyTimeFrameFilter();
      }
    }
  };

  // Handle start date change
  const handleStartDateChange = (date) => {
    setStartDate(date);
    // If a time range is selected (all, today, thisWeek...), reset it to avoid conflicts
    if (timeFrame !== "all") {
      setTimeFrame("all");
    }
  };

  // Handle end date change
  const handleEndDateChange = (date) => {
    setEndDate(date);
    // If a time range is selected (all, today, thisWeek...), reset it to avoid conflicts
    if (timeFrame !== "all") {
      setTimeFrame("all");
    }
  };

  // Filter transactions by various criteria - Used for all tabs except Quarterly Report
  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // Filter by package
    if (transactionType !== "all") {
      filtered = filtered.filter(
        (t) => t.packageName.toLowerCase() === transactionType
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (t) => t.paymentStatus.toLowerCase() === statusFilter
      );
    }

    // Filter by name or email (combined)
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (t) =>
          (t.fullName &&
            t.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (t.email && t.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by time
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

    // Sort newest transactions first
    filtered.sort(
      (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
    );

    return filtered;
  };

  // Filter quarterly data by selected year - ONLY used for Quarterly Report tab
  const getFilteredQuarterlyData = () => {
    // Only show data for the selected year, not affected by other time filters
    return quarterlyRevenueData.filter(
      (quarter) => quarter.year === parseInt(selectedYear)
    );
  };

  // Pagination
  const paginateTransactions = (transactions) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return transactions.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Calculate total pages
  const totalPages = Math.ceil(getFilteredTransactions().length / itemsPerPage);

  // Go to a specific page
  const goToPage = (pageNumber) => {
    setCurrentPage(Math.min(Math.max(1, pageNumber), totalPages));
  };

  // Calculate total revenue from filtered transactions
  const calculateFilteredTotalRevenue = () => {
    const filteredTransactions = getFilteredTransactions().filter(
      (t) => t.paymentStatus.toLowerCase() === "completed"
    );
    return filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  // Count transactions by each status
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

  // Status statistics
  const statusCounts = countTransactionsByStatus();

  // Calculate total revenue from filtered transactions
  const filteredTotalRevenue = calculateFilteredTotalRevenue();

  // Format date
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

  // Function to get user account details from API
  const fetchUserAccountDetail = async (email) => {
    if (!email) return null;

    setIsLoadingUserDetail(true);
    try {
      console.log("Fetching user details for email:", email);
      // Use userAccountsApi.findByEmail to call the API
      const response = await userAccountsApi.findByEmail(email);
      console.log("API response:", response);

      // Check if response has data
      if (response && response.data) {
        // OData usually returns an array of objects, so take the first element
        if (Array.isArray(response.data) && response.data.length > 0) {
          const userDetail = response.data[0];
          console.log("User detail found:", userDetail);
          setUserAccountDetail(userDetail);
        }
        // Case where API returns an object directly instead of an array
        else if (typeof response.data === "object" && response.data !== null) {
          console.log("User detail found (object format):", response.data);
          setUserAccountDetail(response.data);
        } else {
          console.log("Empty data array or invalid format");
          // Create basic information from transaction data
          createMockUserDetail();
        }
      } else {
        console.log("Invalid API response format");
        createMockUserDetail();
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      createMockUserDetail();
    } finally {
      setIsLoadingUserDetail(false);
    }

    // Hàm tạo dữ liệu giả khi không tìm thấy thông tin hoặc có lỗi
    function createMockUserDetail() {
      const mockUserDetail = {
        fullName: selectedTransaction.fullName || "Không có tên",
        email: selectedTransaction.email || "Không có email",
        phoneNumber: "Không có thông tin điện thoại",
        dateOfBirth: null,
        gender: null,
        address: "Không có thông tin địa chỉ",
        roleName: "Khách hàng",
        status: "Đang hoạt động",
      };
      setUserAccountDetail(mockUserDetail);
    }
  };

  // Mở modal xem chi tiết giao dịch - Cập nhật để gọi API lấy thông tin người dùng
  const openTransactionDetail = async (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);

    // Reset userAccountDetail để tránh hiển thị dữ liệu cũ
    setUserAccountDetail(null);

    // Chỉ khi mở modal mới gọi API lấy thông tin người dùng
    if (transaction && transaction.email) {
      // Đặt timeout ngắn để đảm bảo modal đã render trước khi fetch dữ liệu
      await fetchUserAccountDetail(transaction.email);
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

  // Function to get list of purchased packages
  const getUserPackageHistory = (userId) => {
    if (!userId) return [];

    const userTransactions = getUserTransactions(userId);

    // Only show successful transactions and sort by most recent transaction date
    return userTransactions
      .filter((t) => t.paymentStatus.toLowerCase() === "completed")
      .sort(
        (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
      );
  };

  // Function to get user's most recent transactions
  const getUserRecentTransactions = (userId, limit = 5) => {
    const userTransactions = getUserTransactions(userId);

    // Only get successful transactions
    return userTransactions
      .filter((t) => t.paymentStatus.toLowerCase() === "completed")
      .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
      .slice(0, limit);
  };

  // Function to get all user transactions in the current quarter
  const getUserTransactionsForCurrentQuarter = (userId) => {
    if (!userId) return [];

    // Get all user transactions
    const userTxs = transactions.filter((t) => t.userId === userId);

    // Get current quarter
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const currentYear = now.getFullYear();

    // Filter successful transactions in the current quarter
    const quarterTransactions = userTxs.filter((t) => {
      if (t.paymentStatus.toLowerCase() !== "completed") return false;

      const txDate = new Date(t.transactionDate);
      const txQuarter = Math.floor(txDate.getMonth() / 3);
      const txYear = txDate.getFullYear();

      return txQuarter === currentQuarter && txYear === currentYear;
    });

    // Sort newest transactions first
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

  // Replace the renderCharts() function with direct pie chart configuration
  const renderDashboard = () => {
    return (
      <div className="chart-panel">
        <div className="chart-row">
          <div className="chart-card half">
            <h3>
              <i className="fas fa-chart-pie"></i> Revenue Ratio by Package
            </h3>
            <div className="chart-controls">
              <button
                className={comparisonMetric === "revenue" ? "active" : ""}
                onClick={() => setComparisonMetric("revenue")}
              >
                Revenue
              </button>
              <button
                className={comparisonMetric === "transactions" ? "active" : ""}
                onClick={() => setComparisonMetric("transactions")}
              >
                Quantity
              </button>
            </div>
            <div className="chart-area" style={{ height: "250px" }}>
              {packageComparisonPieChartData ? (
                <div className="pie-chart-container">
                  <Doughnut
                    data={packageComparisonPieChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: "60%",
                      plugins: {
                        legend: {
                          position: "bottom",
                          align: "center",
                          labels: {
                            padding: 10,
                            boxWidth: 10,
                            font: {
                              size: 10,
                            },
                          },
                        },
                        tooltip: {
                          bodyFont: {
                            size: 10,
                          },
                          titleFont: {
                            size: 10,
                          },
                          padding: 6,
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
                  <i className="fas fa-info-circle"></i> No data available
                </div>
              )}
            </div>
          </div>

          {/* Keep the code for the remaining card */}
          <div className="chart-card half">
            <h3>
              <i className="fas fa-funnel-dollar"></i> Transaction Statistics
            </h3>
            <div className="stats-container">
              <div className="stat-item">
                <div className="stat-label">Total transactions:</div>
                <div className="stat-value">{statusCounts.total}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Successful transactions:</div>
                <div className="stat-value success">
                  {statusCounts.completed}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Pending payments:</div>
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

  // Calculate revenue by package WITH time filter applied and filtered by selected year
  const calculateFilteredRevenueByPackage = () => {
    // Get transactions filtered by time and status
    let filteredTransactions = getFilteredTransactions().filter(
      (t) => t.paymentStatus.toLowerCase() === "completed"
    );

    // Add filtering by selected year for package analysis tab
    if (activeTab === "packages") {
      filteredTransactions = filteredTransactions.filter((t) => {
        const transactionDate = new Date(t.transactionDate);
        return transactionDate.getFullYear() === selectedMonthlyYear;
      });
    }

    const filteredPackageRevenue = {
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
        filteredPackageRevenue.Standard.revenue += amount;
        filteredPackageRevenue.Standard.count += 1;
      } else if (packageName === "Premium") {
        filteredPackageRevenue.Premium.revenue += amount;
        filteredPackageRevenue.Premium.count += 1;
      }
    });

    // Calculate percentage of total revenue
    if (totalRevenue > 0) {
      filteredPackageRevenue.Standard.percentageOfTotal =
        (filteredPackageRevenue.Standard.revenue / totalRevenue) * 100;
      filteredPackageRevenue.Premium.percentageOfTotal =
        (filteredPackageRevenue.Premium.revenue / totalRevenue) * 100;
    }

    // Add total revenue to the result
    filteredPackageRevenue.totalRevenue = totalRevenue;
    filteredPackageRevenue.totalCount = totalCount;

    return filteredPackageRevenue;
  };

  // Add function to get transactions for a specific quarter
  const getTransactionsForQuarter = (year, quarterNumber) => {
    if (!transactions || !year || !quarterNumber) return [];

    // Get start and end dates for the quarter
    const startMonth = (quarterNumber - 1) * 3; // 0, 3, 6, 9
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, startMonth + 3, 0); // Last day of the last month in the quarter

    // Filter transactions by date and only get completed transactions
    return transactions.filter((transaction) => {
      if (transaction.paymentStatus.toLowerCase() !== "completed") return false;

      const txDate = new Date(transaction.transactionDate);
      return txDate >= startDate && txDate <= endDate;
    });
  };

  // Function to open quarter detail modal
  const openQuarterDetail = (year, quarterNumber) => {
    setSelectedQuarter({
      year: year,
      quarter: quarterNumber,
      name: `Q${quarterNumber}/${year}`,
    });
    setShowQuarterDetail(true);
  };

  // Function to close quarter detail modal
  const closeQuarterDetail = () => {
    setSelectedQuarter(null);
    setShowQuarterDetail(false);
  };

  // Add new function to prepare quarterly chart data - not affected by time filter
  const prepareQuarterlyChartDataForSelectedYear = () => {
    if (!quarterlyRevenueData.length) return null;

    // Filter quarterly data for the selected year
    const yearData = quarterlyRevenueData.filter(
      (quarter) => quarter.year === parseInt(selectedYear)
    );

    // Sort by quarter in ascending order
    yearData.sort((a, b) => a.quarterNumber - b.quarterNumber);

    const labels = yearData.map((quarter) => quarter.quarter);
    const standardData = yearData.map((quarter) => quarter.standardRevenue);
    const premiumData = yearData.map((quarter) => quarter.premiumRevenue);

    return {
      labels,
      datasets: [
        {
          label: "Standard Package",
          data: standardData,
          backgroundColor: "rgba(75, 192, 192, 0.8)",
        },
        {
          label: "Premium Package",
          data: premiumData,
          backgroundColor: "rgba(153, 102, 255, 0.8)",
        },
      ],
    };
  };

  return (
    <div className="revenue-dashboard">
      {/* Title */}
      <div className="dashboard-header">
        <h2>
          <i className="fas fa-chart-line"></i> Revenue Report
        </h2>
        <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {/* Time filter and time frame */}
      <div className="time-filter-container">
        <div className="time-frame-selector" style={{ display: "none" }}>
          <button
            className={timeFrame === "all" ? "active" : ""}
            onClick={() => handleTimeFrameChange("all")}
          >
            All
          </button>
          <button
            className={timeFrame === "today" ? "active" : ""}
            onClick={() => handleTimeFrameChange("today")}
          >
            Today
          </button>
          <button
            className={timeFrame === "thisWeek" ? "active" : ""}
            onClick={() => handleTimeFrameChange("thisWeek")}
          >
            This Week
          </button>
          <button
            className={timeFrame === "thisMonth" ? "active" : ""}
            onClick={() => handleTimeFrameChange("thisMonth")}
          >
            This Month
          </button>
          <button
            className={timeFrame === "thisQuarter" ? "active" : ""}
            onClick={() => handleTimeFrameChange("thisQuarter")}
          >
            This Quarter
          </button>
          <button
            className={timeFrame === "thisYear" ? "active" : ""}
            onClick={() => handleTimeFrameChange("thisYear")}
          >
            This Year
          </button>
        </div>

        <div className="custom-date-range">
          <div className="date-range-inputs">
            <div className="date-range-input">
              <label>From:</label>
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="MM/dd/yyyy"
                placeholderText="Select start date"
                className="date-picker"
                isClearable={true}
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={10}
                popperPlacement="bottom-start"
                popperModifiers={{
                  preventOverflow: {
                    enabled: true,
                    escapeWithReference: false,
                    boundariesElement: "viewport",
                  },
                }}
                onClickOutside={(e) => e.stopPropagation()}
              />
            </div>

            <div className="date-range-input">
              <label>To:</label>
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="MM/dd/yyyy"
                placeholderText="Select end date"
                className="date-picker"
                isClearable={true}
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={10}
                popperPlacement="bottom-start"
                popperModifiers={{
                  preventOverflow: {
                    enabled: true,
                    escapeWithReference: false,
                    boundariesElement: "viewport",
                  },
                }}
                onClickOutside={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card summaries - Updated to use filtered data */}
      <div className="summary-cards">
        <div className="summary-card total-revenue">
          <div className="card-icon">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="card-content">
            <h4>Total Revenue</h4>
            <div className="card-value">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(filteredTotalRevenue)}
            </div>
            <div className="card-subtitle">
              {statusCounts.completed} successful transactions
            </div>
          </div>
        </div>

        <div className="summary-card transaction-counts">
          <div className="card-icon">
            <i className="fas fa-receipt"></i>
          </div>
          <div className="card-content">
            <h4>Total Transactions</h4>
            <div className="card-value">{statusCounts.total}</div>
            <div className="transaction-status-summary">
              <span className="status-dot completed"></span> Completed:{" "}
              {statusCounts.completed}
              <span className="status-dot pending"></span> Pending:{" "}
              {statusCounts.pending}
              <span className="status-dot failed"></span> Failed:{" "}
              {statusCounts.failed}
            </div>
          </div>
        </div>

        {/* Using data filtered by time */}
        {(() => {
          const filteredPackageData = calculateFilteredRevenueByPackage();
          return (
            <>
              <div className="summary-card standard-revenue">
                <div className="card-icon">
                  <i className="fas fa-box"></i>
                </div>
                <div className="card-content">
                  <h4>Standard Package</h4>
                  <div className="card-value">
                    {new Intl.NumberFormat("en-US", {
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
                    % of revenue | {filteredPackageData.Standard?.count || 0}{" "}
                    transactions
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
                    {new Intl.NumberFormat("en-US", {
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
                    % of revenue | {filteredPackageData.Premium?.count || 0}{" "}
                    transactions
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Tab navigation */}
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
          className={activeTab === "quarterly" ? "active" : ""}
          onClick={() => setActiveTab("quarterly")}
        >
          <i className="fas fa-calendar-alt"></i> Quarterly Reports
        </button>
        <button
          className={activeTab === "details" ? "active" : ""}
          onClick={() => setActiveTab("details")}
        >
          <i className="fas fa-list-ul"></i> Transaction Details
        </button>
      </div>

      {/* Chart area */}
      <div className="revenue-charts">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="chart-panel">
            <div className="chart-card full-width">
              <h3>
                <i className="fas fa-chart-line"></i> Monthly Revenue Chart
              </h3>
              {/* Add dropdown to select year for monthly revenue chart */}
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
                  htmlFor="monthlyYearSelect"
                  style={{ marginRight: "10px", fontWeight: "500" }}
                >
                  <i
                    className="fas fa-calendar-year"
                    style={{ marginRight: "5px" }}
                  ></i>
                  Select year:
                </label>
                <select
                  id="monthlyYearSelect"
                  className="year-dropdown"
                  value={selectedMonthlyYear}
                  onChange={(e) =>
                    setSelectedMonthlyYear(parseInt(e.target.value))
                  }
                  style={{
                    padding: "5px 10px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    backgroundColor: "#fff",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  {getAvailableYearsForMonthly().map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="chart-area">
                {revenueChartData ? (
                  <Line data={revenueChartData} options={revenueChartOptions} />
                ) : (
                  <div className="no-data-message">
                    <i className="fas fa-info-circle"></i> No revenue data to
                    display for year {selectedMonthlyYear}
                  </div>
                )}
              </div>
            </div>

            <div className="chart-row">{renderDashboard()}</div>
          </div>
        )}

        {/* Package Analysis Tab */}
        {activeTab === "packages" && (
          <div className="chart-panel">
            <div className="chart-card full-width">
              <h3>
                <i className="fas fa-boxes"></i> Revenue Comparison by Package
              </h3>
              {/* Add dropdown to select year for package analysis chart */}
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
                  htmlFor="packageYearSelect"
                  style={{ marginRight: "10px", fontWeight: "500" }}
                >
                  <i
                    className="fas fa-calendar-year"
                    style={{ marginRight: "5px" }}
                  ></i>
                  Select year:
                </label>
                <select
                  id="packageYearSelect"
                  className="year-dropdown"
                  value={selectedMonthlyYear}
                  onChange={(e) =>
                    setSelectedMonthlyYear(parseInt(e.target.value))
                  }
                  style={{
                    padding: "5px 10px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    backgroundColor: "#fff",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  {getAvailableYearsForMonthly().map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="chart-area">
                {packageRevenueChartData ? (
                  <Line
                    data={packageRevenueChartData}
                    options={packageRevenueChartOptions}
                  />
                ) : (
                  <div className="no-data-message">
                    <i className="fas fa-info-circle"></i> No data to display
                    for year {selectedMonthlyYear}
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
                        <i className="fas fa-box"></i> Standard Package Details
                      </h3>
                      <div className="package-details">
                        <div className="package-detail-item">
                          <div className="detail-label">Total revenue:</div>
                          <div className="detail-value">
                            {formatAmount(
                              filteredPackageData.Standard?.revenue || 0
                            )}
                          </div>
                        </div>
                        <div className="package-detail-item">
                          <div className="detail-label">
                            Number of transactions:
                          </div>
                          <div className="detail-value">
                            {filteredPackageData.Standard?.count || 0}
                          </div>
                        </div>
                        <div className="package-detail-item">
                          <div className="detail-label">Price:</div>
                          <div className="detail-value">379,000 VND</div>
                        </div>
                        <div className="package-detail-item">
                          <div className="detail-label">Revenue ratio:</div>
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
                        <i className="fas fa-crown"></i> Premium Package Details
                      </h3>
                      <div className="package-details">
                        <div className="package-detail-item">
                          <div className="detail-label">Total revenue:</div>
                          <div className="detail-value">
                            {formatAmount(
                              filteredPackageData.Premium?.revenue || 0
                            )}
                          </div>
                        </div>
                        <div className="package-detail-item">
                          <div className="detail-label">
                            Number of transactions:
                          </div>
                          <div className="detail-value">
                            {filteredPackageData.Premium?.count || 0}
                          </div>
                        </div>
                        <div className="package-detail-item">
                          <div className="detail-label">Price:</div>
                          <div className="detail-value">1,279,000 VND</div>
                        </div>
                        <div className="package-detail-item">
                          <div className="detail-label">Revenue ratio:</div>
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

        {/* Quarterly Reports Tab */}
        {activeTab === "quarterly" && (
          <div className="chart-panel">
            <div className="chart-card full-width">
              <h3>
                <i className="fas fa-calendar-alt"></i> Quarterly Revenue
              </h3>
              {/* Year selection dropdown for quarterly reports */}
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
                  Select year:
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
                      Year {year}
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
                    <i className="fas fa-info-circle"></i> No quarterly revenue
                    data to display for year {selectedYear}
                  </div>
                )}
              </div>
            </div>

            <div className="quarterly-summary">
              <h3>
                <i className="fas fa-list"></i> Quarterly Revenue Summary
              </h3>

              <div className="quarterly-table-container">
                <table className="quarterly-table">
                  <thead>
                    <tr>
                      <th>Quarter</th>
                      <th>Total Revenue</th>
                      <th>Standard Package</th>
                      <th>Premium Package</th>
                      <th>Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredQuarterlyData().length > 0 ? (
                      getFilteredQuarterlyData().map((quarter, index) => (
                        <tr
                          key={index}
                          className="quarter-row"
                          onClick={() =>
                            openQuarterDetail(
                              quarter.year,
                              quarter.quarterNumber
                            )
                          }
                          style={{ cursor: "pointer" }}
                        >
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
                          <i className="fas fa-info-circle"></i> No data for
                          year {selectedYear}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>
                        <strong>Total</strong>
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

        {/* Transaction Details Tab */}
        {activeTab === "details" && (
          <div className="chart-panel">
            <div className="chart-card detail-card">
              <h3>
                <i className="fas fa-file-invoice-dollar"></i> Transaction
                Details
              </h3>

              {/* Detailed filters */}
              <div className="advanced-filter">
                <div className="filter-section">
                  <div className="filter-row">
                    <label>Package:</label>
                    <select
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value)}
                    >
                      <option value="all">All packages</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>

                  <div className="filter-row">
                    <label>Status:</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All statuses</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="filter-section">
                  <div className="filter-row">
                    <label>Search:</label>
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-filter-input"
                    />
                  </div>
                </div>
              </div>

              {/* Display total results and revenue */}
              <div className="filter-summary">
                <div className="result-count">
                  Showing {getFilteredTransactions().length} transactions
                </div>
                <div className="filtered-revenue">
                  Total revenue: {formatAmount(filteredTotalRevenue)}
                </div>
              </div>

              {/* Enhanced transaction table */}
              <div className="detailed-table-container">
                <table className="detailed-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Customer</th>
                      <th>Package</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Transaction Date</th>
                      <th>Payment Date</th>
                      <th>Status</th>
                      <th>Details</th>
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
                              {transaction.fullName || "No name"}
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
                              {transaction.paymentMethod || "Unidentified"}
                            </td>
                            <td>{formatDate(transaction.transactionDate)}</td>
                            <td>
                              {transaction.paymentDate
                                ? formatDate(transaction.paymentDate)
                                : "Not paid"}
                            </td>
                            <td>
                              {renderPaymentStatus(transaction.paymentStatus)}
                            </td>
                            <td>
                              <button
                                className="view-detail-btn"
                                title="View details"
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
                          <i className="fas fa-info-circle"></i> No transaction
                          data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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
                    Page {currentPage} / {totalPages}
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
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transaction detail modal */}
      {showTransactionDetail && selectedTransaction && (
        <div className="transaction-detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <i className="fas fa-user-circle"></i> Customer Details
              </h3>
              <button className="close-modal" onClick={closeTransactionDetail}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              {isLoadingUserDetail ? (
                <div className="loading-info">Loading user information...</div>
              ) : (
                <>
                  {/* Basic customer information */}
                  <div className="user-profile-section">
                    <div className="user-basic-info">
                      <div className="user-name">
                        <h4>
                          {userAccountDetail?.Name ||
                            selectedTransaction.fullName}
                        </h4>
                      </div>
                      <div className="user-contact">
                        <p>
                          <i className="fas fa-envelope"></i>{" "}
                          {userAccountDetail?.Email ||
                            selectedTransaction.email ||
                            "No email information"}
                        </p>
                        <p>
                          <i className="fas fa-phone"></i>{" "}
                          {userAccountDetail?.PhoneNumber ||
                            "No phone information"}
                        </p>
                        <p>
                          <i className="fas fa-map-marker-alt"></i>{" "}
                          {userAccountDetail?.Address ||
                            "No address information"}
                        </p>
                        {userAccountDetail?.DateOfBirth && (
                          <p>
                            <i className="fas fa-birthday-cake"></i>{" "}
                            {new Date(
                              userAccountDetail.DateOfBirth
                            ).toLocaleDateString("en-US")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Purchase history */}
                  {/* <div className="purchase-history-section">
                    <h4>
                      <i className="fas fa-history"></i> Package Purchase
                      History
                    </h4>
                    <div className="package-history-container">
                      <table className="package-history-table">
                        <thead>
                          <tr>
                            <th>Package</th>
                            <th>Payment Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedTransaction && selectedTransaction.userId ? (
                            getUserTransactions(selectedTransaction.userId)
                              .filter((t) => t.paymentStatus === "Completed")
                              .map((transaction, index) => (
                                <tr key={index}>
                                  <td>
                                    {renderPackageBadge(
                                      transaction.packageName
                                    )}
                                  </td>
                                  <td>
                                    {formatDate(
                                      transaction.paymentDate ||
                                        transaction.transactionDate
                                    )}
                                  </td>
                                  <td className="amount-value">
                                    {formatAmount(transaction.amount)}
                                  </td>
                                  <td>
                                    {renderPaymentStatus(
                                      transaction.paymentStatus
                                    )}
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="no-data">
                                <i className="fas fa-info-circle"></i> No
                                transaction data
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div> */}
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="modal-btn" onClick={closeTransactionDetail}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quarterly detail modal - list of customers in the quarter */}
      {showQuarterDetail && selectedQuarter && (
        <div className="transaction-detail-modal">
          <div
            className="modal-content"
            style={{ maxWidth: "90%", width: "1100px" }}
          >
            <div className="modal-header">
              <h3>
                <i className="fas fa-users"></i> Transaction List - Quarter{" "}
                {selectedQuarter.name}
              </h3>
              <button className="close-modal" onClick={closeQuarterDetail}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div
                className="quarter-stats"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "15px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                {(() => {
                  // Optimize: only get transaction data once
                  const transactions = getTransactionsForQuarter(
                    selectedQuarter.year,
                    selectedQuarter.quarter
                  );

                  const totalRevenue = transactions.reduce(
                    (sum, t) => sum + (t.amount || 0),
                    0
                  );
                  const standardCount = transactions.filter(
                    (t) => t.packageName === "Standard"
                  ).length;
                  const premiumCount = transactions.filter(
                    (t) => t.packageName === "Premium"
                  ).length;

                  // Calculate number of unique customers (no duplicates)
                  const uniqueUserIds = new Set();
                  transactions.forEach((t) => {
                    if (t.userId) uniqueUserIds.add(t.userId);
                  });
                  const uniqueUsers = uniqueUserIds.size;

                  return (
                    <>
                      <div className="quarter-stat-item">
                        <div className="stat-title">Revenue</div>
                        <div className="stat-value">
                          {formatAmount(totalRevenue)}
                        </div>
                      </div>
                      <div className="quarter-stat-item">
                        <div className="stat-title">Transactions</div>
                        <div className="stat-value">{transactions.length}</div>
                      </div>
                      <div className="quarter-stat-item">
                        <div className="stat-title">Standard Package</div>
                        <div className="stat-value">
                          {standardCount} transactions
                        </div>
                      </div>
                      <div className="quarter-stat-item">
                        <div className="stat-title">Premium Package</div>
                        <div className="stat-value">
                          {premiumCount} transactions
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <h4>
                <i className="fas fa-list"></i> Transaction List in Quarter
              </h4>

              <div
                className="customer-table-container"
                style={{ maxHeight: "500px", overflowY: "auto" }}
              >
                <table className="detailed-table">
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#fff",
                    }}
                  >
                    <tr>
                      <th>Transaction ID</th>
                      <th>Customer</th>
                      <th>Package</th>
                      <th>Amount</th>
                      <th>Transaction Date</th>
                      <th>Method</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Optimize: get and store data only once
                      const quarterTransactions = getTransactionsForQuarter(
                        selectedQuarter.year,
                        selectedQuarter.quarter
                      );

                      if (quarterTransactions.length > 0) {
                        return quarterTransactions.map((transaction, index) => (
                          <tr key={index}>
                            <td>{transaction.gatewayTransactionId || "N/A"}</td>
                            <td>
                              {transaction.fullName || "No name"}
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
                            <td>{formatDate(transaction.transactionDate)}</td>
                            <td>
                              {transaction.paymentMethod || "Unspecified"}
                            </td>
                            <td>
                              <button
                                className="view-detail-btn"
                                title="View customer details"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent event propagation
                                  // Close quarter modal before opening user detail modal
                                  setShowQuarterDetail(false);
                                  openTransactionDetail(transaction);
                                }}
                              >
                                <i className="fas fa-info-circle"></i>
                              </button>
                            </td>
                          </tr>
                        ));
                      } else {
                        return (
                          <tr>
                            <td colSpan="7" className="no-data">
                              <i className="fas fa-info-circle"></i> No
                              transaction data in this quarter
                            </td>
                          </tr>
                        );
                      }
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-btn primary"
                onClick={closeQuarterDetail}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
