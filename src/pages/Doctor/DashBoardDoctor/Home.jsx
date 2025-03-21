import React, { useState, useEffect } from 'react';
import './Home.css';
import Doctor from "../../../assets/doctor.jpg";
import { FaSearch, FaBell, FaCog } from 'react-icons/fa';
import doctorApi from '../../../services/DoctorApi';
import DoctorCalendar from './DoctorCalendar';

const Home = () => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [doctorInfo, setDoctorInfo] = useState(null);

  // Logic to update current date and time
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

  // Logic to fetch doctor info using doctorId from localStorage
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId');
        if (!doctorId) {
          console.error('DoctorId not found in localStorage');
          return;
        }

        // Call getDoctorById API
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
      {/* Left Section (unchanged) */}
      <div className="left-section">
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

        <div className="welcome-section">
          <div className="date-time-box">
            <span>{currentDateTime}</span>
          </div>
          <div className="welcome-text">
            <h1>Good Day, {doctorInfo ? doctorInfo.name : 'Dr. Nicholls'}!</h1>
            <p>Have a Nice Monday!</p>
          </div>
        </div>

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

      {/* Right Section */}
      <div className="right-section">
        {/* Profile Section with API Data */}
        <div className="profile-section-doctor">
          <img src={Doctor} alt="Profile-doctor" className="profile-image-doctor" />
          <h3>{doctorInfo ? doctorInfo.name : 'Dr. Alisha Nicholls'}</h3>
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