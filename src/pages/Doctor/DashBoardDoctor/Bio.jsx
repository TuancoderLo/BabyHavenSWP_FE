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

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Bio = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [doctorData, setDoctorData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    experience: "",
    education: "",
    certifications: "",
    biography: "",
    birthDate: null,
    gender: "male",
  });

  useEffect(() => {
    // Trong thực tế, bạn sẽ gọi API để lấy thông tin chi tiết của bác sĩ
    // Ở đây tôi sẽ giả lập dữ liệu
    setLoading(true);

    // Lấy một số thông tin từ localStorage
    const name = localStorage.getItem("name") || "";
    const email = localStorage.getItem("email") || "";
    const profilePicture = localStorage.getItem("profilePicture") || "";

    // Giả lập dữ liệu
    setTimeout(() => {
      const mockData = {
        name: name,
        email: email,
        phone: "0912345678",
        specialty: "Pediatrics",
        experience: "5 years",
        education: "Hanoi Medical University",
        certifications: "Certificate in Pediatric Practice",
        biography:
          "I am a pediatrician with over 5 years of experience in child healthcare. I am passionate about my work and always strive to provide the best care for my young patients.",
        birthDate: "1985-05-15",
        gender: "male",
      };

      setDoctorData(mockData);
      setImageUrl(profilePicture);
      form.setFieldsValue({
        ...mockData,
        birthDate: mockData.birthDate ? moment(mockData.birthDate) : null,
      });
      setLoading(false);
    }, 1000);
  }, [form]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async (values) => {
    try {
      setLoading(true);

      // Chuẩn bị dữ liệu để gửi lên server
      const formData = {
        ...values,
        birthDate: values.birthDate
          ? values.birthDate.format("YYYY-MM-DD")
          : null,
        profilePicture: imageUrl,
      };

      // Trong thực tế, bạn sẽ gọi API để cập nhật thông tin
      console.log("Dữ liệu cập nhật:", formData);

      // Giả lập API call thành công
      setTimeout(() => {
        setDoctorData({
          ...doctorData,
          ...formData,
        });
        setEditing(false);
        setLoading(false);
        message.success("Information updated successfully!");
      }, 1000);
    } catch (error) {
      setLoading(false);
      message.error("An error occurred while updating information!");
    }
  };

  const handleCancel = () => {
    form.setFieldsValue({
      ...doctorData,
      birthDate: doctorData.birthDate ? moment(doctorData.birthDate) : null,
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
      // Trong thực tế, URL sẽ được trả về từ response của API upload
      // Ở đây tôi giả lập bằng cách đọc file local
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
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="tab-container">
      <Title level={4} className="section-title">
        Personal Information
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={doctorData}
        className="form-container"
      >
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Card>
              <div className="upload-container">
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188" // Fake API endpoint
                  beforeUpload={beforeUpload}
                  onChange={handleChange}
                  disabled={!editing}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="avatar"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    uploadButton
                  )}
                </Upload>
                <Text strong>{doctorData.name}</Text>
                <Text type="secondary">{doctorData.specialty}</Text>
              </div>

              {!editing ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  block
                  style={{ marginTop: 16 }}
                >
                  Edit Information
                </Button>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <Button onClick={handleCancel} block>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={loading}
                    block
                  >
                    Save Information
                  </Button>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card>
              <Title level={5}>Basic Information</Title>
              <Row gutter={16}>
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
                    name="phone"
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
                  <Form.Item name="birthDate" label="Date of Birth">
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                      disabled={!editing}
                      locale={locale}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="gender" label="Gender">
                    <Select disabled={!editing}>
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                      <Option value="other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="specialty"
                    label="Specialty"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your specialty",
                      },
                    ]}
                  >
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={5}>Professional Information</Title>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="experience" label="Experience">
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="education" label="Education">
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="certifications" label="Certifications">
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
