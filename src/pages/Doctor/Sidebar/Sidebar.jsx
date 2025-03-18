// Sidebar.jsx
import React from "react";
import {
  Avatar,
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
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

/**
 * Props gợi ý:
 * - doctorInfo: Thông tin bác sĩ (name, specialty, profilePicture, ...)
 * - activeTab: Tab đang được chọn (string)
 * - handleTabChange: Hàm callback khi đổi tab
 * - handleLogout: Hàm callback khi bấm Logout
 * - collapsed: Boolean, sidebar đang collapsed hay không
 * - toggleCollapse: Hàm callback để thay đổi trạng thái collapsed
 */
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

      {/* Profile Card */}
      {!collapsed && (
        <div className="doctor-profile-card">
          <Avatar
            size={80}
            src={doctorInfo.profilePicture || null}
            icon={<UserOutlined />}
            className="doctor-avatar"
          />
          <div className="doctor-profile-info">
            <Title level={4} className="doctor-name">
              {doctorInfo.name}
            </Title>
            <Text className="doctor-specialty">{doctorInfo.specialty}</Text>
          </div>
        </div>
      )}

      {/* Tabs bên trái (nếu muốn làm dạng Menu thì có thể dùng antd Menu thay vì Tabs) */}
      <Tabs
        className="doctor-tabs"
        activeKey={activeTab}
        onChange={handleTabChange}
        tabPosition="left"
      >
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
