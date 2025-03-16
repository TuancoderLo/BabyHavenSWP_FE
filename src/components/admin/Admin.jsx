// src/pages/Admin/Admin.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarHover from "../../components/admin/Sidebar/SidebarHover";
import Topbar from "../../components/admin/Topbar/Topbar";
import PackageChart from "../../components/admin/PackageChart/PackageChart";
import RevenueChart from "../../components/admin/RevenueChart/RevenueChart";
import "./Admin.css";

function Admin() {
  const location = useLocation();

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
            <div className="dashboard-container">
              <div className="dashboard-charts">
                {/* Biểu đồ phân bố package */}
                <div className="chart-item">
                  <PackageChart />
                </div>

                {/* Biểu đồ doanh thu và thành viên mới */}
                <div className="chart-item chart-item-full">
                  <RevenueChart />
                </div>
              </div>

              <div className="dashboard-info">
                {/* Khu vực thông tin bổ sung */}
                <div className="info-section">
                  {/* Nội dung thông tin sẽ được thêm sau */}
                </div>
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
