// src/components/admin/ChartCard.jsx
import React from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import dayjs from "dayjs";
import "./ChartCard.css";

function ChartCard({ title, amount, data }) {
    return (
        <div className="chart-card">
            <h4>{title}</h4>
            <p className="chart-amount">${amount}</p>

            <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                    <LineChart data={data}>
                        {/* Trục X: date */}
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => dayjs(value).format("MMM DD")}
                        />
                        <YAxis />
                        <Tooltip
                            labelFormatter={(label) => dayjs(label).format("MMM DD, YYYY")}
                        />

                        <Line type="monotone" dataKey="sales2022" stroke="#8884d8" />
                        <Line type="monotone" dataKey="sales2023" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <button className="chart-btn">View Report</button>
        </div>
    );
}

export default ChartCard;
