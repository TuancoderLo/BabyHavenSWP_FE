import React, { useState, useEffect } from 'react';
import './Home.css';
import Logo from "../../../assets/Logo.png";
import Name from "../../../assets/Name.png";
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
          <img src={Logo} alt="Doctor" className="doctor-image" />
        </div>

        {/* Quick Stats */}
        <div className="quick-stats-doctor">
          <div className="stat-card-doctor">
            <h4>Offline Work</h4>
            <p>27 hospital patients</p>
            <p className="stat-change negative-doctor">-6% than average</p>
          </div>
          <div className="stat-card-doctor">
            <h4>Online Work</h4>
            <p>9 online consultations</p>
            <p className="stat-change positive-doctor">+12% than average</p>
          </div>
          <div className="stat-card-doctor">
            <h4>Laboratory Work</h4>
            <p>19 laboratory analyses</p>
            <p className="stat-change neutral">+0% than average</p>
          </div>
        </div>

        {/* Scheduled Events & Plans Done */}
        <div className="events-plans">
          <div className="scheduled-events-doctor">
            <h4>My Scheduled Events</h4>
            <div className="progress-circle-doctor">
              <span>95%</span>
              <p>Busyness</p>
            </div>
            <div className="event-stats-doctor">
              <p><span className="dot blue"></span> 25 Consultations</p>
              <p><span className="dot pink"></span> 10 Laboratory analyses</p>
              <p><span className="dot light-blue"></span> 3 Meetings</p>
            </div>
          </div>

          <div className="plans-done-doctor">
            <h4>My Plans Done</h4>
            <p>Today</p>
            <div className="progress-bar-doctor">
              <p>Consultations</p>
              <div className="bar"><div className="fill blue" style={{ width: '64%' }}></div></div>
              <p>64%</p>
            </div>
            <div className="progress-bar-doctor">
              <p>Analyses</p>
              <div className="bar"><div className="fill pink" style={{ width: '50%' }}></div></div>
              <p>50%</p>
            </div>
            <div className="progress-bar-doctor">
              <p>Meetings</p>
              <div className="bar"><div className="fill light-blue" style={{ width: '33%' }}></div></div>
              <p>33%</p>
            </div>
            <button className="add-plan">Add plan +</button>
          </div>
        </div>
      </div>

      {/* Phần bên phải */}
      <div className="right-section">
        {/* Profile Section */}
        <div className="profile-section-doctor">
          <img src={Name} alt="Profile-doctor" className="profile-image-doctor" />
          <h3>{doctorInfo ? doctorInfo.name : 'Dr. Alisha Nicholls'}</h3>
          <p className="specialty">{doctorInfo ? doctorInfo.degree : 'Dermatologist'}</p>
          <p className="location">📍 {doctorInfo ? doctorInfo.hospitalAddress : 'Bottrop, Germany'}</p>
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
              <p>9pm - 5am</p>
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
              <li><span className="dot pink"></span> 2:00 pm - Meeting with chief physician Dr. Williams</li>
              <li><span className="dot blue"></span> 2:30 pm - Consultation with Mr. White</li>
              <li><span className="dot green"></span> 3:00 pm - Consultation with Mrs. Maisy</li>
              <li><span className="dot purple"></span> 3:30 pm - Examination of Mrs. Lee's freckle</li>
              <li><span className="dot pink"></span> 4:00 pm - Meeting with gastroenterologist Dr. Alice</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;