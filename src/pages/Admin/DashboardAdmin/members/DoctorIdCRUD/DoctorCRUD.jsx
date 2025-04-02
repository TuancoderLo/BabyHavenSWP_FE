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
    setImageUrl(record.profilePicture || "");
    doctorForm.setFieldsValue({
      ...record,
      dateOfBirth: record.dateOfBirth ? moment(record.dateOfBirth) : null,
      certificationDate: record.certificationDate
        ? moment(record.certificationDate)
        : null,
    });
    setDoctorModalVisible(true);
  };

  const handleDeleteDoctor = async (doctorId) => {
    try {
      setLoading(true);
      await doctorApi.deleteDoctor(doctorId);
      message.success("Doctor deleted successfully");
      fetchDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      message.error("Unable to delete doctor");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSubmit = async (values) => {
    try {
      setLoading(true);
      const doctorData = {
        ...values,
        dateOfBirth: values.dateOfBirth?.format("YYYY-MM-DD"),
        certificationDate: values.certificationDate?.format("YYYY-MM-DD"),
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
    if (status === "Active") {
      className = "MemberAdmin-status-active";
    } else if (status === "Inactive") {
      className = "MemberAdmin-status-inactive";
    } else {
      className = "MemberAdmin-status-pending";
    }
    return <span className={className}>{status}</span>;
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
      title: "Specialization",
      dataIndex: "specialization",
      key: "specialization",
    },
    {
      title: "Certificate No.",
      dataIndex: "certificationNumber",
      key: "certificationNumber",
    },
    {
      title: "Certificate Date",
      dataIndex: "certificationDate",
      key: "certificationDate",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Experience",
      dataIndex: "experience",
      key: "experience",
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
            onClick={() => handleEditDoctor(record)}
            className="MemberAdmin-action-button"
          />
          <Popconfirm
            title="Are you sure you want to delete this doctor?"
            onConfirm={() => handleDeleteDoctor(record.doctorId)}
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
              placeholder="Search by name, specialization, or certificate number"
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
              name="name"
              label="Full Name"
              className="member-form-col"
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="specialization"
              label="Specialization"
              className="member-form-col"
              rules={[
                { required: true, message: "Please enter specialization" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="member-form-row">
            <Form.Item
              name="certificationNumber"
              label="Certificate Number"
              className="member-form-col"
              rules={[
                { required: true, message: "Please enter certificate number" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="certificationDate"
              label="Certificate Date"
              className="member-form-col"
              rules={[
                {
                  required: true,
                  message: "Please select certificate date",
                },
              ]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                placeholder="Select date"
                className="member-date-picker"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="experience"
            label="Experience"
            rules={[{ required: true, message: "Please enter experience" }]}
          >
            <TextArea rows={4} className="member-experience" />
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
                      doctorForm.setFieldsValue({
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
                  <div className="member-avatar-preview">
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
                    doctorForm.setFieldsValue({ profilePicture: "" });
                  }}
                  size="small"
                  style={{ marginTop: 8 }}
                >
                  Remove
                </Button>
              )}
            </div>
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="Active">
            <Select className="member-select">
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
              <Option value="Pending">Pending</Option>
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
