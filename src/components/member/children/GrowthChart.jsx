import React, { useState, useEffect } from 'react';
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
import './GrowthChart.css';
import childApi from "../../../services/childApi";

const GrowthChart = ({ childName, selectedTool, onRecordSelect, refreshTrigger = 0 }) => {
  const [data, setData] = useState({ months: [], records: [] });
  const [loading, setLoading] = useState(true);

  // Hàm tính BMI
  const calculateBMI = (weight, height) => {
    console.log('calculateBMI input:', { weight, height });
    
    // Kiểm tra giá trị đầu vào
    const validWeight = parseFloat(weight);
    const validHeight = parseFloat(height);
    
    if (isNaN(validWeight) || isNaN(validHeight) || validWeight <= 0 || validHeight <= 0) {
      console.log('BMI calculation skipped - invalid input');
      return null;
    }
    
    const heightInMeters = validHeight / 100;
    const bmi = Number((validWeight / (heightInMeters * heightInMeters)).toFixed(1));
    
    // Kiểm tra kết quả tính toán
    if (isNaN(bmi) || !isFinite(bmi)) {
      console.log('BMI calculation resulted in invalid value');
      return null;
    }
    
    console.log('Calculated BMI:', bmi);
    return bmi;
  };

  useEffect(() => {
    const fetchGrowthData = async () => {
      if (!childName) return;
      
      setLoading(true);
      try {
        const parentName = localStorage.getItem("name");
        const response = await childApi.getGrowthRecords(childName, parentName);
        console.log("Full API Response:", response);

        const records = Array.isArray(response.data) ? response.data : [response.data];
        const currentYear = new Date().getFullYear();
        
        // Xử lý và lọc dữ liệu
        const processedRecords = records
          .filter(record => record && (record.weight || record.height)) // Lọc bỏ record không có dữ liệu
          .map(record => {
            const recordDate = new Date(record.createdAt || record.recordDate);
            if (recordDate.getFullYear() !== currentYear) return null;

            const weight = parseFloat(record.weight);
            const height = parseFloat(record.height);
            
            if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) return null;
            
            const bmi = Number((weight / Math.pow(height / 100, 2)).toFixed(1));
            if (isNaN(bmi) || !isFinite(bmi)) return null;

            // Tính vị trí x dựa trên tháng và ngày
            const month = recordDate.getMonth();
            const day = recordDate.getDate();
            const x = month + (day - 1) / 31; // Vị trí x từ 0-11.99

            return {
              x,
              month: recordDate.toLocaleDateString('en-US', { month: 'short' }),
              date: recordDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
              bmi,
              weight,
              height,
              dayOfMonth: day,
              timestamp: recordDate.getTime()
            };
          })
          .filter(record => record !== null)
          .sort((a, b) => a.timestamp - b.timestamp);

        setData({
          months: Array.from({ length: 12 }, (_, i) => ({
            month: new Date(currentYear, i).toLocaleDateString('en-US', { month: 'short' }),
            index: i
          })),
          records: processedRecords
        });
      } catch (error) {
        console.error('Error fetching growth data:', error);
        setData({ months: [], records: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, [childName, refreshTrigger]);

  if (loading) {
    return <div className="loading">Loading chart...</div>;
  }

  const renderChart = () => {
    switch (selectedTool) {
      case 'BMI':
        if (!data.records || data.records.length === 0) {
          return (
            <div style={{ 
              height: '350px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#666' 
            }}>
              No BMI data available
            </div>
          );
        }

        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="x"
                type="number"
                domain={[0, 11]}
                ticks={[0,1,2,3,4,5,6,7,8,9,10,11]}
                tickFormatter={(value) => {
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return months[Math.floor(value)];
                }}
                stroke="#666"
                tick={{ fill: '#666', fontSize: 10 }}
              />
              <YAxis 
                yAxisId="bmi"
                orientation="left"
                stroke="#FF9AA2"
                tick={{ fill: '#666', fontSize: 11 }}
                domain={[10, 30]}
                ticks={[10, 15, 20, 25, 30]}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#B5EAD7"
                tick={{ fill: '#666', fontSize: 11 }}
                hide={true}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '10px'
                }}
                formatter={(value, name) => {
                  if (name === 'BMI') {
                    return [`${value}`, 'BMI (kg/m²)'];
                  }
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return `Date: ${payload[0].payload.date}`;
                  }
                  return '';
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={30}
                wrapperStyle={{
                  paddingTop: '5px',
                  fontSize: '12px'
                }}
              />
              <Line
                yAxisId="bmi"
                data={data.records}
                type="monotone"
                dataKey="bmi"
                stroke="#FF9AA2"
                strokeWidth={2}
                dot={{ fill: '#FF9AA2', r: 4 }}
                activeDot={{ r: 6, fill: '#FF9AA2' }}
                name="BMI"
                connectNulls={true}
                onClick={(point) => {
                  if (onRecordSelect && point) {
                    onRecordSelect(point);
                  }
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return <div>Select a measurement tool</div>;
    }
  };

  return (
    <div className="growth-chart-container">
      {renderChart()}
    </div>
  );
};

export default GrowthChart;