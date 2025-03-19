// src/pages/Admin/Admin.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarHover from "../../components/admin/Sidebar/SidebarHover";
import Topbar from "../../components/admin/Topbar/Topbar";
import PackageChart from "../../components/admin/PackageChart/PackageChart";
import RevenueChart from "../../components/admin/RevenueChart/RevenueChart";
import MemberChart from "../../components/admin/MemberChart/MemberChart";
import "./Admin.css";

function Admin() {
  const location = useLocation();
  // State để theo dõi biểu đồ đang được hiển thị
  const [activeChart, setActiveChart] = useState("revenue");
  // State để lưu trữ dữ liệu từ PackageChart
  const [packageData, setPackageData] = useState({
    totalMembers: 0,
    mostPopularPackage: "N/A",
    conversionRate: 0,
  });

  // Sử dụng useCallback để tránh tạo lại hàm mỗi khi component re-render
  const handlePackageDataLoaded = useCallback((data) => {
    if (!data || !data.counts) return;

    // Tính tỷ lệ chuyển đổi (người dùng không dùng gói Free)
    const conversionRate =
      data.total > 0 ? ((data.total - data.counts.Free) / data.total) * 100 : 0;

    // Tìm gói phổ biến nhất
    const mostPopularPackage =
      Object.entries(data.counts || {})
        .sort((a, b) => b[1] - a[1])
        .filter(([name, count]) => count > 0)
        .map(([name]) => name)[0] || "N/A";

    setPackageData({
      totalMembers: data.total || 0,
      mostPopularPackage,
      conversionRate: conversionRate.toFixed(1),
    });
  }, []); // Không có dependencies, chỉ tạo một lần

  return (
    <div className="admin-container">
      {/* Sidebar trái (hover logo => mở) */}
      <SidebarHover />

      <div className="admin-main">
        {/* Thanh trên cùng */}
        <Topbar />

        {/* Khu vực nội dung */}
        <div className="admin-content">
          {/* Hiển thị dashboard khi ở trang admin chính */}
          {location.pathname === "/admin" && (
            <div className="admin-dashboard">
              {/* Nút chuyển đổi biểu đồ */}
              <div className="chart-tabs">
                <button
                  className={`chart-tab ${
                    activeChart === "revenue" ? "active" : ""
                  }`}
                  onClick={() => setActiveChart("revenue")}
                >
                  <i className="fas fa-chart-line"></i> Thống kê doanh thu
                </button>
                <button
                  className={`chart-tab ${
                    activeChart === "package" ? "active" : ""
                  }`}
                  onClick={() => setActiveChart("package")}
                >
                  <i className="fas fa-box"></i> Phân bố gói dịch vụ
                </button>
                <button
                  className={`chart-tab ${
                    activeChart === "member" ? "active" : ""
                  }`}
                  onClick={() => setActiveChart("member")}
                >
                  <i className="fas fa-users"></i> Thống kê thành viên mới
                </button>
              </div>

              {/* Hiển thị biểu đồ tương ứng */}
              <div className="chart-container">
                {activeChart === "revenue" && (
                  <div className="chart-item active">
                    <h3>Thống kê doanh thu</h3>
                    <RevenueChart />
                  </div>
                )}

                {activeChart === "package" && (
                  <div className="chart-item active">
                    <h3>Phân bố người dùng theo gói dịch vụ</h3>
                    <PackageChart onDataLoaded={handlePackageDataLoaded} />
                  </div>
                )}

                {activeChart === "member" && (
                  <div className="chart-item active">
                    <h3>Thống kê thành viên mới</h3>
                    <MemberChart />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Khu vực hiển thị components con */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Admin;
