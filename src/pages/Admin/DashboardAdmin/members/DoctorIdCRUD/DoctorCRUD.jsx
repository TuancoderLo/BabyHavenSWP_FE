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
import doctorApi from "../../../../../services/DoctorApi";
import moment from "moment";
import "./DoctorCRUD.css";

const { Option } = Select;
const { TextArea } = Input;

const STATUS_MAPPING = {
  Active: "Active",
  Inactive: "Inactive",
};

const STATUS_MAPPING_REVERSE = {
  Active: "Active",
  Inactive: "Inactive",
};

const DoctorCRUD = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorModalVisible, setDoctorModalVisible] = useState(false);
  const [doctorForm] = Form.useForm();
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorApi.getAllDoctors();
      if (Array.isArray(response.data)) {
        setDoctors(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setDoctors(response.data.data);
      } else {
        console.log("Data is not an array:", response.data);
        setDoctors([]);
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
      message.error("Failed to load doctors list");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = () => {
    setEditingDoctor(null);
    doctorForm.resetFields();
    setImageUrl("");
    doctorForm.setFieldsValue({
      status: "Active",
    });
    setDoctorModalVisible(true);
  };

  const handleEditDoctor = (record) => {
    setEditingDoctor(record);
    doctorForm.setFieldsValue({
      doctorId: record.doctorId,
      userName: record.user.username,
      name: record.name,
      email: record.email,
      phoneNumber: record.phoneNumber,
      degree: record.degree,
      hospitalName: record.hospitalName,
      hospitalAddress: record.hospitalAddress,
      biography: record.biography,
      status: STATUS_MAPPING[record.status],
    });
    setDoctorModalVisible(true);
  };

  const handleInactiveDoctor = async (record) => {
    try {
      setLoading(true);
      const doctorData = {
        doctorId: record.doctorId,
        userName: record.user.username,
        name: record.name,
        email: record.email,
        phoneNumber: record.phoneNumber,
        degree: record.degree,
        hospitalName: record.hospitalName,
        hospitalAddress: record.hospitalAddress,
        biography: record.biography,
        status: "Inactive",
      };

      await doctorApi.updateDoctor(record.doctorId, doctorData);
      message.success("Doctor account has been deactivated successfully");
      fetchDoctors();
    } catch (error) {
      console.error("Error deactivating doctor account:", error);
      message.error("Unable to deactivate doctor account");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSubmit = async (values) => {
    try {
      setLoading(true);
      const doctorData = {
        doctorId: editingDoctor ? editingDoctor.doctorId : 0,
        userName: values.userName,
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        degree: values.degree,
        hospitalName: values.hospitalName,
        hospitalAddress: values.hospitalAddress,
        biography: values.biography,
        status: values.status,
      };

      if (editingDoctor) {
        await doctorApi.updateDoctor(editingDoctor.doctorId, doctorData);
        message.success("Doctor information updated successfully");
      } else {
        await doctorApi.createDoctor(doctorData);
        message.success("New doctor added successfully");
      }
      setDoctorModalVisible(false);
      fetchDoctors();
    } catch (error) {
      console.error("Error saving doctor:", error);
      message.error("Unable to save doctor information");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const renderStatus = (status) => {
    let className = "";
    const displayStatus = STATUS_MAPPING[status];

    if (displayStatus === "Active") {
      className = "MemberAdmin-status-active";
    } else if (displayStatus === "Inactive") {
      className = "MemberAdmin-status-inactive";
    }
    return <span className={className}>{displayStatus}</span>;
  };

  const doctorColumns = [
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
      title: "Degree",
      dataIndex: "degree",
      key: "degree",
    },
    {
      title: "Hospital",
      dataIndex: "hospitalName",
      key: "hospitalName",
    },
    {
      title: "Address",
      dataIndex: "hospitalAddress",
      key: "hospitalAddress",
    },
    {
      title: "Biography",
      dataIndex: "biography",
      key: "biography",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => renderStatus(status),
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
            onClick={() => handleEditDoctor(record)}
            className="MemberAdmin-action-button"
          />
          <Popconfirm
            title={`Are you sure you want to deactivate Dr. ${record.name}'s account?`}
            description="The account will be deactivated and unable to login"
            onConfirm={() => handleInactiveDoctor(record)}
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

  const filteredDoctors = doctors.filter((doctor) => {
    const searchLower = searchText.toLowerCase();
    if (!searchText) return true;

    return (
      (doctor.name && doctor.name.toLowerCase().includes(searchLower)) ||
      (doctor.specialization &&
        doctor.specialization.toLowerCase().includes(searchLower)) ||
      (doctor.certificationNumber &&
        doctor.certificationNumber.toLowerCase().includes(searchLower))
    );
  });

  return (
    <>
      <div className="member-header">
        <div className="member-title">Doctors List</div>
        <div className="member-actions">
          <div className="member-search">
            <Input
              placeholder="Search by name, degree, or hospital"
              value={searchText}
              onChange={handleSearchChange}
              allowClear
              prefix={<SearchOutlined />}
            />
          </div>
          <div className="member-filters">
            <Button
              type="primary"
              onClick={handleAddDoctor}
              icon={<PlusOutlined />}
              className="member-add-btn"
            >
              Add New Doctor
            </Button>
          </div>
        </div>
      </div>

      <Table
        columns={doctorColumns}
        dataSource={filteredDoctors}
        rowKey="doctorId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} doctors`,
          showQuickJumper: true,
        }}
        size="middle"
        bordered
        className="member-table"
      />

      <Modal
        title={editingDoctor ? "Edit Doctor Information" : "Add New Doctor"}
        visible={doctorModalVisible}
        onCancel={() => setDoctorModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
        className="member-modal"
      >
        <Form form={doctorForm} layout="vertical" onFinish={handleDoctorSubmit}>
          <div className="member-form-row">
            <Form.Item
              name="userName"
              label="Username"
              className="member-form-col"
            >
              <Input disabled />
            </Form.Item>
            <Form.Item name="email" label="Email" className="member-form-col">
              <Input disabled />
            </Form.Item>
          </div>

          <div className="member-form-row">
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              className="member-form-col"
            >
              <Input disabled />
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
              name="degree"
              label="Degree"
              className="member-form-col"
              rules={[{ required: true, message: "Please enter degree" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="hospitalName"
              label="Hospital Name"
              className="member-form-col"
              rules={[
                { required: true, message: "Please enter hospital name" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="member-form-row">
            <Form.Item
              name="hospitalAddress"
              label="Hospital Address"
              className="member-form-col"
              rules={[
                { required: true, message: "Please enter hospital address" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          <Form.Item
            name="biography"
            label="Biography"
            rules={[{ required: true, message: "Please enter biography" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="Active">
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingDoctor ? "Update" : "Add"}
              </Button>
              <Button onClick={() => setDoctorModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DoctorCRUD;
