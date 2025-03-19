// Home.jsx
import React from "react";
import { Row, Col, Card, Typography, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import DoctorCalendar from "../../Doctor/DashBoardDoctor/DoctorCalendar";
import "./Home.css"; // file CSS riêng cho Home

const { Title, Text } = Typography;

const Home = ({ doctorInfo }) => {
  return (
    <div className="home-container">
      <Row gutter={16}>
        {/* Cột trái */}
        <Col xs={24} md={16}>
          <Card className="home-welcome-card">
            <Title level={2} style={{ marginBottom: 8 }}>
              Hello, {doctorInfo.name}!
            </Title>
            <Text type="secondary">
              {/* ví dụ: Ngày giờ hiện tại, hoặc status */}
              Today is {new Date().toLocaleDateString()} — Hope you have a good day!
            </Text>
            {/* Thêm card diagnosis, tests, drugs, ... tuỳ ý */}
          </Card>

          <Card className="home-latest-results" style={{ marginTop: 16 }}>
            <Title level={4} style={{ marginBottom: 8 }}>
              Latest Results
            </Title>
            <Text>• Diagnosis: ...</Text> <br />
            <Text>• Tests: ...</Text> <br />
            <Text>• Drugs: ...</Text>
          </Card>
        </Col>

        {/* Cột phải */}
        <Col xs={24} md={8}>
          {/* Profile Card (avatar, specialty, v.v.) */}
          <Card className="home-profile-card">
            <Avatar
              size={80}
              src={doctorInfo.profilePicture}
              icon={<UserOutlined />}
              style={{ marginBottom: 8 }}
            />
            <Title level={4} style={{ margin: 0 }}>
              {doctorInfo.name}
            </Title>
            <Text type="secondary">{doctorInfo.specialty}</Text>
          </Card>

          {/* Calendar */}
          <Card className="home-calendar-card" style={{ marginTop: 16 }}>
            <Title level={5} style={{ marginBottom: 16 }}>
              Appointment Calendar
            </Title>
            <DoctorCalendar />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
