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
import membershipApi from "../../../../services/memberShipApi";

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
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy dữ liệu từ API thực tế
        const response = await membershipApi.getAllMemberships();
        const memberships = response.data?.data || [];

        // Xử lý dữ liệu để tính số thành viên mới theo tháng
        const membersByMonth = processMembershipData(memberships);
        setMemberData(membersByMonth);

        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Lỗi khi tải dữ liệu: " + (err.message || "Không xác định"));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Xử lý dữ liệu từ API để tính số thành viên mới theo tháng
  const processMembershipData = (memberships) => {
    // Tạo đối tượng để lưu trữ số lượng thành viên mới theo tháng
    const memberCountByMonth = {};

    // Lấy năm hiện tại
    const currentYear = new Date().getFullYear();

    // Khởi tạo tất cả các tháng trong năm hiện tại với giá trị 0
    for (let i = 1; i <= 12; i++) {
      const monthKey = `${String(i).padStart(2, "0")}/${currentYear}`;
      memberCountByMonth[monthKey] = 0;
    }

    // Đếm số lượng thành viên mới theo tháng
    memberships.forEach((membership) => {
      // Lấy ngày bắt đầu từ startDate
      const startDate = new Date(membership.startDate);

      // Chỉ xử lý các thành viên đăng ký trong năm hiện tại
      if (startDate.getFullYear() === currentYear) {
        const month = String(startDate.getMonth() + 1).padStart(2, "0");
        const monthKey = `${month}/${currentYear}`;

        // Tăng số lượng thành viên mới trong tháng đó
        memberCountByMonth[monthKey] = (memberCountByMonth[monthKey] || 0) + 1;
      }
    });

    // Chuyển đổi đối tượng thành mảng để dễ dàng sử dụng với Chart.js
    return Object.entries(memberCountByMonth)
      .map(([month, count]) => ({
        month,
        newMembers: count,
      }))
      .sort((a, b) => {
        // Sắp xếp theo tháng (01/2023, 02/2023, ...)
        const [aMonth, aYear] = a.month.split("/");
        const [bMonth, bYear] = b.month.split("/");
        return aMonth - bMonth;
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
        ticks: {
          precision: 0, // Chỉ hiển thị số nguyên
        },
      },
    },
  };

  const memberChartData = prepareMemberChartData();

  // Tính tổng số thành viên mới trong năm hiện tại
  const totalNewMembers = memberData.reduce(
    (sum, item) => sum + item.newMembers,
    0
  );

  // Tìm tháng có nhiều thành viên đăng ký nhất
  const peakMonth =
    memberData.length > 0
      ? memberData.reduce(
          (max, item) => (item.newMembers > max.newMembers ? item : max),
          memberData[0]
        )
      : { month: "N/A", newMembers: 0 };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="member-chart-container">
      <div className="member-summary">
        <div className="summary-item">
          <h3>Tổng thành viên mới</h3>
          <p className="amount">{totalNewMembers}</p>
        </div>
        <div className="summary-item">
          <h3>Tháng đăng ký cao nhất</h3>
          <p className="amount">
            {peakMonth.month} ({peakMonth.newMembers} thành viên)
          </p>
        </div>
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

export default MemberChart;
