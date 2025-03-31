import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import moment from 'moment';
import './GrowthChart.css';

const WeightHeightChart = ({ data, type }) => {
  const formatData = data.map(record => ({
    date: moment(record.createdAt).format('DD/MM/YYYY'),
    value: type === 'Weight' ? record.weight : record.height
  }));

  return (
    <div className="growth-chart-container">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={formatData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={['auto', 'auto']}
            label={{ 
              value: type === 'Weight' ? 'Weight (kg)' : 'Height (cm)', 
              angle: -90, 
              position: 'insideLeft' 
            }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke={type === 'Weight' ? "#8884d8" : "#82ca9d"}
            name={type}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightHeightChart;