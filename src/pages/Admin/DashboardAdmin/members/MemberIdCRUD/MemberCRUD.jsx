import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Popconfirm,
  Form,
  Input,
  Select,
  Space,
  Modal,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  getAllMembers,
  updateMember,
  deleteMember,
  createMember,
} from "../../../../../services/member";
import "./MemberCRUD.css";

const { Option } = Select;
const { TextArea } = Input;

const MemberCRUD = () => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [memberForm] = Form.useForm();
  const [editingMember, setEditingMember] = useState(null);
  const [memberSearchText, setMemberSearchText] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

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
      message.error("Failed to load members list");
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
      await deleteMember(memberId);
      message.success("Member deleted successfully");
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      message.error("Unable to delete member");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingMember) {
        const updateData = {
          ...values,
          userId: editingMember.userId,
        };
        await updateMember(editingMember.memberId, updateData);
        message.success("Member information updated successfully");
      } else {
        await createMember(values);
        message.success("New member added successfully");
      }
      setMemberModalVisible(false);
      fetchMembers();
    } catch (error) {
      console.error("Error saving member:", error);
      message.error("Unable to save member information");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSearchChange = (e) => {
    setMemberSearchText(e.target.value);
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
      width: 80,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditMember(record)}
            className="MemberAdmin-action-button"
          />
          <Popconfirm
            title="Are you sure you want to delete this member?"
            onConfirm={() => handleDeleteMember(record.memberId)}
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

  const filteredMembers = members.filter((member) => {
    const searchLower = memberSearchText.toLowerCase();
    if (!memberSearchText) return true;

    if (
      member.memberName &&
      member.memberName.toLowerCase().includes(searchLower)
    ) {
      return true;
    }

    if (member.emergencyContact) {
      const contactLower = member.emergencyContact.toLowerCase();
      if (contactLower.includes(searchLower)) {
        return true;
      }

      const parts = contactLower.split("-");
      if (parts.length === 2) {
        const contactName = parts[0].trim();
        const contactPhone = parts[1].trim();
        if (
          contactName.includes(searchLower) ||
          contactPhone.includes(searchLower)
        ) {
          return true;
        }
      }
    }
    return false;
  });

  return (
    <>
      <div className="member-header">
        <div className="member-title">Members List</div>
        <div className="member-actions">
          <div className="member-search">
            <Input
              placeholder="Search by name or contact information"
              value={memberSearchText}
              onChange={handleMemberSearchChange}
              allowClear
              prefix={<SearchOutlined />}
            />
          </div>
          <div className="member-filters">
            <Button
              type="primary"
              onClick={handleAddMember}
              icon={<PlusOutlined />}
              className="member-add-btn"
            >
              Add New Member
            </Button>
          </div>
        </div>
      </div>
      <Table
        columns={memberColumns}
        dataSource={filteredMembers}
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
        className="member-table"
      />

      <Modal
        title={editingMember ? "Edit Member Information" : "Add New Member"}
        visible={memberModalVisible}
        onCancel={() => setMemberModalVisible(false)}
        footer={null}
        destroyOnClose
        className="member-modal"
      >
        <Form form={memberForm} layout="vertical" onFinish={handleMemberSubmit}>
          <Form.Item
            name="memberName"
            label="Member Name"
            rules={[{ required: true, message: "Please enter member name" }]}
          >
            <Input className="member-input" />
          </Form.Item>
          <Form.Item
            name="emergencyContact"
            label="Emergency Contact"
            rules={[
              {
                required: true,
                message: "Please enter emergency contact information",
              },
            ]}
          >
            <Input
              placeholder="Name - Phone Number"
              className="member-emergency-contact"
            />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select className="member-select">
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
              <Option value="Pending">Pending</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={4} className="member-notes" />
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
    </>
  );
};

export default MemberCRUD;
