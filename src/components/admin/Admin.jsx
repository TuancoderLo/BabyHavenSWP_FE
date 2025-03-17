// src/pages/Admin/Admin.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarHover from "../../components/admin/Sidebar/SidebarHover";
import Topbar from "../../components/admin/Topbar/Topbar";
import PackageChart from "../../components/admin/PackageChart/PackageChart";
import RevenueChart from "../../components/admin/RevenueChart/RevenueChart";
import MemberChart from "../../components/admin/MemberChart/MemberChart";
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
            <div className="admin-dashboard">
              <div className="chart-grid">
                <div className="chart-item">
                  <h3>Thống kê doanh thu</h3>
                  <RevenueChart />
                </div>
                <div className="chart-item">
                  <h3>Phân bố người dùng theo gói dịch vụ</h3>
                  <PackageChart />
                </div>
                <div className="chart-item">
                  <h3>Thống kê thành viên mới</h3>
                  <MemberChart />
                </div>
                <div className="info-item">
                  <h3>Tóm tắt doanh thu</h3>
                  <p>Tổng doanh thu tháng này: 50.000.000 VNĐ</p>
                  <p>Tăng trưởng: +15% so với tháng trước</p>
                </div>
                <div className="info-item">
                  <h3>Tóm tắt gói dịch vụ</h3>
                  <p>Gói phổ biến nhất: Premium</p>
                  <p>Tỷ lệ chuyển đổi: 25%</p>
                </div>
                <div className="info-item">
                  <h3>Tóm tắt hoạt động</h3>
                  <p>Người dùng hoạt động: 1.250</p>
                  <p>Thời gian trung bình: 45 phút/ngày</p>
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
