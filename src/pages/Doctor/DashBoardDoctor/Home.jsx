import React, { useState, useEffect } from 'react';
import './Home.css';
import Doctor from "../../../assets/doctor.jpg";
import { FaSearch, FaBell, FaCog, FaArrowUp, FaArrowDown, FaArrowRight } from 'react-icons/fa';
import doctorApi from '../../../services/DoctorApi';
import DoctorCalendar from './DoctorCalendar';

const Home = () => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [doctorInfo, setDoctorInfo] = useState(null);

  // Mẫu dữ liệu thống kê (có thể thay bằng dữ liệu thật từ API)
  const statsData = [
    {
      title: "Total Requests",
      value: "41 requests received",
      change: "+8% than last month",
      type: "positive"  // có thể là 'positive', 'negative', 'neutral'
    },
    {
      title: "Total Responses",
      value: "36 responses sent",
      change: "+10% than last month",
      type: "positive"
    },
    {
      title: "Average Rating",
      value: "4.7 / 5",
      change: "+5% than last month",
      type: "positive"
    }
  ];

  // Mẫu danh sách bài blog (có thể thay bằng dữ liệu thật từ API)
  const [recentPosts] = useState([
    {
      title: "Understanding Hypertension",
      snippet: "Hypertension is one of the leading risk factors for heart disease..."
    },
    {
      title: "Benefits of Daily Cardio",
      snippet: "Regular cardiovascular exercise can significantly reduce the risk of..."
    }
  ]);

  // Hàm xác định icon mũi tên cho thay đổi thống kê
  const getChangeIcon = (type) => {
    if (type === 'positive') return <FaArrowUp style={{ color: 'green', marginRight: '4px' }} />;
    if (type === 'negative') return <FaArrowDown style={{ color: 'red', marginRight: '4px' }} />;
    return <FaArrowRight style={{ color: '#888', marginRight: '4px' }} />;
  };

  // Cập nhật thời gian hiện tại
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

  // Lấy thông tin bác sĩ theo doctorId từ localStorage
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

        {/* Thống kê nhanh (Quick Stats) */}
        <div className="quick-stats-doctor">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-card-doctor">
              <h4>{stat.title}</h4>
              <p>{stat.value}</p>
              <p className={`stat-change-doctor ${stat.type}`}>
                {getChangeIcon(stat.type)}
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* My Blog Section */}
        <div className="blog-section-doctor">
          <h4>My Blog</h4>
          {recentPosts.map((post, index) => (
            <div key={index} className="blog-post-card">
              <h5>{post.title}</h5>
              <p>{post.snippet}</p>
            </div>
          ))}
          <button className="create-post-btn">Create New Post</button>
        </div>
      </div>

      {/* Phần bên phải */}
      <div className="right-section">
        {/* Thông tin bác sĩ */}
        <div className="profile-section-doctor">
          <img src={Doctor} alt="Profile" className="profile-image-doctor" />
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

        {/* Calendar */}
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
