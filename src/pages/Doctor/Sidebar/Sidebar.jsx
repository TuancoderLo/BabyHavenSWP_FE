// Sidebar.jsx
import React from "react";
import {
  Typography,
  Tabs,
  Button,
} from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  CalendarOutlined,
  MessageOutlined,
  FileOutlined,
  EditOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Sidebar = ({
  doctorInfo,
  activeTab,
  handleTabChange,
  handleLogout,
  collapsed,
  toggleCollapse,
}) => {
  return (
    <aside className={`doctor-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Nút toggle sidebar */}
      <div className="sidebar-toggle" onClick={toggleCollapse}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>

      {/* Tabs bên trái */}
      <Tabs
        className="doctor-tabs"
        activeKey={activeTab}
        onChange={handleTabChange}
        tabPosition="left"
      >
        <TabPane
          tab={
            <span>
              <HomeOutlined />
              {!collapsed && "Home"}
            </span>
          }
          key="home"
        />
        <TabPane
          tab={
            <span>
              <UserOutlined />
              {!collapsed && "Bio"}
            </span>
          }
          key="bio"
        />
        <TabPane
          tab={
            <span>
              <CalendarOutlined />
              {!collapsed && "Requests"}
            </span>
          }
          key="requests"
        />
        <TabPane
          tab={
            <span>
              <MessageOutlined />
              {!collapsed && "Responses"}
            </span>
          }
          key="responses"
        />
        <TabPane
          tab={
            <span>
              <FileOutlined />
              {!collapsed && "Record"}
            </span>
          }
          key="record"
        />
        <TabPane
          tab={
            <span>
              <EditOutlined />
              {!collapsed && "Blog"}
            </span>
          }
          key="blog"
        />
      </Tabs>

      {/* Nút Logout */}
      {!collapsed && (
        <div className="doctor-logout">
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </Button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
