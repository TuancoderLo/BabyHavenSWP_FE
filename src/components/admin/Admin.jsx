// src/pages/Admin/Admin.jsx
import React, { useState, useEffect } from "react";
import SidebarHover from "../../components/admin/Sidebar/SidebarHover";
import Topbar from "../../components/admin/Topbar/Topbar";
import ChartCard from "../../components/admin/ChartCard/ChartCard";
import "./Admin.css";

function Admin() {
  // State chứa data chart (có trường date)
  const [chartData, setChartData] = useState([]);

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

        {/* Phần nội dung Dashboard */}
        <div className="admin-content">
          <div className="admin-header">
            <h2>Lorem Ipsum</h2>
          </div>

          <div className="admin-charts">
            {/* Chart lớn */}
            <div className="chart-large">
              <ChartCard
                title="Annual Sales Performance"
                amount="127,092.22"
                data={chartData}
              />
            </div>

            {/* 2 chart nhỏ phía dưới */}
            <div className="chart-row">
              <ChartCard
                title="Annual Sales Performance"
                amount="127,092.22"
                data={chartData}
              />
              <ChartCard
                title="Annual Sales Performance"
                amount="127,092.22"
                data={chartData}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;