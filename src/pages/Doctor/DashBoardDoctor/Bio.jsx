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
import axios from "axios";
import "./Bio.css"; // Đảm bảo import CSS mới

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
          message.error("Không tìm thấy thông tin email!");
          setLoading(false);
          return;
        }

        // Gọi API để lấy danh sách tất cả bác sĩ
        const response = await axios.get("https://localhost:7279/api/Doctors");
        if (response.data.status !== 1 || !Array.isArray(response.data.data)) {
          message.error("Dữ liệu không đúng định dạng!");
          setLoading(false);
          return;
        }

        const doctor = response.data.data.find((doc) => doc.email === email);
        if (!doctor) {
          message.error("Không tìm thấy thông tin bác sĩ!");
          setLoading(false);
          return;
        }

        // Lưu doctorId
        setDoctorId(doctor.doctorId);

        // Kết hợp dữ liệu
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

        // Lấy thông tin chuyên khoa
        try {
          const specialization = await axios.get(
            `https://localhost:7279/api/Specializations/${doctor.doctorId}`
          );
          if (specialization.data.status === 1 && specialization.data.data) {
            combinedData.specializationName =
              specialization.data.data.specializationName || "";
            combinedData.description =
              specialization.data.data.description || "";
          }
        } catch (error) {
          message.warning("Không thể tải thông tin chuyên khoa");
        }

        setDoctorData(combinedData);
        setImageUrl(doctor.user?.profilePicture || "");
        form.setFieldsValue({
          ...combinedData,
          dateOfBirth: combinedData.dateOfBirth,
        });
      } catch (error) {
        message.error("Có lỗi xảy ra khi tải thông tin bác sĩ!");
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
        message.error("Không tìm thấy ID bác sĩ!");
        return;
      }

      // Chuẩn bị dữ liệu cho API Doctors
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

      // Chuẩn bị dữ liệu cho API Specializations
      const specializationData = {
        specializationName: values.specializationName,
        description: values.description,
      };

      // Cập nhật doctor
      try {
        await axios.put(
          `https://localhost:7279/api/Doctors/${doctorId}`,
          doctorDataToUpdate
        );
      } catch (error) {
        message.error("Cập nhật thông tin bác sĩ thất bại!");
        return;
      }

      // Cập nhật specialization
      try {
        await axios.put(
          `https://localhost:7279/api/Specializations/${doctorId}`,
          specializationData
        );
      } catch (error) {
        message.warning("Cập nhật thông tin chuyên khoa thất bại!");
      }

      // Cập nhật state và UI
      setDoctorData({
        ...doctorDataToUpdate,
        ...specializationData,
      });
      setEditing(false);
      message.success("Cập nhật thông tin thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật thông tin!");
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
      // Lấy URL từ file local (giả lập)
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
        Thông tin cá nhân
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
                      style={{ width: "100%" }}
                    />
                  ) : (
                    uploadButton
                  )}
                </Upload>
                <Text strong className="bio-doctor-name">
                  {doctorData.name}
                </Text>
                <Text type="secondary">{doctorData.specializationName}</Text>
              </div>

              {!editing ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  block
                  className="bio-edit-btn"
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <Button onClick={handleCancel} block>
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={loading}
                    block
                  >
                    Lưu
                  </Button>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card className="bio-card">
              <Title level={5}>Thông tin cơ bản</Title>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Họ và tên"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                  >
                    <Input prefix={<UserOutlined />} disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { type: "email", message: "Email không hợp lệ" },
                    ]}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phoneNumber"
                    label="Số điện thoại"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                    ]}
                  >
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="dateOfBirth" label="Ngày sinh">
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                      disabled={!editing}
                      locale={locale}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="status" label="Trạng thái">
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="specializationName"
                    label="Chuyên khoa"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập chuyên khoa",
                      },
                    ]}
                  >
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={5}>Thông tin chuyên môn</Title>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="degree" label="Bằng cấp">
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="hospitalName" label="Tên bệnh viện">
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="hospitalAddress" label="Địa chỉ bệnh viện">
                    <Input disabled={!editing} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="biography" label="Tiểu sử">
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
