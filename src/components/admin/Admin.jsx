// src/pages/Admin/Admin.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarHover from "../../components/admin/Sidebar/SidebarHover";
import Topbar from "../../components/admin/Topbar/Topbar";
import ChartCard from "../../components/admin/ChartCard/ChartCard";
import PackageChart from "../../components/admin/PackageChart/PackageChart";
import RevenueChart from "../../components/admin/RevenueChart/RevenueChart";
import "./Admin.css";

function Admin() {
  // State chứa data chart (có trường date)
  const [chartData, setChartData] = useState([]);
  const location = useLocation();

  useEffect(() => {
    // fetch("/api/endpoint")
    //   .then(res => res.json())
    //   .then(data => setChartData(data))
    //   .catch(err => console.error(err));

    // Tạm mock data
    const mockData = [
      { date: "2023-01-01", sales2022: 400, sales2023: 300 },
      { date: "2023-02-01", sales2022: 500, sales2023: 400 },
      { date: "2023-03-01", sales2022: 600, sales2023: 500 },
      { date: "2023-04-01", sales2022: 700, sales2023: 600 },
      { date: "2023-05-01", sales2022: 900, sales2023: 750 },
      { date: "2023-06-01", sales2022: 1000, sales2023: 950 },
      { date: "2023-07-01", sales2022: 1100, sales2023: 1000 },
      { date: "2023-08-01", sales2022: 1200, sales2023: 1150 },
      { date: "2023-09-01", sales2022: 1300, sales2023: 1200 },
      { date: "2023-10-01", sales2022: 1400, sales2023: 1300 },
      { date: "2023-11-01", sales2022: 1500, sales2023: 1400 },
      { date: "2023-12-01", sales2022: 1600, sales2023: 1500 },
    ];
    setChartData(mockData);
  }, []);

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
                {/* Biểu đồ doanh số */}
                <div className="chart-item">
                  <ChartCard data={chartData} />
                </div>

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
    //=======================================================================================================
  );
}

export default Admin;
