// src/components/ChartCard/ChartCard.jsx
import PropTypes from "prop-types";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import "./ChartCard.css";

function ChartCard({ title, amount, data }) {
    return (
        <div className="chart-card">
            <h3 className="chart-title">{title}</h3>
            <p className="chart-amount">${amount}</p>
            <p className="chart-subtitle">Year-to-Date Sales Performance</p>

            <div className="chart-wrapper">
                <ResponsiveContainer width="80%" height={100}>
                    <LineChart data={data}>
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="sales2022" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="sales2023" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <button className="chart-report-btn">View Report</button>
        </div>
    );
}

// Khai báo propTypes
ChartCard.propTypes = {
    title: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            sales2022: PropTypes.number,
            sales2023: PropTypes.number,
        })
    ).isRequired,
};

export default ChartCard;
