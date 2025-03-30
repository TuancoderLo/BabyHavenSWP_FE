// src/pages/Admin/Admin.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarHover from "../../layouts/Admin/Sidebar/SidebarHover";
import Topbar from "../../layouts/Admin/Topbar/Topbar";
import PackageChart from "./Chard/PackageChart/PackageChart";
import RevenueChart from "./Chard/RevenueChart/RevenueChart";
import MemberChart from "./Chard/MemberChart/MemberChart";
import TopSystem from "./Chard/Topsystem/TopSystem";
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
              {/* Nút chuyển đổi biểu đồ - đặt lên đầu */}
              <div className="chart-tabs">
                <button
                  className={`chart-tab ${
                    activeChart === "revenue" ? "active" : ""
                  }`}
                  onClick={() => setActiveChart("revenue")}
                >
                  <i className="fas fa-chart-line"></i> Revenue Statistics
                </button>
                <button
                  className={`chart-tab ${
                    activeChart === "package" ? "active" : ""
                  }`}
                  onClick={() => setActiveChart("package")}
                >
                  <i className="fas fa-box"></i> Service Package Distribution
                </button>
              </div>

              {/* Hiển thị biểu đồ tương ứng */}
              <div className="chart-container">
                {activeChart === "revenue" && (
                  <div className="chart-item active">
                    <h3>Revenue Statistics</h3>
                    <RevenueChart />
                  </div>
                )}

                {activeChart === "package" && (
                  <div className="chart-item active">
                    <h3>User Distribution by Service Package</h3>
                    <PackageChart onDataLoaded={handlePackageDataLoaded} />
                  </div>
                )}
              </div>

              {/* Hiển thị Top 3 bác sĩ được yêu cầu nhiều nhất */}
              <TopSystem />
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
