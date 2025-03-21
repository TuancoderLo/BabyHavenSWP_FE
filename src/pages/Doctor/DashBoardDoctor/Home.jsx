import React, { useState, useEffect } from 'react';
import './Home.css';
import Doctor from "../../../assets/doctor.jpg";
import { FaSearch, FaBell, FaCog } from 'react-icons/fa';
import doctorApi from '../../../services/DoctorApi';

const Home = () => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [doctorInfo, setDoctorInfo] = useState(null);

  // Logic để lấy ngày giờ hiện tại
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

  // Logic để lấy thông tin bác sĩ và lưu doctorId
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        // Lấy userId từ localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.error('UserId not found in localStorage');
          return;
        }

        // Gọi API để lấy thông tin bác sĩ theo userId
        const doctorResponse = await doctorApi.getDoctorByUserId(userId);
        const doctor = doctorResponse.data; // Assuming the API returns { data: {...} }

        if (!doctor) {
          console.error('Doctor not found for this userId:', userId);
          return;
        }

        // Lưu doctorId vào localStorage
        localStorage.setItem('doctorId', doctor.doctorId);
        setDoctorInfo(doctor); // Lưu thông tin bác sĩ để hiển thị
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
        {/* Header */}
        <div className="header-doctor">
          <div className="search-bar-doctor">
            <input type="text" placeholder="Search for events, patients etc." />
            <span className="search-icon-doctor"><FaSearch /></span>
          </div>
          <div className="header-icons-doctor">
            <span className="notification-icon-doctor"><FaBell /></span>
            <span className="settings-icon-doctor"><FaCog /></span>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="date-time-box">
            <span>{currentDateTime}</span>
          </div>
          <div className="welcome-text">
            <h1>Good Day, {doctorInfo ? doctorInfo.name : 'Dr. Nicholls'}!</h1>
            <p>Have a Nice Monday!</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats-doctor">
          <div className="stat-card-doctor">
            <h4>Total Requests</h4>
            <p>41 requests received</p>
            <p className="stat-change positive-doctor">+8% than last month</p>
          </div>
          <div className="stat-card-doctor">
            <h4>Total Responses</h4>
            <p>36 responses sent</p>
            <p className="stat-change positive-doctor">+10% than last month</p>
          </div>
          <div className="stat-card-doctor">
            <h4>Pending Requests</h4>
            <p>5 requests pending</p>
            <p className="stat-change neutral">+0% than last month</p>
          </div>
        </div>
        {/* Scheduled Events & Plans Done */}
        <div className="events-plans">
          <div className="scheduled-events-doctor">
            <h4>My Scheduled Online Events</h4>
            <div className="progress-circle-doctor">
              <span>85%</span>
              <p>Busyness</p>
            </div>
            <div className="event-stats-doctor">
              <p><span className="dot blue"></span> 25 Online Consultations</p>
              <p><span className="dot green"></span> 10 Request Responses</p>
            </div>
          </div>

          <div className="plans-done-doctor">
            <h4>My Online Plans Done</h4>
            <p>Today</p>
            <div className="progress-bar-doctor">
              <p>Consultations</p>
              <div className="bar"><div className="fill blue" style={{ width: '70%' }}></div></div>
              <p>70%</p>
            </div>
            <div className="progress-bar-doctor">
              <p>Responses</p>
              <div className="bar"><div className="fill green" style={{ width: '60%' }}></div></div>
              <p>60%</p>
            </div>
            <button className="add-plan">Add plan +</button>
          </div>
        </div>
      </div>

      {/* Phần bên phải */}
      <div className="right-section">
        {/* Profile Section */}
        <div className="profile-section-doctor">
          <img src={Doctor} alt="Profile-doctor" className="profile-image-doctor" />
          <h3>{doctorInfo ? doctorInfo.name : 'Dr. Alisha Nicholls'}</h3>
          <p className="specialty">{doctorInfo ? doctorInfo.degree : 'Online Consultant'}</p>
          <p className="location">📍 {doctorInfo ? doctorInfo.hospitalAddress : 'Remote'}</p>
          <div className="profile-details-doctor">
            <div>
              <p>Date Birth</p>
              <p>{doctorInfo && doctorInfo.user ? doctorInfo.user.dateOfBirth : '17.07.86'}</p>
            </div>
            <div>
              <p>Blood</p>
              <p>A(II) Rh+</p>
            </div>
            <div>
              <p>Working Hours</p>
              <p>9am - 5pm (Online)</p>
            </div>
          </div>
        </div>

        {/* Calendar & Detailed Schedule */}
        <div className="calendar-schedule">
          <div className="calendar-section-doctor">
            <h4>My Calendar</h4>
            <div className="calendar-days-doctor">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            <div className="calendar-dates-doctor">
              <span>12</span>
              <span className="current-day-doctor">13</span>
              <span>14</span>
              <span>15</span>
              <span>16</span>
              <span>17</span>
              <span>18</span>
            </div>
          </div>

          <div className="detailed-schedule-doctor">
            <h4>April 13</h4>
            <ul>
              <li><span className="dot blue"></span> 2:00 pm - Online Consultation with Mr. White</li>
              <li><span className="dot green"></span> 2:30 pm - Response to Mrs. Maisy’s Request</li>
              <li><span className="dot blue"></span> 3:00 pm - Online Consultation with Mrs. Lee</li>
              <li><span className="dot green"></span> 3:30 pm - Response to Mr. Smith’s Request</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;