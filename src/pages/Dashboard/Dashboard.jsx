// src/pages/Dashboard/Dashboard.jsx
import ChartCard from "../../components/ChartCard/ChartCard";
import { FaBell } from "react-icons/fa";
import "./Dashboard.css";

function Dashboard() {
    // Ví dụ dữ liệu cho 12 tháng
    const chartData = [
        { name: "Jan", sales2022: 400, sales2023: 300 },
        { name: "Feb", sales2022: 500, sales2023: 400 },
        { name: "Mar", sales2022: 600, sales2023: 500 },
        { name: "Apr", sales2022: 700, sales2023: 600 },
        { name: "May", sales2022: 900, sales2023: 750 },
        { name: "Jun", sales2022: 1000, sales2023: 950 },
        { name: "Jul", sales2022: 1100, sales2023: 1000 },
        { name: "Aug", sales2022: 1200, sales2023: 1150 },
        { name: "Sep", sales2022: 1300, sales2023: 1200 },
        { name: "Oct", sales2022: 1400, sales2023: 1300 },
        { name: "Nov", sales2022: 1500, sales2023: 1400 },
        { name: "Dec", sales2022: 1600, sales2023: 1500 },
    ];

    return (
        <div className="dashboard-container">
            {/* Tiêu đề / breadcrumb / v.v. */}
            <div className="dashboard-header">
                <h2>
                    {/* Icon bell + text */}
                    <FaBell className="header-icon" />
                    Lorem Ipsum
                </h2>
            </div>

            {/* Vùng chứa các biểu đồ */}
            <div className="dashboard-charts">
                {/* Chart lớn phía trên */}
                <div className="dashboard-chart-large">
                    <ChartCard
                        title="Annual Sales Performance"
                        amount="127,092.22"
                        data={chartData}
                    />
                </div>

                {/* 2 chart nhỏ phía dưới */}
                <div className="dashboard-chart-row">
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
    );
}

export default Dashboard;
