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
  EditOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Bio from "./DashBoardDoctor/Bio";
import Request from "./DashBoardDoctor/Request";
import Response from "./DashBoardDoctor/Response";
import RecordRequest from "./DashBoardDoctor/RecordRequest";
import DoctorBlog from "./DashBoardDoctor/DoctorBlog";
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
      message.error("You don't have permission to access this page");
      navigate("/login");
      return;
    }

    const name = localStorage.getItem("name") || "Doctor";
    const profilePicture = localStorage.getItem("profilePicture") || "";

    setDoctorInfo({
      name: name,
      specialty: "Pediatrics",
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
      label: "Personal Information",
    },
    {
      key: "2",
      icon: <CalendarOutlined />,
      label: "Consultation Requests",
    },
    {
      key: "3",
      icon: <MessageOutlined />,
      label: "Consultation Responses",
    },
    {
      key: "4",
      icon: <FileOutlined />,
      label: "Record Requests",
    },
    {
      key: "5",
      icon: <EditOutlined />,
      label: "Blog Management",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
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
              src={doctorInfo.profilePicture || null}
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
              Doctor Dashboard
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
                <TabPane tab="Personal Information" key="1">
                  <Bio />
                </TabPane>
                <TabPane tab="Consultation Requests" key="2">
                  <Request />
                </TabPane>
                <TabPane tab="Consultation Responses" key="3">
                  <Response />
                </TabPane>
                <TabPane tab="Record Requests" key="4">
                  <RecordRequest />
                </TabPane>
                <TabPane tab="Blog Management" key="5">
                  <DoctorBlog />
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
