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
        console.log("API Response:", response.data);

        if (response.data.status !== 1 || !Array.isArray(response.data.data)) {
          console.error("Invalid response format:", response.data);
          message.error("Dữ liệu không đúng định dạng!");
          setLoading(false);
          return;
        }

        const doctor = response.data.data.find((doc) => doc.email === email);
        console.log("Found Doctor:", doctor);

        if (!doctor) {
          message.error("Không tìm thấy thông tin bác sĩ!");
          setLoading(false);
          return;
        }

        // Lưu doctorId vào state
        setDoctorId(doctor.doctorId);

        // Lấy thông tin từ đối tượng doctor
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
          specializationName: "", // Sẽ được cập nhật từ API specialization
          description: "", // Sẽ được cập nhật từ API specialization
        };

        // Gọi API để lấy thông tin chuyên khoa
        try {
          const specialization = await axios.get(
            `https://localhost:7279/api/Specializations/${doctor.doctorId}`
          );
          console.log("Specialization Data:", specialization.data);

          if (specialization.data.status === 1 && specialization.data.data) {
            combinedData.specializationName =
              specialization.data.data.specializationName || "";
            combinedData.description =
              specialization.data.data.description || "";
          }
        } catch (error) {
          console.error("Error fetching specialization:", error);
          message.warning("Không thể tải thông tin chuyên khoa");
        }

        setDoctorData(combinedData);
        setImageUrl(doctor.user?.profilePicture || "");
        form.setFieldsValue({
          ...combinedData,
          dateOfBirth: combinedData.dateOfBirth, // Đã được chuyển đổi sang moment ở trên
        });
      } catch (error) {
        console.error("Error fetching doctor data:", error);
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
      const doctorData = {
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

      // Gọi API cập nhật thông tin bác sĩ
      try {
        const doctorResponse = await axios.put(
          `https://localhost:7279/api/Doctors/${doctorId}`,
          doctorData
        );
        console.log("Doctor update response:", doctorResponse.data);
      } catch (error) {
        console.error("Error updating doctor:", error);
        message.error("Cập nhật thông tin bác sĩ thất bại!");
        return;
      }

      // Gọi API cập nhật thông tin chuyên khoa
      try {
        const specializationResponse = await axios.put(
          `https://localhost:7279/api/Specializations/${doctorId}`,
          specializationData
        );
        console.log(
          "Specialization update response:",
          specializationResponse.data
        );
      } catch (error) {
        console.error("Error updating specialization:", error);
        message.warning("Cập nhật thông tin chuyên khoa thất bại!");
      }

      // Cập nhật state và UI
      setDoctorData({
        ...doctorData,
        ...specializationData,
      });
      setEditing(false);
      message.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error in handleSave:", error);
      message.error("Có lỗi xảy ra khi cập nhật thông tin!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue({
      ...doctorData,
      dateOfBirth: doctorData.dateOfBirth, // Đã là moment object
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
        Thông tin cá nhân
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
                <Text strong>{doctorData.name}</Text>
                <Text type="secondary">{doctorData.specializationName}</Text>
              </div>

              {!editing ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  block
                  style={{ marginTop: 16 }}
                >
                  Chỉnh sửa thông tin
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
                    Lưu thông tin
                  </Button>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card>
              <Title level={5}>Thông tin cơ bản</Title>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Họ và tên"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập họ và tên",
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
