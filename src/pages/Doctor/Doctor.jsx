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
  MenuFoldOutlined,
  MenuUnfoldOutlined,
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
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("role");

    if (!isAuthenticated || role !== "2") {
      message.error("Bạn không có quyền truy cập trang này");
      navigate("/login");
      return;
    }

    const name = localStorage.getItem("name") || "Bác sĩ";
    const profilePicture = localStorage.getItem("profilePicture") || "";

    setDoctorInfo({
      name: name,
      specialty: "Nhi khoa",
      profilePicture: profilePicture,
      notifications: 5,
    });
  }, [navigate]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
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
  ];

  return (
    <Layout className="doctor-dashboard">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="doctor-sider"
        width={280}
      >
        <div className="logo-container">
          <div className="doctor-logo">{collapsed ? "BH" : "Baby Haven"}</div>
        </div>

        <div className="doctor-profile">
          <div className="avatar-container">
            <Avatar
              size={collapsed ? 60 : 100}
              src={doctorInfo.profilePicture}
              icon={<UserOutlined />}
              className="doctor-avatar"
            />
          </div>
          {!collapsed && (
            <div className="doctor-info">
              <Title level={4} className="doctor-name">
                {doctorInfo.name}
              </Title>
              <Text className="doctor-specialty">{doctorInfo.specialty}</Text>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => setActiveTab(key)}
          items={menuItems}
          className="doctor-menu"
        />
      </Sider>

      <Layout className="doctor-main-layout">
        <Header className="doctor-header">
          <div className="header-left">
            {collapsed ? (
              <MenuUnfoldOutlined
                className="trigger"
                onClick={() => setCollapsed(false)}
              />
            ) : (
              <MenuFoldOutlined
                className="trigger"
                onClick={() => setCollapsed(true)}
              />
            )}
            <Title level={4} className="dashboard-title">
              Dashboard Bác sĩ
            </Title>
          </div>
          <div className="header-right">
            <Badge
              count={doctorInfo.notifications}
              overflowCount={99}
              className="notification-badge"
            >
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
            <div className="content-wrapper">
              <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                className="doctor-tabs"
                type="card"
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
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Doctor;
