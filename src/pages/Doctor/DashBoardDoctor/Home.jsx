import React, { useState, useEffect } from 'react';
import './Home.css';
import Doctor from "../../../assets/doctor.jpg";
import { 
  FaSearch, FaBell, FaCog, FaArrowUp, FaArrowDown, FaArrowRight 
} from 'react-icons/fa';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import doctorApi from '../../../services/DoctorApi';
import DoctorCalendar from './DoctorCalendar';
import doctorImages from '../../../data/doctorImages'; // Import the doctor images

const Home = () => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [totals] = useState({
    totalRequests: 30,
    totalResponses: 20,
    averageRating: 4.5,
    blogPosts: 23
  });

  
  // Cập nhật thời gian hiển thị
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
      const date = now.toLocaleDateString('en-US', dateOptions);
      const time = now.toLocaleTimeString('en-US', timeOptions).toLowerCase();
      setCurrentDateTime(`${date} - ${time}`);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Lấy thông tin bác sĩ
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId');
        if (!doctorId) {
          console.error('DoctorId not found in localStorage');
          return;
        }
        const doctorResponse = await doctorApi.getDoctorById(doctorId);
        const doctor = doctorResponse.data;
        if (!doctor) {
          console.error('Doctor not found for this doctorId:', doctorId);
          return;
        }
        setDoctorInfo(doctor);
      } catch (error) {
        console.error('Error fetching doctor:', error);
      }
    };
    fetchDoctorInfo();
  }, []);

  // Dữ liệu mẫu cho các mini chart trong mỗi stat card (hard-coded)
  const statsData = [
    {
      title: "Total Requests",
      value: `${totals.totalRequests} requests received`,
      change: "+8% than last month",
      type: "positive",
      chartData: [
        { time: "Jan", value: 5 },
        { time: "Feb", value: 8 },
        { time: "Mar", value: 12 },
        { time: "Apr", value: totals.totalRequests || 12 },
      ],
    },
    {
      title: "Total Responses",
      value: `${totals.totalResponses} responses sent`,
      change: "+10% than last month",
      type: "positive",
      chartData: [
        { time: "Jan", value: 3 },
        { time: "Feb", value: 6 },
        { time: "Mar", value: 9 },
        { time: "Apr", value: totals.totalResponses || 9 },
      ],
    },
    {
      title: "Average Rating",
      value: `${totals.averageRating} / 5`,
      change: "+5% than last month",
      type: "positive",
      chartData: [
        { time: "Jan", value: 3.5 },
        { time: "Feb", value: 3.8 },
        { time: "Mar", value: 4.0 },
        { time: "Apr", value: totals.averageRating || 4.0 },
      ],
    },
    {
      title: "Blog Posts",
      value: `${totals.blogPosts} posts published`,
      change: "+3 posts this month",
      type: "positive",
      chartData: [
        { time: "Jan", value: 18 },
        { time: "Feb", value: 19 },
        { time: "Mar", value: 21 },
        { time: "Apr", value: totals.blogPosts },
      ],
    },
  ];

  // Hàm trả về icon xu hướng dựa vào type
  const getChangeIcon = (type) => {
    if (type === 'positive') return <FaArrowUp style={{ color: 'green', marginRight: '4px' }} />;
    if (type === 'negative') return <FaArrowDown style={{ color: 'red', marginRight: '4px' }} />;
    return <FaArrowRight style={{ color: '#888', marginRight: '4px' }} />;
  };

  return (
    <div className="home-container-doctor">
      {/* Phần bên trái */}
      <div className="left-section">
        <div className="header-doctor">
          <div className="search-bar-doctor">
            <input type="text" placeholder="Search for requests, patients, etc." />
            <span className="search-icon-doctor"><FaSearch /></span>
          </div>
          <div className="header-icons-doctor">
            <span className="notification-icon-doctor"><FaBell /></span>
            <span className="settings-icon-doctor"><FaCog /></span>
          </div>
        </div>

        <div className="welcome-section">
          <div className="date-time-box">
            <span>{currentDateTime}</span>
          </div>
          <div className="welcome-text">
            <h1>Welcome, {doctorInfo ? doctorInfo.name : 'Doctor'}!</h1>
            <p>Here is a summary of your recent activities.</p>
          </div>
        </div>

        {/* Quick Stats Section: Grid 2 cột */}
        <div className="quick-stats-doctor">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-card-doctor">
              <h4>{stat.title}</h4>
              <p>{stat.value}</p>
              {/* Mini Chart trong card */}
              <div className="mini-chart">
                <ResponsiveContainer width="100%" height={50}>
                  <LineChart data={stat.chartData}>
                    <Line type="monotone" dataKey="value" stroke="#4a90e2" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className={`stat-change-doctor ${stat.type}`}>
                {stat.change && getChangeIcon(stat.type)}
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Phần bên phải */}
      <div className="right-section">
      <div className="profile-section-doctor">
  <img
    src={doctorInfo ? (doctorImages[doctorInfo.doctorId] || "/assets/default-doctor.jpg") : "/assets/default-doctor.jpg"}
    alt="Profile"
    className="profile-image-doctor"
  />
  <h3>{doctorInfo ? doctorInfo.name : 'Dr. John Doe'}</h3>
  <p className="specialty">{doctorInfo ? doctorInfo.degree : 'Online Consultant'}</p>
  <p className="location">📍 {doctorInfo ? doctorInfo.hospitalAddress : 'Remote'}</p>
  <p className="biography">{doctorInfo ? doctorInfo.biography : 'N/A'}</p>
  <div className="profile-details-doctor">
    <div>
      <p>Phone</p>
      <p>{doctorInfo ? doctorInfo.phoneNumber : 'N/A'}</p>
    </div>
    <div>
      <p>Hospital</p>
      <p>{doctorInfo ? doctorInfo.hospitalName : 'N/A'}</p>
    </div>
  </div>
</div>

        <div className="calendar-schedule">
          <div className="calendar-section-doctor">
            <h4>My Calendar</h4>
            <DoctorCalendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
