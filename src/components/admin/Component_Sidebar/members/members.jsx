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

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const Members = () => {
  // State chung
  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(false);

  // State cho UserAccounts
  const [userAccounts, setUserAccounts] = useState([]);
  const [userAccountModalVisible, setUserAccountModalVisible] = useState(false);
  const [userAccountForm] = Form.useForm();
  const [editingUserAccount, setEditingUserAccount] = useState(null);

  // State cho Members
  const [members, setMembers] = useState([]);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [memberForm] = Form.useForm();
  const [editingMember, setEditingMember] = useState(null);

  // State cho MemberMemberships
  const [memberships, setMemberships] = useState([]);
  const [membershipModalVisible, setMembershipModalVisible] = useState(false);
  const [membershipForm] = Form.useForm();
  const [editingMembership, setEditingMembership] = useState(null);
  const [membershipPackages, setMembershipPackages] = useState([]);

  // Fetch data khi component mount và khi tab thay đổi
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
      message.error("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserAccount = () => {
    setEditingUserAccount(null);
    userAccountForm.resetFields();
    setUserAccountModalVisible(true);
  };

  const handleEditUserAccount = (record) => {
    setEditingUserAccount(record);
    userAccountForm.setFieldsValue({
      ...record,
      dateOfBirth: record.dateOfBirth ? moment(record.dateOfBirth) : null,
    });
    setUserAccountModalVisible(true);
  };

  const handleDeleteUserAccount = async (userId) => {
    try {
      setLoading(true);
      await userAccountsApi.delete(userId);
      message.success("Xóa tài khoản thành công");
      fetchUserAccounts();
    } catch (error) {
      console.error("Error deleting user account:", error);
      message.error("Không thể xóa tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAccountSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingUserAccount) {
        await userAccountsApi.update(editingUserAccount.userId, values);
        message.success("Cập nhật tài khoản thành công");
      } else {
        await userAccountsApi.create(values);
        message.success("Tạo tài khoản thành công");
      }
      setUserAccountModalVisible(false);
      fetchUserAccounts();
    } catch (error) {
      console.error("Error saving user account:", error);
      message.error("Không thể lưu tài khoản");
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
      message.error("Không thể tải danh sách thành viên");
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
      // Giả định API xóa member
      await fetch(`https://localhost:7279/api/Members/${memberId}`, {
        method: "DELETE",
      });
      message.success("Xóa thành viên thành công");
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      message.error("Không thể xóa thành viên");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingMember) {
        await updateMember(editingMember.memberId, values);
        message.success("Cập nhật thành viên thành công");
      } else {
        // Giả định API tạo member
        await fetch("https://localhost:7279/api/Members", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        message.success("Tạo thành viên thành công");
      }
      setMemberModalVisible(false);
      fetchMembers();
    } catch (error) {
      console.error("Error saving member:", error);
      message.error("Không thể lưu thành viên");
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
      message.error("Không thể tải danh sách gói thành viên");
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
      message.error("Không thể tải danh sách gói");
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
      message.success("Xóa gói thành viên thành công");
      fetchMemberships();
    } catch (error) {
      console.error("Error deleting membership:", error);
      message.error("Không thể xóa gói thành viên");
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingMembership) {
        // Giả định API cập nhật membership
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
        message.success("Cập nhật gói thành viên thành công");
      } else {
        // Giả định API tạo membership
        await fetch("https://localhost:7279/api/MemberMemberships", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        message.success("Tạo gói thành viên thành công");
      }
      setMembershipModalVisible(false);
      fetchMemberships();
    } catch (error) {
      console.error("Error saving membership:", error);
      message.error("Không thể lưu gói thành viên");
    } finally {
      setLoading(false);
    }
  };

  // Render status với màu phù hợp
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
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên người dùng",
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
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Vai trò",
      dataIndex: "roleName",
      key: "roleName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEditUserAccount(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa tài khoản này?"
            onConfirm={() => handleDeleteUserAccount(record.userId)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const memberColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên thành viên",
      dataIndex: "memberName",
      key: "memberName",
    },
    {
      title: "Liên hệ khẩn cấp",
      dataIndex: "emergencyContact",
      key: "emergencyContact",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEditMember(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa thành viên này?"
            onConfirm={() => handleDeleteMember(record.memberId)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const membershipColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên thành viên",
      dataIndex: "memberName",
      key: "memberName",
    },
    {
      title: "Tên gói",
      dataIndex: "packageName",
      key: "packageName",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEditMembership(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa gói thành viên này?"
            onConfirm={() => handleDeleteMembership(record.memberMembershipId)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger>
              Xóa
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
          Quản lý thành viên
        </Title>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Quản lý tài khoản" key="1">
          <div className="tab-header">
            <Button type="primary" onClick={handleAddUserAccount}>
              Thêm tài khoản mới
            </Button>
          </div>
          <Table
            columns={userAccountColumns}
            dataSource={userAccounts}
            rowKey="userId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} tài khoản`,
            }}
          />
        </TabPane>

        <TabPane tab="Quản lý thành viên" key="2">
          <div className="tab-header">
            <Button type="primary" onClick={handleAddMember}>
              Thêm thành viên mới
            </Button>
          </div>
          <Table
            columns={memberColumns}
            dataSource={members}
            rowKey="memberId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} thành viên`,
            }}
          />
        </TabPane>

        <TabPane tab="Quản lý gói thành viên" key="3">
          <div className="tab-header">
            <Button type="primary" onClick={handleAddMembership}>
              Thêm gói thành viên mới
            </Button>
          </div>
          <Table
            columns={membershipColumns}
            dataSource={memberships}
            rowKey="memberMembershipId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} gói thành viên`,
            }}
          />
        </TabPane>
      </Tabs>

      {/* Modal quản lý tài khoản */}
      <Modal
        title={editingUserAccount ? "Sửa tài khoản" : "Thêm tài khoản mới"}
        visible={userAccountModalVisible}
        onCancel={() => setUserAccountModalVisible(false)}
        footer={null}
      >
        <Form
          form={userAccountForm}
          layout="vertical"
          onFinish={handleUserAccountSubmit}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Vui lòng nhập username" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="Giới tính">
            <Select>
              <Option value="Male">Nam</Option>
              <Option value="Female">Nữ</Option>
              <Option value="Other">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateOfBirth" label="Ngày sinh">
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>
          {!editingUserAccount && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          {editingUserAccount && (
            <Form.Item name="status" label="Trạng thái">
              <Select>
                <Option value="Active">Hoạt động</Option>
                <Option value="Inactive">Không hoạt động</Option>
                <Option value="Pending">Chờ xác nhận</Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingUserAccount ? "Cập nhật" : "Thêm mới"}
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => setUserAccountModalVisible(false)}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal quản lý thành viên */}
      <Modal
        title={editingMember ? "Sửa thành viên" : "Thêm thành viên mới"}
        visible={memberModalVisible}
        onCancel={() => setMemberModalVisible(false)}
        footer={null}
      >
        <Form form={memberForm} layout="vertical" onFinish={handleMemberSubmit}>
          <Form.Item
            name="memberName"
            label="Tên thành viên"
            rules={[
              { required: true, message: "Vui lòng nhập tên thành viên" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="emergencyContact"
            label="Liên hệ khẩn cấp"
            rules={[
              { required: true, message: "Vui lòng nhập liên hệ khẩn cấp" },
            ]}
          >
            <Input placeholder="Tên - Số điện thoại" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value="Active">Hoạt động</Option>
              <Option value="Inactive">Không hoạt động</Option>
              <Option value="Pending">Chờ xác nhận</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingMember ? "Cập nhật" : "Thêm mới"}
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => setMemberModalVisible(false)}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal quản lý gói thành viên */}
      <Modal
        title={
          editingMembership ? "Sửa gói thành viên" : "Thêm gói thành viên mới"
        }
        visible={membershipModalVisible}
        onCancel={() => setMembershipModalVisible(false)}
        footer={null}
      >
        <Form
          form={membershipForm}
          layout="vertical"
          onFinish={handleMembershipSubmit}
        >
          <Form.Item
            name="memberId"
            label="Thành viên"
            rules={[{ required: true, message: "Vui lòng chọn thành viên" }]}
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
            label="Gói thành viên"
            rules={[
              { required: true, message: "Vui lòng chọn gói thành viên" },
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
          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value="Active">Hoạt động</Option>
              <Option value="Inactive">Không hoạt động</Option>
              <Option value="Pending">Chờ xác nhận</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingMembership ? "Cập nhật" : "Thêm mới"}
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => setMembershipModalVisible(false)}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Members;
