import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Popconfirm,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Upload,
  Modal,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import userAccountsApi from "../../../../../services/userAccountsApi";
import moment from "moment";
import "./AccountCRUD.css";

const { Option } = Select;

const AccountCRUD = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [userAccounts, setUserAccounts] = useState([]);
  const [userAccountModalVisible, setUserAccountModalVisible] = useState(false);
  const [userAccountForm] = Form.useForm();
  const [editingUserAccount, setEditingUserAccount] = useState(null);
  const [selectedRole, setSelectedRole] = useState("All");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchUserAccounts();
  }, []);

  const fetchUserAccounts = async () => {
    try {
      setLoading(true);
      const response = await userAccountsApi.getAll();

      if (Array.isArray(response.data)) {
        setUserAccounts(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setUserAccounts(response.data.data);
      } else {
        console.log("Data is not an array:", response.data);
        setUserAccounts([]);
      }
    } catch (error) {
      console.error("Error loading user accounts:", error);
      message.error("Failed to load user accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserAccount = () => {
    setEditingUserAccount(null);
    userAccountForm.resetFields();
    setImageUrl("");

    const defaultRoleId =
      selectedRole === "Doctor" ? 2 : selectedRole === "Admin" ? 3 : 1;

    userAccountForm.setFieldsValue({
      status: "Active",
      roleId: defaultRoleId,
      gender: "Male",
    });
    setUserAccountModalVisible(true);
  };

  const handleEditUserAccount = (record) => {
    setEditingUserAccount(record);
    setImageUrl(record.profilePicture || "");
    userAccountForm.setFieldsValue({
      ...record,
      dateOfBirth: record.dateOfBirth ? moment(record.dateOfBirth) : null,
      status: record.status,
      roleId:
        record.roleName === "Admin" ? 3 : record.roleName === "Doctor" ? 2 : 1,
    });
    setUserAccountModalVisible(true);
  };

  const handleDeleteUserAccount = async (userId) => {
    try {
      setLoading(true);
      await userAccountsApi.delete(userId);
      message.success("User account deleted successfully");
      fetchUserAccounts();
    } catch (error) {
      console.error("Error deleting user account:", error);
      message.error("Unable to delete user account");
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current) => {
    return current && current > moment().endOf("day");
  };

  const handleUserAccountSubmit = async (values) => {
    try {
      setLoading(true);

      const userAccountData = {
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
        status: 0,
        roleId: values.roleId,
      };

      if (editingUserAccount) {
        await userAccountsApi.update(
          editingUserAccount.userId,
          userAccountData
        );
        message.success("User account updated successfully");
      } else {
        await userAccountsApi.create(userAccountData);
        message.success("New user account created successfully");
      }
      setUserAccountModalVisible(false);
      fetchUserAccounts();
    } catch (error) {
      console.error("Error saving user account:", error);
      message.error(
        error.message || "Error occurred while saving user account"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  const renderRole = (role) => {
    let className = "member-role ";
    if (role === "Admin") {
      className += "member-role-admin";
    } else if (role === "Doctor") {
      className += "member-role-doctor";
    } else {
      className += "member-role-member";
    }
    return <span className={className}>{role}</span>;
  };

  const renderStatus = (status) => {
    let className = "member-status ";
    if (status === "Active") {
      className += "member-status-active";
    } else if (status === "Inactive") {
      className += "member-status-inactive";
    } else {
      className += "member-status-pending";
    }
    return <span className={className}>{status}</span>;
  };

  const userAccountColumns = [
    {
      title: "No.",
      key: "index",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Full Name",
      dataIndex: "name",
      key: "name",
      width: 120,
      ellipsis: true,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 100,
      ellipsis: true,
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
      width: 150,
      ellipsis: true,
      className: "hide-on-mobile",
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
      render: renderRole,
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
      width: 80,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUserAccount(record)}
            className="MemberAdmin-action-button"
          />
          <Popconfirm
            title="Are you sure you want to delete this account?"
            onConfirm={() => handleDeleteUserAccount(record.userId)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              className="MemberAdmin-action-button"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredUserAccounts = userAccounts.filter((account) => {
    const matchesRole =
      selectedRole === "All" || account.roleName === selectedRole;

    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      !searchText ||
      (account.name && account.name.toLowerCase().includes(searchLower)) ||
      (account.username &&
        account.username.toLowerCase().includes(searchLower)) ||
      (account.email && account.email.toLowerCase().includes(searchLower)) ||
      (account.phoneNumber &&
        account.phoneNumber.toLowerCase().includes(searchLower));

    return matchesRole && matchesSearch;
  });

  return (
    <>
      <div className="member-header">
        <div className="member-title">User Accounts List</div>
        <div className="member-actions">
          <div className="member-search">
            <Input
              placeholder="Search by name, username, email, phone number"
              value={searchText}
              onChange={handleSearchChange}
              allowClear
              prefix={<SearchOutlined />}
            />
          </div>
          <div className="member-filters">
            <div className="member-role-filters">
              <Button
                type={selectedRole === "All" ? "primary" : "default"}
                onClick={() => handleRoleChange("All")}
                className="member-role-filter-btn"
              >
                All
              </Button>
              <Button
                type={selectedRole === "Member" ? "primary" : "default"}
                onClick={() => handleRoleChange("Member")}
                className="member-role-filter-btn"
              >
                Member
              </Button>
              <Button
                type={selectedRole === "Doctor" ? "primary" : "default"}
                onClick={() => handleRoleChange("Doctor")}
                className="member-role-filter-btn"
              >
                Doctor
              </Button>
              <Button
                type={selectedRole === "Admin" ? "primary" : "default"}
                onClick={() => handleRoleChange("Admin")}
                className="member-role-filter-btn"
              >
                Administrator
              </Button>
            </div>
            <Button
              type="primary"
              onClick={handleAddUserAccount}
              icon={<PlusOutlined />}
              className="member-add-btn"
            >
              Add New Account
            </Button>
          </div>
        </div>
      </div>
      <Table
        columns={userAccountColumns}
        dataSource={filteredUserAccounts}
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

      <Modal
        title={editingUserAccount ? "Edit Account" : "Add New Account"}
        visible={userAccountModalVisible}
        onCancel={() => setUserAccountModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
        className="member-modal"
      >
        <Form
          form={userAccountForm}
          layout="vertical"
          onFinish={handleUserAccountSubmit}
        >
          <div className="member-form-row">
            <Form.Item
              name="username"
              label="Username"
              className="member-form-col"
              rules={[{ required: true, message: "Please enter username" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              className="member-form-col"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="member-form-row">
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              className="member-form-col"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="name"
              label="Full Name"
              className="member-form-col"
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="member-form-row">
            <Form.Item
              name="gender"
              label="Gender"
              className="member-form-col"
              rules={[{ required: true, message: "Please select gender" }]}
            >
              <Select>
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
              className="member-form-col"
              rules={[
                {
                  required: true,
                  message: "Please select date of birth",
                },
              ]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                disabledDate={disabledDate}
                placeholder="Select date"
              />
            </Form.Item>
          </div>

          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>

          <Form.Item name="profilePicture" label="Profile Picture">
            <div className="member-avatar-upload">
              <Upload
                name="profilePicture"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={async (file) => {
                  const isImage = /image\/(jpeg|png|jpg|gif)/.test(file.type);
                  if (!isImage) {
                    message.error("You can only upload image files!");
                    return Upload.LIST_IGNORE;
                  }

                  const isLt2M = file.size / 1024 / 1024 < 2;
                  if (!isLt2M) {
                    message.error("Image must be smaller than 2MB!");
                    return Upload.LIST_IGNORE;
                  }

                  setImageLoading(true);
                  try {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setImageUrl(reader.result);
                      userAccountForm.setFieldsValue({
                        profilePicture: reader.result,
                      });
                      setImageLoading(false);
                    };
                    reader.readAsDataURL(file);
                  } catch (error) {
                    console.error("Error uploading image:", error);
                    message.error("Unable to upload image");
                    setImageLoading(false);
                  }
                  return false;
                }}
              >
                {imageUrl ? (
                  <div className="MemberAdmin-uploaded-image-preview">
                    <img
                      src={imageUrl}
                      alt="Avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    {imageLoading ? (
                      <div>Loading...</div>
                    ) : (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </div>
                )}
              </Upload>
              {imageUrl && (
                <Button
                  onClick={() => {
                    setImageUrl("");
                    userAccountForm.setFieldsValue({ profilePicture: "" });
                  }}
                  size="small"
                  style={{ marginTop: 8 }}
                >
                  Remove
                </Button>
              )}
            </div>
          </Form.Item>

          <Form.Item
            name="password"
            label={
              editingUserAccount
                ? "New Password (Leave blank if no change)"
                : "Password"
            }
            rules={[
              {
                required: !editingUserAccount,
                message: "Please enter password",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <div className="member-form-row">
            <Form.Item
              name="status"
              label="Status"
              className="member-form-col"
              initialValue="Active"
            >
              <Select>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Pending">Pending</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="roleId"
              label="Role"
              className="member-form-col"
              rules={[{ required: true, message: "Please select role" }]}
              initialValue={1}
            >
              <Select>
                <Option value={1}>Member</Option>
                <Option value={2}>Doctor</Option>
                <Option value={3}>Administrator</Option>
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
    </>
  );
};

export default AccountCRUD;
