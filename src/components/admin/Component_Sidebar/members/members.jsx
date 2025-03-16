import React, { useState, useEffect } from "react";
import { Table, Button, message, Popconfirm, Typography } from "antd";
import membershipApi from "../../../../services/memberShipApi";
import "./members.css";

const { Title } = Typography;

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all memberships
  const fetchAllMemberships = async () => {
    try {
      setLoading(true);
      const response = await membershipApi.getAllMemberships();
      // Check data structure and adjust
      if (Array.isArray(response.data)) {
        setMembers(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        // If data has structure { data: [...] }
        setMembers(response.data.data);
      } else {
        // If not an array, log to check
        console.log("Data is not an array:", response.data);
        setMembers([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      message.error("Could not load member list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMemberships();
  }, []);

  // Handle member deletion
  const handleDelete = async (memberMembershipId) => {
    try {
      setLoading(true);
      await membershipApi.deleteMembership(memberMembershipId);
      message.success("Member deleted successfully");
      fetchAllMemberships();
    } catch (error) {
      message.error("Could not delete member");
    } finally {
      setLoading(false);
    }
  };

  // Render status with appropriate color
  const renderStatus = (status) => {
    let className = "";

    if (status === "Active") {
      className = "status-active";
    } else if (status === "Inactive") {
      className = "status-inactive";
    } else {
      className = "status-pending";
    }

    return <span className={className}>{status}</span>;
  };

  const columns = [
    {
      title: "No.",
      key: "index",
      width: 80,
      className: "index-column",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Member Name",
      dataIndex: "memberName",
      key: "memberName",
      className: "member-name",
    },
    {
      title: "Package Name",
      dataIndex: "packageName",
      key: "packageName",
      className: "package-name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <>
          <Popconfirm
            title="Are you sure you want to delete?"
            onConfirm={() => handleDelete(record.memberMembershipId)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger className="delete-button">
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="members-container">
      <div className="members-header">
        <Title level={4} className="members-title">
          Member List
        </Title>
      </div>

      <Table
        className="members-table"
        columns={columns}
        dataSource={members}
        rowKey="memberMembershipId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} members`,
        }}
      />
    </div>
  );
};

export default Members;
