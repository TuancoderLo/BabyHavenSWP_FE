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
  Modal,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import membershipApi from "../../../../../services/memberShipApi";
import moment from "moment";
import "./MemberShipCRUD.css";

const { Option } = Select;

const MemberShipCRUD = () => {
  const [loading, setLoading] = useState(false);
  const [memberships, setMemberships] = useState([]);
  const [membershipModalVisible, setMembershipModalVisible] = useState(false);
  const [membershipForm] = Form.useForm();
  const [editingMembership, setEditingMembership] = useState(null);
  const [membershipPackages, setMembershipPackages] = useState([]);
  const [membershipSearchText, setMembershipSearchText] = useState("");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMemberships();
    fetchMembershipPackages();
  }, []);

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
      message.error("Failed to load memberships list");
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
      message.success("Membership deleted successfully");
      fetchMemberships();
    } catch (error) {
      console.error("Error deleting membership:", error);
      message.error("Unable to delete membership");
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingMembership) {
        await membershipApi.updateMembership(
          editingMembership.memberMembershipId,
          values
        );
        message.success("Membership updated successfully");
      } else {
        await membershipApi.createMembership(values);
        message.success("New membership added successfully");
      }
      setMembershipModalVisible(false);
      fetchMemberships();
    } catch (error) {
      console.error("Error saving membership:", error);
      message.error("Unable to save membership");
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipSearchChange = (e) => {
    setMembershipSearchText(e.target.value);
  };

  const renderStatus = (status) => {
    let className = "";
    if (status === "Active") {
      className = "MemberAdmin-status-active";
    } else if (status === "Inactive") {
      className = "MemberAdmin-status-inactive";
    } else {
      className = "MemberAdmin-status-pending";
    }
    return <span className={className}>{status}</span>;
  };

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
      width: 80,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditMembership(record)}
            className="MemberAdmin-action-button"
          />
          <Popconfirm
            title="Are you sure you want to delete this membership?"
            onConfirm={() => handleDeleteMembership(record.memberMembershipId)}
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

  const filteredMemberships = memberships.filter((membership) => {
    const searchLower = membershipSearchText.toLowerCase();
    if (!membershipSearchText) return true;

    if (
      membership.memberName &&
      membership.memberName.toLowerCase().includes(searchLower)
    ) {
      return true;
    }

    if (
      membership.packageName &&
      membership.packageName.toLowerCase().includes(searchLower)
    ) {
      return true;
    }

    return false;
  });

  return (
    <>
      <div className="member-header">
        <div className="member-title">Memberships List</div>
        <div className="member-actions">
          <div className="member-search">
            <Input
              placeholder="Search by member name or package name"
              value={membershipSearchText}
              onChange={handleMembershipSearchChange}
              allowClear
              prefix={<SearchOutlined />}
            />
          </div>
          <div className="member-filters">
            <Button
              type="primary"
              onClick={handleAddMembership}
              icon={<PlusOutlined />}
              className="member-add-btn"
            >
              Add New Membership
            </Button>
          </div>
        </div>
      </div>
      <Table
        columns={membershipColumns}
        dataSource={filteredMemberships}
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
        className="member-table"
      />

      <Modal
        title={
          editingMembership
            ? "Edit Membership Information"
            : "Add New Membership"
        }
        visible={membershipModalVisible}
        onCancel={() => setMembershipModalVisible(false)}
        footer={null}
        destroyOnClose
        className="member-modal"
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
            <Select
              showSearch
              placeholder="Search member"
              optionFilterProp="children"
              filterOption={(input, option) => {
                return (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
              className="member-select"
            >
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
            <Select className="member-select">
              {membershipPackages.map((pkg) => (
                <Option key={pkg.packageId} value={pkg.packageId}>
                  {pkg.packageName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <div className="member-form-row">
            <Form.Item
              name="startDate"
              label="Start Date"
              className="member-form-col"
              rules={[{ required: true, message: "Please select start date" }]}
            >
              <DatePicker format="DD/MM/YYYY" className="member-date-picker" />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="End Date"
              className="member-form-col"
              rules={[{ required: true, message: "Please select end date" }]}
            >
              <DatePicker format="DD/MM/YYYY" className="member-date-picker" />
            </Form.Item>
          </div>
          <Form.Item name="status" label="Status" initialValue="Active">
            <Select className="member-select">
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
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
    </>
  );
};

export default MemberShipCRUD;
