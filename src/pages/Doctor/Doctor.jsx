import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  Badge,
  Tabs,
  Spin,
  message,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  MessageOutlined,
  FileOutlined,
  BellOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Bio from "./DashBoardDoctor/Bio";
import Request from "./DashBoardDoctor/Request";
import Response from "./DashBoardDoctor/Response";
import RecordRequest from "./DashBoardDoctor/RecordRequest";
import "./Doctor.css";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Doctor = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState({
    name: "",
    specialty: "",
    profilePicture: "",
    notifications: 0,
  });

  useEffect(() => {
    // Kiểm tra xác thực và vai trò
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("role");

    if (!isAuthenticated || role !== "2") {
      message.error("Bạn không có quyền truy cập trang này");
      navigate("/login");
      return;
    }

    // Lấy thông tin doctor từ localStorage
    const name = localStorage.getItem("name") || "Bác sĩ";
    const profilePicture = localStorage.getItem("profilePicture") || "";

    // Trong thực tế, bạn sẽ gọi API để lấy thông tin chi tiết của bác sĩ
    setDoctorInfo({
      name: name,
      specialty: "Nhi khoa", // Mặc định, trong thực tế sẽ lấy từ API
      profilePicture: profilePicture,
      notifications: 5, // Giả lập có 5 thông báo mới
    });
  }, [navigate]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleLogout = () => {
    // Xóa thông tin đăng nhập
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("roleId");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("profilePicture");

    // Chuyển hướng về trang đăng nhập
    navigate("/login");
  };

  return (
    <Layout className="doctor-dashboard">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="doctor-sider"
      >
        <div className="doctor-logo">{collapsed ? "BH" : "Baby Haven"}</div>
        <div className="doctor-profile">
          <Avatar
            size={collapsed ? 50 : 80}
            src={doctorInfo.profilePicture}
            icon={<UserOutlined />}
          />
          {!collapsed && (
            <div className="doctor-info">
              <Title level={5}>{doctorInfo.name}</Title>
              <Text type="secondary">{doctorInfo.specialty}</Text>
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => setActiveTab(key)}
          items={[
            {
              key: "1",
              icon: <UserOutlined />,
              label: "Thông tin cá nhân",
            },
            {
              key: "2",
              icon: <CalendarOutlined />,
              label: "Yêu cầu tư vấn",
            },
            {
              key: "3",
              icon: <MessageOutlined />,
              label: "Phản hồi tư vấn",
            },
            {
              key: "4",
              icon: <FileOutlined />,
              label: "Yêu cầu hồ sơ",
            },
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "Đăng xuất",
              danger: true,
              onClick: handleLogout,
            },
          ]}
        />
      </Sider>
      <Layout className="doctor-main-layout">
        <Header className="doctor-header">
          <div className="header-left">
            {React.createElement(collapsed ? "menu-unfold" : "menu-fold", {
              className: "trigger",
              onClick: () => setCollapsed(!collapsed),
            })}
            <Title level={4}>Dashboard Bác sĩ</Title>
          </div>
          <div className="header-right">
            <Badge count={doctorInfo.notifications} overflowCount={99}>
              <BellOutlined className="notification-icon" />
            </Badge>
          </div>
        </Header>
        <Content className="doctor-content">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              className="doctor-tabs"
            >
              <TabPane tab="Thông tin cá nhân" key="1">
                <Bio />
              </TabPane>
              <TabPane tab="Yêu cầu tư vấn" key="2">
                <Request />
              </TabPane>
              <TabPane tab="Phản hồi tư vấn" key="3">
                <Response />
              </TabPane>
              <TabPane tab="Yêu cầu hồ sơ" key="4">
                <RecordRequest />
              </TabPane>
            </Tabs>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Doctor;
