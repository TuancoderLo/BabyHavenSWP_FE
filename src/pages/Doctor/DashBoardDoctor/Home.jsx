import React from "react";
import { Card, Col, Row, Statistic, Progress, Timeline } from "antd";
import { CalendarOutlined, UserOutlined, FileTextOutlined } from "@ant-design/icons";
import "./Home.css";

const Home = () => {
  return (
    <div className="doctor-home-container">
      <Row gutter={24}>
        {/* Profile and Greeting */}
        <Col span={8}>
          <Card className="home-profile-card">
            <div className="home-greeting">
              <h2>Good Day, Dr. Nicholls!</h2>
              <p>Have a Nice Monday!</p>
            </div>
            <div className="home-doctor-info">
              <img src="/path-to-profile-picture.jpg" alt="Doctor" />
              <div className="doctor-details">
                <h3>Dr. Alisha Nicholls</h3>
                <p>Dermatologist | Bottrop, Germany</p>
                <p>Blood Type: (A)(II) Rh+</p>
                <p>Working Hours: 9pm - 5am</p>
              </div>
            </div>
          </Card>
        </Col>

        {/* Statistics Section */}
        <Col span={16}>
          <Row gutter={24}>
            <Col span={8}>
              <Card className="home-stat-card">
                <Statistic title="Scheduled Consultations" value={25} prefix={<UserOutlined />} />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="home-stat-card">
                <Statistic title="Appointments" value={9} prefix={<CalendarOutlined />} />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="home-stat-card">
                <Statistic title="Pending Record Requests" value={5} prefix={<FileTextOutlined />} />
              </Card>
            </Col>
          </Row>

          {/* Plans Section */}
          <Card className="home-plans-card">
            <h4>My Plans for Today</h4>
            <Row gutter={24}>
              <Col span={8}>
                <Statistic title="Consultations" value={25} suffix="/" precision={2} />
                <Progress percent={64} size="small" />
              </Col>
              <Col span={8}>
                <Statistic title="Analysis" value={10} suffix="/" precision={2} />
                <Progress percent={33} size="small" />
              </Col>
              <Col span={8}>
                <Statistic title="Meetings" value={3} suffix="/" precision={2} />
                <Progress percent={55} size="small" />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Calendar Section */}
      <Card className="home-calendar-card">
        <h4>My Calendar</h4>
        <Timeline mode="left">
          <Timeline.Item color="green">
            2:00 pm - Meeting with Chief Physician Dr. Williams
          </Timeline.Item>
          <Timeline.Item color="blue">
            3:00 pm - Consultation with Mr. White
          </Timeline.Item>
          <Timeline.Item color="red">
            3:30 pm - Consultation with Mrs. Maisy
          </Timeline.Item>
        </Timeline>
      </Card>
    </div>
  );
};

export default Home;