import React, { useState, useEffect } from 'react';
import './Home.css';
import Doctor from "../../../assets/doctor.jpg";
import { 
  FaSearch, FaBell, FaCog, FaArrowUp, FaArrowDown, FaArrowRight 
} from 'react-icons/fa';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import doctorApi from '../../../services/DoctorApi';
import DoctorCalendar from './DoctorCalendar';

const Home = () => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [totals, setTotals] = useState({
    totalRequests: 0,
    totalResponses: 0,
    averageRating: 0,
    blogPosts: 23 // Số bài blog hiện có (dummy data)
  });

  // Hàm lấy chi tiết của một yêu cầu tư vấn (dựa trên logic từ Consultation.jsx)
  const fetchConsultationRequestsById = async (requestId) => {
    try {
      const response = await doctorApi.getConsultationRequestsById(requestId);
      return response.data;
    } catch (error) {
      console.error(`Error fetching consultation detail for ${requestId}:`, error);
      return { status: "Pending" };
    }
  };

  // Hàm tính tổng số liệu từ dữ liệu tư vấn
  const fetchConsultationTotals = async () => {
    const doctorId = localStorage.getItem("doctorId");
    if (!doctorId) {
      console.error("Doctor ID not found in localStorage");
      return;
    }

    let allRequests = [];

    // Lấy danh sách yêu cầu tư vấn thông thường
    try {
      const response = await doctorApi.getConsultationRequestsByDoctorOData(doctorId);
      const requests = Array.isArray(response) ? response : response.data;
      for (const req of requests) {
        try {
          const detail = await fetchConsultationRequestsById(req.requestId);
          let responses = [];
          try {
            const responseData = await doctorApi.getConsultationResponsesOData(`?$filter=requestId eq ${req.requestId}`);
            responses = responseData.data || [];
          } catch (respError) {
            console.error(`Error fetching responses for request ${req.requestId}:`, respError);
          }
          const latestResponse = responses[0] || {};
          let rating = 0;
          if (latestResponse.responseId) {
            try {
              const feedbackResponse = await doctorApi.getRatingFeedbackByResponseId(latestResponse.responseId);
              const feedbackData = feedbackResponse.data[0] || {};
              rating = feedbackData.rating || 0;
            } catch (error) {
              console.error(`Error fetching rating for response ${latestResponse.responseId}:`, error);
            }
          }
          allRequests.push({
            id: req.requestId,
            status: detail.status || "Pending",
            response: latestResponse.content || "",
            rating: rating,
          });
        } catch (error) {
          console.error(`Error processing request ${req.requestId}:`, error);
        }
      }
    } catch (error) {
      console.error("Error fetching consultation requests:", error);
    }

    // Lấy danh sách yêu cầu tư vấn đang diễn ra (Approved)
    try {
      const ongoingResponse = await doctorApi.getConsultationRequestsByDoctorAndStatus(doctorId, "Approved");
      const ongoingRequests = Array.isArray(ongoingResponse) ? ongoingResponse : ongoingResponse.data;
      for (const req of ongoingRequests) {
        try {
          const detail = await fetchConsultationRequestsById(req.requestId);
          let responses = [];
          try {
            const responseData = await doctorApi.getConsultationResponsesOData(`?$filter=requestId eq ${req.requestId}`);
            responses = responseData.data || [];
          } catch (respError) {
            console.error(`Error fetching responses for ongoing request ${req.requestId}:`, respError);
          }
          const latestResponse = responses[0] || {};
          let rating = 0;
          if (latestResponse.responseId) {
            try {
              const feedbackResponse = await doctorApi.getRatingFeedbackByResponseId(latestResponse.responseId);
              const feedbackData = feedbackResponse.data[0] || {};
              rating = feedbackData.rating || 0;
            } catch (error) {
              console.error(`Error fetching rating for ongoing response ${latestResponse.responseId}:`, error);
            }
          }
          allRequests.push({
            id: req.requestId,
            status: detail.status || "Approved",
            response: latestResponse.content || "",
            rating: rating,
          });
        } catch (error) {
          console.error(`Error processing ongoing request ${req.requestId}:`, error);
        }
      }
    } catch (error) {
      console.error("Error fetching ongoing consultations:", error);
    }

    // Tính toán tổng số yêu cầu, tổng số phản hồi và trung bình rating
    const totalRequests = allRequests.length;
    const totalResponses = allRequests.filter(req => req.response && req.response.trim() !== "").length;
    const rated = allRequests.filter(req => req.rating > 0);
    const averageRating = rated.length > 0 ? (rated.reduce((acc, req) => acc + req.rating, 0) / rated.length).toFixed(1) : 0;

    setTotals({
      totalRequests,
      totalResponses,
      averageRating,
      blogPosts: totals.blogPosts
    });
  };

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

  // Gọi hàm tính tổng số liệu khi component được mount
  useEffect(() => {
    fetchConsultationTotals();
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
