import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Select,
  DatePicker,
  Spin,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import moment from "moment";
import locale from "antd/es/date-picker/locale/vi_VN";
import doctorApi from "../../../services/DoctorApi";
import "./Bio.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

const Bio = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [doctorData, setDoctorData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    degree: "",
    hospitalName: "",
    hospitalAddress: "",
    biography: "",
    status: "",
    specializationName: "",
    description: "",
    dateOfBirth: null,
    profilePicture: "",
  });
  const [doctorId, setDoctorId] = useState(null);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const email = localStorage.getItem("email");
        if (!email) {
          message.error("Email information not found!");
          setLoading(false);
          return;
        }

        const response = await doctorApi.getAllDoctors();
        if (response.status !== 1 || !Array.isArray(response.data)) {
          message.error("Data format is incorrect!");
          setLoading(false);
          return;
        }

        const doctor = response.data.find((doc) => doc.email === email);
        if (!doctor) {
          message.error("Doctor information not found!");
          setLoading(false);
          return;
        }

        setDoctorId(doctor.doctorId);

        const combinedData = {
          name: doctor.name || "",
          email: doctor.email || "",
          phoneNumber: doctor.phoneNumber || "",
          degree: doctor.degree || "",
          hospitalName: doctor.hospitalName || "",
          hospitalAddress: doctor.hospitalAddress || "",
          biography: doctor.biography || "",
          status: doctor.status || "",
          dateOfBirth: doctor.user?.dateOfBirth
            ? moment(doctor.user.dateOfBirth)
            : null,
          profilePicture: doctor.user?.profilePicture || "",
          specializationName: "",
          description: "",
        };

        try {
          const specialization = await doctorApi.getDoctorSpecializations(
            doctor.doctorId
          );
          if (specialization.status === 1 && specialization.data) {
            combinedData.specializationName =
              specialization.data.specializationName || "";
            combinedData.description = specialization.data.description || "";
          }
        } catch (error) {
          message.warning("Unable to load specialization information!");
        }

        setDoctorData(combinedData);
        setImageUrl(doctor.user?.profilePicture || "");
        form.setFieldsValue({
          ...combinedData,
          dateOfBirth: combinedData.dateOfBirth,
        });
      } catch (error) {
        message.error("An error occurred while loading doctor information!");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [form]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async (values) => {
    try {
      setLoading(true);
      if (!doctorId) {
        message.error("Doctor ID not found!");
        return;
      }

      const doctorDataToUpdate = {
        userName: values.userName || "",
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        degree: values.degree,
        hospitalName: values.hospitalName,
        hospitalAddress: values.hospitalAddress,
        biography: values.biography,
        status: values.status,
      };

      const specializationData = {
        specializationName: values.specializationName,
        description: values.description,
      };

      try {
        await doctorApi.updateDoctor(doctorId, doctorDataToUpdate);
      } catch (error) {
        message.error("Failed to update doctor information!");
        return;
      }

      try {
        await doctorApi.updateDoctorSpecialization(
          doctorId,
          specializationData
        );
      } catch (error) {
        message.warning("Failed to update specialization information!");
      }

      setDoctorData({
        ...doctorDataToUpdate,
        ...specializationData,
      });
      setEditing(false);
      message.success("Information updated successfully!");
    } catch (error) {
      message.error("An error occurred while updating information!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue({
      ...doctorData,
      dateOfBirth: doctorData.dateOfBirth,
    });
    setEditing(false);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG files!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      return;
    }
    if (info.file.status === "done") {
      getBase64(info.file.originFileObj, (url) => {
        setImageUrl(url);
      });
    }
  };

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const uploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>Upload Image</div>
    </div>
  );

  if (loading && !editing) {
    return (
      <div className="bio-loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bio-container">
      <Title level={3} className="bio-title">
        Personal Information
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={doctorData}
        className="bio-form"
      >
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Card className="bio-card">
              <div className="bio-avatar-upload">
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                  beforeUpload={beforeUpload}
                  onChange={handleChange}
                  disabled={!editing}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    uploadButton
                  )}
                </Upload>
                <Text strong className="bio-doctor-name">
                  {doctorData.name}
                </Text>
                <Text className="bio-doctor-specialization">
                  {doctorData.specializationName}
                </Text>
              </div>

              {!editing ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  block
                  className="bio-edit-btn"
                >
                  Edit
                </Button>
              ) : (
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <Button
                    onClick={handleCancel}
                    block
                    className="bio-cancel-btn"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={loading}
                    block
                    className="bio-save-btn"
                  >
                    Save
                  </Button>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card className="bio-card">
              <Title level={5} className="bio-section-title">
                Basic Information
              </Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your full name",
                      },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      { type: "email", message: "Invalid email format" },
                    ]}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phoneNumber"
                    label="Phone Number"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your phone number",
                      },
                    ]}
                  >
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="dateOfBirth" label="Date of Birth">
                    <DatePicker
                      format="MM/DD/YYYY"
                      style={{ width: "100%" }}
                      disabled={!editing}
                      locale={locale}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="status" label="Status">
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="specializationName"
                    label="Specialization"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your specialization",
                      },
                    ]}
                  >
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={5} className="bio-section-title">
                Professional Information
              </Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item name="degree" label="Degree">
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="hospitalName" label="Hospital Name">
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="hospitalAddress" label="Hospital Address">
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="biography" label="Biography">
                    <TextArea rows={4} disabled={!editing} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default Bio;
