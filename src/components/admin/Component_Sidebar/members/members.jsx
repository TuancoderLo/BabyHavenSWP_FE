import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Popconfirm,
  Typography,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
} from "antd";
import membershipApi from "../../../../services/memberShipApi";
import userAccountsApi from "../../../../services/userAccountsApi";
import { getAllMembers, updateMember } from "../../../../services/member";
import moment from "moment";
import "./members.css";
import { PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const Members = () => {
  // Common state
  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(false);

  // State for UserAccounts
  const [userAccounts, setUserAccounts] = useState([]);
  const [userAccountModalVisible, setUserAccountModalVisible] = useState(false);
  const [userAccountForm] = Form.useForm();
  const [editingUserAccount, setEditingUserAccount] = useState(null);

  // State for Members
  const [members, setMembers] = useState([]);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [memberForm] = Form.useForm();
  const [editingMember, setEditingMember] = useState(null);

  // State for MemberMemberships
  const [memberships, setMemberships] = useState([]);
  const [membershipModalVisible, setMembershipModalVisible] = useState(false);
  const [membershipForm] = Form.useForm();
  const [editingMembership, setEditingMembership] = useState(null);
  const [membershipPackages, setMembershipPackages] = useState([]);

  // Fetch data when component mounts and when tab changes
  useEffect(() => {
    if (activeTab === "1") {
      fetchUserAccounts();
    } else if (activeTab === "2") {
      fetchMembers();
    } else if (activeTab === "3") {
      fetchMemberships();
      fetchMembershipPackages();
    }
  }, [activeTab]);

  // ===== USER ACCOUNTS FUNCTIONS =====
  const fetchUserAccounts = async () => {
    try {
      setLoading(true);
      // Direct API call to ensure we get all fields
      const response = await fetch("https://localhost:7279/api/UserAccounts");
      const data = await response.json();

      if (Array.isArray(data)) {
        setUserAccounts(data);
      } else if (data && Array.isArray(data.data)) {
        setUserAccounts(data.data);
      } else {
        console.log("Data is not an array:", data);
        setUserAccounts([]);
      }
    } catch (error) {
      console.error("Error loading user accounts:", error);
      message.error("Could not load user accounts list");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserAccount = () => {
    setEditingUserAccount(null);
    userAccountForm.resetFields();
    // Set default values for required fields
    userAccountForm.setFieldsValue({
      status: "Active",
      roleId: 2, // Default role ID for Member
      gender: "Male", // Default gender
    });
    setUserAccountModalVisible(true);
  };

  const handleEditUserAccount = (record) => {
    setEditingUserAccount(record);
    userAccountForm.setFieldsValue({
      ...record,
      dateOfBirth: record.dateOfBirth ? moment(record.dateOfBirth) : null,
      // Convert status string to number if needed
      status: record.status,
      // Set roleId based on roleName if needed
      roleId: record.roleName === "Admin" ? 1 : 2,
    });
    setUserAccountModalVisible(true);
  };

  const handleDeleteUserAccount = async (userId) => {
    try {
      setLoading(true);
      // Direct API call
      const response = await fetch(
        `https://localhost:7279/api/UserAccounts/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        message.success("User account deleted successfully");
        fetchUserAccounts();
      } else {
        throw new Error("Failed to delete user account");
      }
    } catch (error) {
      console.error("Error deleting user account:", error);
      message.error("Could not delete user account");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAccountSubmit = async (values) => {
    try {
      setLoading(true);

      // Format the data according to API requirements
      const formattedData = {
        username: values.username?.trim(),
        email: values.email?.trim(),
        phoneNumber: values.phoneNumber?.trim(),
        name: values.name?.trim(),
        gender: values.gender,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : null,
        address: values.address?.trim(),
        password: values.password,
        profilePicture: values.profilePicture || null,
        status:
          typeof values.status === "string"
            ? values.status === "Active"
              ? 0
              : values.status === "Inactive"
              ? 1
              : 2
            : values.status,
        roleId: values.roleId || 2, // Default to Member role (2)
      };

      if (editingUserAccount) {
        // Update existing user account
        const response = await fetch(
          `https://localhost:7279/api/UserAccounts/${editingUserAccount.userId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: editingUserAccount.userId,
              ...formattedData,
            }),
          }
        );

        if (response.ok) {
          message.success("User account updated successfully");
        } else {
          throw new Error("Failed to update user account");
        }
      } else {
        // Create new user account
        const response = await fetch(
          "https://localhost:7279/api/UserAccounts",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formattedData),
          }
        );

        if (response.ok) {
          message.success("User account created successfully");
        } else {
          throw new Error("Failed to create user account");
        }
      }

      setUserAccountModalVisible(false);
      fetchUserAccounts();
    } catch (error) {
      console.error("Error saving user account:", error);
      message.error("Could not save user account");
    } finally {
      setLoading(false);
    }
  };

  // ===== MEMBERS FUNCTIONS =====
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await getAllMembers();
      if (Array.isArray(response)) {
        setMembers(response);
      } else if (response && Array.isArray(response.data)) {
        setMembers(response.data);
      } else {
        console.log("Data is not an array:", response);
        setMembers([]);
      }
    } catch (error) {
      console.error("Error loading members:", error);
      message.error("Could not load members list");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setEditingMember(null);
    memberForm.resetFields();
    setMemberModalVisible(true);
  };

  const handleEditMember = (record) => {
    setEditingMember(record);
    memberForm.setFieldsValue({
      ...record,
    });
    setMemberModalVisible(true);
  };

  const handleDeleteMember = async (memberId) => {
    try {
      setLoading(true);
      // API call to delete member
      await fetch(`https://localhost:7279/api/Members/${memberId}`, {
        method: "DELETE",
      });
      message.success("Member deleted successfully");
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      message.error("Could not delete member");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingMember) {
        await updateMember(editingMember.memberId, values);
        message.success("Member updated successfully");
      } else {
        // API call to create member
        await fetch("https://localhost:7279/api/Members", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        message.success("Member created successfully");
      }
      setMemberModalVisible(false);
      fetchMembers();
    } catch (error) {
      console.error("Error saving member:", error);
      message.error("Could not save member");
    } finally {
      setLoading(false);
    }
  };

  // ===== MEMBERSHIPS FUNCTIONS =====
  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const response = await membershipApi.getAllMemberships();
      if (Array.isArray(response.data)) {
        setMemberships(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setMemberships(response.data.data);
      } else {
        console.log("Data is not an array:", response.data);
        setMemberships([]);
      }
    } catch (error) {
      console.error("Error loading memberships:", error);
      message.error("Could not load membership list");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipPackages = async () => {
    try {
      const response = await membershipApi.getAllPackages();
      if (Array.isArray(response.data)) {
        setMembershipPackages(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setMembershipPackages(response.data.data);
      } else {
        setMembershipPackages([]);
      }
    } catch (error) {
      console.error("Error loading membership packages:", error);
      message.error("Could not load package list");
    }
  };

  const handleAddMembership = () => {
    setEditingMembership(null);
    membershipForm.resetFields();
    setMembershipModalVisible(true);
  };

  const handleEditMembership = (record) => {
    setEditingMembership(record);
    membershipForm.setFieldsValue({
      ...record,
      startDate: record.startDate ? moment(record.startDate) : null,
      endDate: record.endDate ? moment(record.endDate) : null,
    });
    setMembershipModalVisible(true);
  };

  const handleDeleteMembership = async (memberMembershipId) => {
    try {
      setLoading(true);
      await membershipApi.deleteMembership(memberMembershipId);
      message.success("Membership deleted successfully");
      fetchMemberships();
    } catch (error) {
      console.error("Error deleting membership:", error);
      message.error("Could not delete membership");
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingMembership) {
        // API call to update membership
        await fetch(
          `https://localhost:7279/api/MemberMemberships/${editingMembership.memberMembershipId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          }
        );
        message.success("Membership updated successfully");
      } else {
        // API call to create membership
        await fetch("https://localhost:7279/api/MemberMemberships", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        message.success("Membership created successfully");
      }
      setMembershipModalVisible(false);
      fetchMemberships();
    } catch (error) {
      console.error("Error saving membership:", error);
      message.error("Could not save membership");
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

  // ===== COLUMNS DEFINITIONS =====
  const userAccountColumns = [
    {
      title: "No.",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Full Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Date of Birth",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
    },
    {
      title: "Profile Picture",
      dataIndex: "profilePicture",
      key: "profilePicture",
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="Profile"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            N/A
          </div>
        ),
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
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
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEditUserAccount(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this account?"
            onConfirm={() => handleDeleteUserAccount(record.userId)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const memberColumns = [
    {
      title: "No.",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Member Name",
      dataIndex: "memberName",
      key: "memberName",
    },
    {
      title: "Emergency Contact",
      dataIndex: "emergencyContact",
      key: "emergencyContact",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEditMember(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this member?"
            onConfirm={() => handleDeleteMember(record.memberId)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const membershipColumns = [
    {
      title: "No.",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Member Name",
      dataIndex: "memberName",
      key: "memberName",
    },
    {
      title: "Package Name",
      dataIndex: "packageName",
      key: "packageName",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
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
        <Space>
          <Button type="primary" onClick={() => handleEditMembership(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this membership?"
            onConfirm={() => handleDeleteMembership(record.memberMembershipId)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="members-container">
      <div className="members-header">
        <Title level={4} className="members-title">
          Member Management
        </Title>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="User Accounts" key="1">
          <div className="tab-header">
            <div className="tab-header-title">User Accounts List</div>
            <div className="tab-header-actions">
              <Button
                type="primary"
                onClick={handleAddUserAccount}
                icon={<PlusOutlined />}
              >
                Add New Account
              </Button>
            </div>
          </div>
          <Table
            columns={userAccountColumns}
            dataSource={userAccounts}
            rowKey="userId"
            loading={loading}
            scroll={{ x: 1300 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} accounts`,
              showQuickJumper: true,
            }}
            size="middle"
            bordered
          />
        </TabPane>

        <TabPane tab="Members" key="2">
          <div className="tab-header">
            <div className="tab-header-title">Members List</div>
            <div className="tab-header-actions">
              <Button
                type="primary"
                onClick={handleAddMember}
                icon={<PlusOutlined />}
              >
                Add New Member
              </Button>
            </div>
          </div>
          <Table
            columns={memberColumns}
            dataSource={members}
            rowKey="memberId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} members`,
              showQuickJumper: true,
            }}
            size="middle"
            bordered
          />
        </TabPane>

        <TabPane tab="Memberships" key="3">
          <div className="tab-header">
            <div className="tab-header-title">Memberships List</div>
            <div className="tab-header-actions">
              <Button
                type="primary"
                onClick={handleAddMembership}
                icon={<PlusOutlined />}
              >
                Add New Membership
              </Button>
            </div>
          </div>
          <Table
            columns={membershipColumns}
            dataSource={memberships}
            rowKey="memberMembershipId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} memberships`,
              showQuickJumper: true,
            }}
            size="middle"
            bordered
          />
        </TabPane>
      </Tabs>

      {/* User Account Modal */}
      <Modal
        title={editingUserAccount ? "Edit Account" : "Add New Account"}
        visible={userAccountModalVisible}
        onCancel={() => setUserAccountModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={userAccountForm}
          layout="vertical"
          onFinish={handleUserAccountSubmit}
        >
          <div className="form-row">
            <Form.Item
              name="username"
              label="Username"
              className="form-col"
              rules={[{ required: true, message: "Please enter username" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              className="form-col"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              className="form-col"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="name"
              label="Full Name"
              className="form-col"
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item name="gender" label="Gender" className="form-col">
              <Select>
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
              className="form-col"
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>

          <Form.Item name="profilePicture" label="Profile Picture URL">
            <Input placeholder="Enter image URL (optional)" />
          </Form.Item>

          {!editingUserAccount && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Please enter password" }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <div className="form-row">
            <Form.Item name="status" label="Status" className="form-col">
              <Select>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Pending">Pending</Option>
              </Select>
            </Form.Item>

            <Form.Item name="roleId" label="Role" className="form-col">
              <Select>
                <Option value={1}>Admin</Option>
                <Option value={2}>Member</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingUserAccount ? "Update" : "Add"}
              </Button>
              <Button onClick={() => setUserAccountModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Member Modal */}
      <Modal
        title={editingMember ? "Edit Member" : "Add New Member"}
        visible={memberModalVisible}
        onCancel={() => setMemberModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={memberForm} layout="vertical" onFinish={handleMemberSubmit}>
          <Form.Item
            name="memberName"
            label="Member Name"
            rules={[{ required: true, message: "Please enter member name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="emergencyContact"
            label="Emergency Contact"
            rules={[
              { required: true, message: "Please enter emergency contact" },
            ]}
          >
            <Input placeholder="Name - Phone Number" />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
              <Option value="Pending">Pending</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingMember ? "Update" : "Add"}
              </Button>
              <Button onClick={() => setMemberModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Membership Modal */}
      <Modal
        title={editingMembership ? "Edit Membership" : "Add New Membership"}
        visible={membershipModalVisible}
        onCancel={() => setMembershipModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={membershipForm}
          layout="vertical"
          onFinish={handleMembershipSubmit}
        >
          <Form.Item
            name="memberId"
            label="Member"
            rules={[{ required: true, message: "Please select a member" }]}
          >
            <Select>
              {members.map((member) => (
                <Option key={member.memberId} value={member.memberId}>
                  {member.memberName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="packageId"
            label="Membership Package"
            rules={[
              { required: true, message: "Please select a membership package" },
            ]}
          >
            <Select>
              {membershipPackages.map((pkg) => (
                <Option key={pkg.packageId} value={pkg.packageId}>
                  {pkg.packageName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <div className="form-row">
            <Form.Item
              name="startDate"
              label="Start Date"
              className="form-col"
              rules={[{ required: true, message: "Please select start date" }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="End Date"
              className="form-col"
              rules={[{ required: true, message: "Please select end date" }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </div>
          <Form.Item name="status" label="Status">
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
              <Option value="Pending">Pending</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingMembership ? "Update" : "Add"}
              </Button>
              <Button onClick={() => setMembershipModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Members;
