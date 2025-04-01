import React, { useState } from "react";
import { Card, Typography, Tabs, Divider } from "antd";
import AccountCRUD from "./Account/AccountCRUD";
import MemberCRUD from "./MemberIdCRUD/MemberCRUD";
import MemberShipCRUD from "./MemberShipCRUD/MemberShipCRUD";
import DoctorCRUD from "./DoctorIdCRUD/DoctorCRUD";

const { Title } = Typography;
const { TabPane } = Tabs;

const Members = () => {
  const [activeTab, setActiveTab] = useState("1");

  return (
    <div
      className="MemberAdmin-container"
      style={{ backgroundColor: "#f5f5f5", padding: "24px" }}
    >
      <Card sx={{ mb: 3, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <div
          className="MemberAdmin-header"
          style={{ borderBottom: "none", marginBottom: 0 }}
        >
          <div>
            <Typography.Title
              level={5}
              style={{
                fontWeight: "bold",
                color: "#1976d2",
                margin: 0,
                fontSize: "25px",
              }}
            >
              Member Management
            </Typography.Title>
          </div>
        </div>

        <Divider style={{ margin: "16px 0" }} />

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="User Accounts" key="1">
            <AccountCRUD />
          </TabPane>

          <TabPane tab="Members" key="2">
            <MemberCRUD />
          </TabPane>

          <TabPane tab="Membership Packages" key="3">
            <MemberShipCRUD />
          </TabPane>

          <TabPane tab="Doctors" key="4">
            <DoctorCRUD />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Members;
