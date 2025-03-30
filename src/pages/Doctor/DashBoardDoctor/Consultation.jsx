import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Card,
  Typography,
  Tabs,
  Space,
  Drawer,
  Descriptions,
  Avatar,
  Divider,
  Timeline,
  Rate,
  Badge,
} from "antd";
import {
  EyeOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  UserOutlined,
  DownloadOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import moment from "moment";
import doctorApi from "../../../services/DoctorApi";
import "./Consultation.css";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Consultations = () => {
  const [loading, setLoading] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [onGoingConsultations, setOnGoingConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [responseForm] = Form.useForm();
  const [responseVisible, setResponseVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("new");
  const [searchText, setSearchText] = useState("");

  // Filters for Completed and History tabs
  const [historyFilterStatus, setHistoryFilterStatus] = useState("");
  const [historyFilterRating, setHistoryFilterRating] = useState("");

  useEffect(() => {
    if (activeTab === "ongoing") {
      fetchOnGoingConsultations();
    } else {
      fetchConsultations();
    }
  }, [activeTab]);

  useEffect(() => {
    applyFilters();
  }, [
    searchText,
    historyFilterStatus,
    historyFilterRating,
    consultations,
    onGoingConsultations,
  ]);

  const fetchConsultationRequestsById = async (requestId) => {
    try {
      const response = await doctorApi.getConsultationRequestsById(requestId);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết yêu cầu ${requestId}:`, error);
      // Trả về đối tượng mặc định khi API bị lỗi
      return {
        requestId: requestId,
        memberName: "N/A (Dữ liệu không khả dụng)",
        childName: "N/A",
        status: "Pending",
        attachments: [], // Mảng rỗng để tránh lỗi khi hiển thị
        requestDate: new Date().toISOString(),
        description: "Không thể tải thông tin chi tiết. Lỗi máy chủ.",
        child: {
          age: "N/A",
          gender: "N/A",
          allergies: "N/A",
          notes: "N/A",
          dateOfBirth: new Date().toISOString(),
        },
      };
    }
  };

  const parseAttachments = (attachmentsData) => {
    try {
      if (!attachmentsData) return [];

      // Nếu đã là mảng, trả về luôn
      if (Array.isArray(attachmentsData)) return attachmentsData;

      // Nếu là chuỗi, parse thành JSON
      if (typeof attachmentsData === "string") {
        if (attachmentsData.trim() === "") return [];

        try {
          // Thử parse bình thường trước
          const parsedData = JSON.parse(attachmentsData);

          // Nếu kết quả vẫn là string (có thể là chuỗi JSON được escape)
          if (typeof parsedData === "string") {
            // Parse lần thứ hai
            return JSON.parse(parsedData);
          }

          return Array.isArray(parsedData) ? parsedData : [parsedData];
        } catch (innerError) {
          console.error("Lỗi khi parse attachments (inner):", innerError);
          // Thêm log để xem chuỗi gốc
          console.log("Chuỗi attachments gốc:", attachmentsData);
          return [];
        }
      }

      // Nếu là đối tượng đơn (không phải mảng), bọc trong mảng
      if (typeof attachmentsData === "object") {
        return [attachmentsData];
      }

      return [];
    } catch (error) {
      console.error("Lỗi khi parse attachments:", error);
      return [];
    }
  };

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const doctorId = localStorage.getItem("doctorId");
      if (!doctorId) {
        message.error("Doctor ID not found in localStorage!");
        return;
      }

      let requests = [];
      try {
        const response = await doctorApi.getConsultationRequestsByDoctorOData(
          doctorId
        );
        requests = Array.isArray(response) ? response : response.data;
      } catch (error) {
        console.error("Error fetching consultation requests:", error);
        message.error("Không thể lấy danh sách yêu cầu tư vấn!");
        setLoading(false);
        return;
      }

      // Xử lý từng yêu cầu một, bỏ qua các yêu cầu bị lỗi
      const detailedRequests = [];
      for (const request of requests) {
        try {
          // Sử dụng hàm cải tiến
          const detailedData = await fetchConsultationRequestsById(
            request.requestId
          );

          let responses = [];
          try {
            const responseData = await doctorApi.getConsultationResponsesOData(
              `?$filter=requestId eq ${request.requestId}`
            );
            responses = responseData.data || [];
          } catch (respError) {
            console.error(
              `Error fetching responses for request ${request.requestId}:`,
              respError
            );
            responses = [];
          }

          const latestResponse = responses[0] || {};

          // Xử lý rating
          let rating = 0;
          if (latestResponse.responseId) {
            try {
              const feedbackResponse =
                await doctorApi.getRatingFeedbackByResponseId(
                  latestResponse.responseId
                );
              const feedbackData = feedbackResponse.data[0] || {};
              rating = feedbackData.rating || 0;
            } catch (error) {
              console.error(
                `Error fetching rating for response ${latestResponse.responseId}:`,
                error
              );
            }
          }

          // Xử lý attachments sử dụng hàm parseAttachments
          const attachmentsArray = parseAttachments(detailedData.attachments);

          // Tạo đối tượng yêu cầu chi tiết
          detailedRequests.push({
            id: request.requestId,
            requestId: request.requestId,
            parentName: detailedData.memberName || "N/A",
            parentAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
            childName: detailedData.childName || "N/A",
            childAge: detailedData.child?.age
              ? `${detailedData.child.age} tuổi`
              : "N/A",
            childGender: detailedData.child?.gender || "N/A",
            childAllergies: detailedData.child?.allergies || "None",
            childNotes: detailedData.child?.notes || "None",
            childDateOfBirth: detailedData.child?.dateOfBirth || "N/A",
            requestDate: detailedData.requestDate || moment().format(),
            topic: detailedData.category || "N/A",
            description: detailedData.description || "N/A",
            urgency: detailedData.urgency?.toLowerCase() || "normal",
            status: detailedData.status || "Pending",
            attachments: attachmentsArray,
            createdAt: detailedData.createdAt || moment().format(),
            updatedAt: detailedData.updatedAt || moment().format(),
            response: latestResponse.content || "",
            rating: rating,
            completedDate:
              detailedData.status === "Completed"
                ? detailedData.updatedAt
                : null,
          });
        } catch (error) {
          console.error(`Lỗi khi xử lý yêu cầu ${request.requestId}:`, error);
          // Bỏ qua yêu cầu bị lỗi
        }
      }

      console.log(
        `Đã xử lý thành công ${detailedRequests.length}/${requests.length} yêu cầu.`
      );
      setConsultations(detailedRequests);
    } catch (error) {
      message.error("Failed to fetch consultation requests!");
      console.error("Error fetching consultations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOnGoingConsultations = async () => {
    setLoading(true);
    try {
      const doctorId = localStorage.getItem("doctorId");
      if (!doctorId) {
        message.error("Doctor ID not found in localStorage!");
        return;
      }

      const requests = await doctorApi.getConsultationRequestsByDoctorAndStatus(
        doctorId,
        "Approved"
      );
      console.log("Requests from API for Ongoing:", requests);

      // Xử lý từng yêu cầu một, bỏ qua các yêu cầu bị lỗi
      const detailedRequests = [];
      for (const request of requests) {
        try {
          const detailedData = await fetchConsultationRequestsById(
            request.requestId
          );
          if (detailedData.status !== "Approved") continue;

          const responses = await doctorApi.getConsultationResponsesOData(
            `?$filter=requestId eq ${request.requestId}`
          );
          const latestResponse = responses.data[0] || {};

          // Lấy rating từ API RatingFeedback nếu có response
          let rating = 0;
          if (latestResponse.responseId) {
            const feedbackResponse =
              await doctorApi.getRatingFeedbackByResponseId(
                latestResponse.responseId
              );
            const feedbackData = feedbackResponse.data[0] || {};
            rating = feedbackData.rating || 0;
          }

          // Sử dụng hàm parseAttachments cải tiến
          const attachmentsArray = parseAttachments(detailedData.attachments);

          detailedRequests.push({
            id: request.requestId,
            requestId: request.requestId,
            parentName: detailedData.memberName || "N/A",
            parentAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
            childName: detailedData.childName || "N/A",
            childAge: detailedData.child?.age
              ? `${detailedData.child.age} tuổi`
              : "N/A",
            childGender: detailedData.child?.gender || "N/A",
            childAllergies: detailedData.child?.allergies || "None",
            childNotes: detailedData.child?.notes || "None",
            childDateOfBirth: detailedData.child?.dateOfBirth || "N/A",
            requestDate: detailedData.requestDate || moment().format(),
            description: detailedData.description || "N/A",
            status: detailedData.status,
            response: latestResponse.content || "",
            rating: rating, // Sử dụng rating từ API RatingFeedback
            createdAt: detailedData.createdAt || moment().format(),
            updatedAt: detailedData.updatedAt || moment().format(),
            completedDate:
              detailedData.status === "Completed"
                ? detailedData.updatedAt
                : null,
            attachments: attachmentsArray,
          });
        } catch (error) {
          console.error(`Lỗi khi xử lý yêu cầu ${request.requestId}:`, error);
          // Bỏ qua yêu cầu này
        }
      }

      console.log("Mapped Ongoing Consultations:", detailedRequests);
      setOnGoingConsultations(detailedRequests);
    } catch (error) {
      message.error("Failed to fetch ongoing consultations!");
      console.error("Error fetching ongoing consultations:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = [];
    if (activeTab === "ongoing") {
      data = onGoingConsultations.filter((item) => item.status === "Approved"); // Đảm bảo chỉ lấy Approved
      if (searchText) {
        data = data.filter(
          (item) =>
            item.parentName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.childName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.description.toLowerCase().includes(searchText.toLowerCase())
        );
      }
    } else if (activeTab === "completed") {
      data = consultations.filter((item) => item.status === "Completed");
      if (searchText) {
        data = data.filter(
          (item) =>
            item.parentName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.childName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.description.toLowerCase().includes(searchText.toLowerCase()) ||
            (item.response &&
              item.response.toLowerCase().includes(searchText.toLowerCase()))
        );
      }
    } else if (activeTab === "history") {
      data = [...consultations];
      if (historyFilterStatus) {
        data = data.filter((item) => item.status === historyFilterStatus);
      }
      if (historyFilterRating) {
        data = data.filter(
          (item) => item.rating.toString() === historyFilterRating
        );
      }
      if (searchText) {
        data = data.filter(
          (item) =>
            item.parentName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.childName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.description.toLowerCase().includes(searchText.toLowerCase()) ||
            (item.response &&
              item.response.toLowerCase().includes(searchText.toLowerCase()))
        );
      }
    } else {
      // Tab "new" chỉ hiển thị Pending
      data = consultations.filter((item) => item.status === "Pending");
      if (searchText) {
        data = data.filter(
          (item) =>
            item.parentName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.childName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.description.toLowerCase().includes(searchText.toLowerCase())
        );
      }
    }
    setFilteredConsultations(data);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleViewDetail = (record) => {
    setSelectedConsultation(record);
    setDetailVisible(true);
  };

  const handleRespond = (record) => {
    setSelectedConsultation(record);
    responseForm.resetFields();
    setResponseVisible(true);
  };

  const handleResponseSubmit = async (values) => {
    setLoading(true);
    try {
      const statusMapForResponse = {
        approved: 1,
        rejected: 2,
        pending: 0,
        completed: 3,
      };
      const statusMapForRequest = {
        approved: "Approved",
        rejected: "Rejected",
        pending: "Pending",
        completed: "Completed",
      };

      const numericStatus = statusMapForResponse[values.action];
      const stringStatus = statusMapForRequest[values.action];

      const responsePayload = {
        requestId: selectedConsultation.requestId,
        content: values.response,
        attachments: [],
        isHelpful: true,
        status: numericStatus,
      };

      await doctorApi.createConsultationResponse(responsePayload);
      await doctorApi.updateConsultationRequestsStatus(
        selectedConsultation.requestId,
        stringStatus
      );

      await fetchConsultations();
      setResponseVisible(false);
      message.success(
        values.action === "approved"
          ? "Consultation request approved"
          : values.action === "rejected"
          ? "Consultation request rejected"
          : "Response submitted successfully"
      );
    } catch (error) {
      message.error("Failed to submit response!");
      console.error("Error submitting consultation response:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (record) => {
    setLoading(true);
    try {
      await doctorApi.updateConsultationRequestsStatus(
        record.requestId,
        "Completed"
      );
      await fetchConsultations();
      message.success("Consultation completed");
    } catch (error) {
      message.error("Failed to complete consultation!");
      console.error("Error completing consultation:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "Pending":
        return <Tag color="blue">Pending</Tag>;
      case "Approved":
        return <Tag color="orange">Approved</Tag>;
      case "Rejected":
        return <Tag color="red">Rejected</Tag>;
      case "Completed":
        return <Tag color="green">Completed</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const newRequestColumns = [
    {
      title: "Parent",
      dataIndex: "parentName",
      key: "parentName",
      render: (text, record) => (
        <div className="consult-parent-info">
          <Avatar src={record.parentAvatar} icon={<UserOutlined />} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Child",
      dataIndex: "childName",
      key: "childName",
      render: (text, record) => (
        <div>
          {text} <br />
          <span className="consult-child-age">{record.childAge}</span>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Details
          </Button>
          {record.status === "Pending" && (
            <Button
              type="primary"
              icon={<MessageOutlined />}
              onClick={() => handleRespond(record)}
            >
              Respond
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const columns = [
    {
      title: "Parent",
      dataIndex: "parentName",
      key: "parentName",
      render: (text, record) => (
        <div className="consult-parent-info">
          <Avatar src={record.parentAvatar} icon={<UserOutlined />} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Child",
      dataIndex: "childName",
      key: "childName",
      render: (text, record) => (
        <div>
          {text} <br />
          <span className="consult-child-age">{record.childAge}</span>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (rating ? <Rate disabled value={rating} /> : "-"),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Details
          </Button>
          {record.status === "Pending" && (
            <Button
              type="primary"
              icon={<MessageOutlined />}
              onClick={() => handleRespond(record)}
            >
              Respond
            </Button>
          )}
          {record.status === "Approved" && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record)}
            >
              Complete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const newRequestsCount = consultations.filter(
    (item) => item.status === "Pending"
  ).length;

  const downloadAttachment = (attachment) => {
    try {
      // Hỗ trợ cả viết hoa và viết thường cho tên trường
      const fileName =
        attachment.fileName || attachment.FileName || "download.file";
      const content = attachment.content || attachment.Content || "";
      const mimeType =
        attachment.mimeType ||
        attachment.MimeType ||
        "application/octet-stream";

      if (!content) {
        message.error(`Thiếu nội dung tệp đính kèm cho "${fileName}"`);
        return;
      }

      // Chuyển đổi Base64 thành tệp và tải xuống
      const byteCharacters = atob(content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success(`Đã tải xuống tệp ${fileName}`);
    } catch (error) {
      console.error("Lỗi khi tải xuống tệp:", error);
      message.error(`Không thể tải xuống tệp tin: ${error.message}`);
    }
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return <FileOutlined />;
    if (mimeType.includes("pdf")) return <FilePdfOutlined />;
    if (mimeType.includes("image")) return <FileImageOutlined />;
    if (mimeType.includes("word") || mimeType.includes("doc"))
      return <FileWordOutlined />;
    return <FileTextOutlined />;
  };

  const renderAttachments = (attachments) => {
    if (
      !attachments ||
      !Array.isArray(attachments) ||
      attachments.length === 0
    ) {
      return <p>Không có tệp đính kèm</p>;
    }

    return attachments.map((attachment, index) => {
      if (!attachment) return null;

      const fileName =
        attachment.fileName || attachment.FileName || `Tệp ${index + 1}`;
      const mimeType =
        attachment.mimeType ||
        attachment.MimeType ||
        "application/octet-stream";

      return (
        <div key={index} className="attachment-item">
          <div className="attachment-info">
            <span className="attachment-icon">{getFileIcon(mimeType)}</span>
            <span className="attachment-name">{fileName}</span>
            <span className="attachment-type">{mimeType}</span>
          </div>
          <Button
            type="primary"
            size="small"
            onClick={() => downloadAttachment(attachment)}
            icon={<DownloadOutlined />}
          >
            Tải xuống
          </Button>
        </div>
      );
    });
  };

  useEffect(() => {
    const attachmentStyles = `
      .attachments-container {
        border: 1px solid #f0f0f0;
        border-radius: 4px;
        padding: 12px;
        margin-top: 8px;
        margin-bottom: 16px;
      }
      
      .attachment-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #f0f0f0;
        margin-bottom: 4px;
      }
      
      .attachment-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }
      
      .attachment-info {
        display: flex;
        align-items: center;
        flex: 1;
      }
      
      .attachment-icon {
        margin-right: 8px;
        font-size: 18px;
        color: #1890ff;
      }
      
      .attachment-name {
        font-weight: 500;
        margin-right: 12px;
      }
      
      .attachment-type {
        font-size: 12px;
        color: #8c8c8c;
      }
    `;

    // Thêm style vào document
    const styleElement = document.createElement("style");
    styleElement.innerHTML = attachmentStyles;
    document.head.appendChild(styleElement);

    // Cleanup khi component unmount
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  return (
    <div className="consult-container">
      <Card className="consult-card">
        <Title level={3} className="consult-title">
          Consultations
        </Title>

        <div
          className="consult-header"
          style={{ display: "flex", alignItems: "center" }}
        >
          <Input
            placeholder="Search by parent, child, or description"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            style={{ width: 300 }}
          />
          {activeTab === "history" && (
            <div style={{ display: "flex", gap: "10px", marginLeft: 10 }}>
              <Select
                placeholder="Filter by Status"
                value={historyFilterStatus}
                onChange={setHistoryFilterStatus}
                style={{ width: 150 }}
                allowClear
              >
                <Option value="">All</Option>
                <Option value="Pending">Pending</Option>
                <Option value="Approved">Approved</Option>
                <Option value="Rejected">Rejected</Option>
                <Option value="Completed">Completed</Option>
              </Select>
              <Select
                placeholder="Filter by Rating"
                value={historyFilterRating}
                onChange={setHistoryFilterRating}
                style={{ width: 150 }}
                allowClear
              >
                <Option value="">All</Option>
                {[1, 2, 3, 4, 5].map((rate) => (
                  <Option key={rate} value={rate.toString()}>
                    {rate} Stars
                  </Option>
                ))}
              </Select>
            </div>
          )}
          <Button
            type="primary"
            onClick={
              activeTab === "ongoing"
                ? fetchOnGoingConsultations
                : fetchConsultations
            }
            loading={loading}
            className="consult-refresh-btn"
            style={{ marginLeft: "auto" }}
          >
            Refresh
          </Button>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "new",
              label: (
                <span>
                  New Requests{" "}
                  {newRequestsCount > 0 && (
                    <Badge
                      count={newRequestsCount}
                      style={{ backgroundColor: "#e92121" }}
                    />
                  )}
                </span>
              ),
              children: (
                <Table
                  columns={newRequestColumns}
                  dataSource={filteredConsultations}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 5 }}
                />
              ),
            },
            {
              key: "ongoing",
              label: "Ongoing",
              children: (
                <Table
                  columns={columns}
                  dataSource={filteredConsultations}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 5 }}
                />
              ),
            },
            {
              key: "completed",
              label: "Completed",
              children: (
                <Table
                  columns={columns}
                  dataSource={filteredConsultations}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 5 }}
                />
              ),
            },
            {
              key: "history",
              label: "History",
              children: (
                <Table
                  columns={columns}
                  dataSource={filteredConsultations}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 5 }}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Respond to Consultation Request"
        open={responseVisible}
        onCancel={() => setResponseVisible(false)}
        footer={null}
        width={600}
      >
        {selectedConsultation && (
          <Form
            form={responseForm}
            layout="vertical"
            onFinish={handleResponseSubmit}
            initialValues={{ action: "approved" }}
          >
            <Divider orientation="left">Consultation Information</Divider>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Parent">
                {selectedConsultation.parentName}
              </Descriptions.Item>
              <Descriptions.Item label="Child">
                {selectedConsultation.childName} (
                {selectedConsultation.childAge})
              </Descriptions.Item>
              <Descriptions.Item label="Request Date">
                {moment(selectedConsultation.requestDate).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedConsultation.description}
              </Descriptions.Item>
            </Descriptions>

            {selectedConsultation?.attachments && (
              <>
                <Divider orientation="left">Tệp đính kèm</Divider>
                <div className="attachments-container">
                  {renderAttachments(selectedConsultation.attachments)}
                </div>
              </>
            )}

            <Divider orientation="left">Child Information</Divider>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Date of Birth">
                {moment(selectedConsultation.childDateOfBirth).format(
                  "DD/MM/YYYY"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {selectedConsultation.childGender}
              </Descriptions.Item>
              <Descriptions.Item label="Allergies">
                {selectedConsultation.childAllergies}
              </Descriptions.Item>
              <Descriptions.Item label="Notes">
                {selectedConsultation.childNotes}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Response</Divider>
            <Form.Item
              name="action"
              label="Action"
              rules={[{ required: true, message: "Please select an action" }]}
            >
              <Select>
                <Option value="approved">Approve Request</Option>
                <Option value="rejected">Reject Request</Option>
              </Select>
            </Form.Item>

            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) =>
                getFieldValue("action") === "rejected" ? (
                  <Form.Item
                    name="rejectReason"
                    label="Reject Reason"
                    rules={[{ required: true, message: "Please enter reason" }]}
                  >
                    <TextArea rows={4} placeholder="Enter reject reason" />
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <Form.Item
              name="response"
              label="Response"
              rules={[{ required: true, message: "Please enter response" }]}
            >
              <TextArea rows={4} placeholder="Enter response to parent" />
            </Form.Item>

            <Form.Item>
              <div className="consult-modal-buttons">
                <Button onClick={() => setResponseVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Send Response
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Drawer
        title="Consultation Details"
        placement="right"
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        width={500}
      >
        {selectedConsultation && (
          <>
            <Divider orientation="left">Consultation Information</Divider>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedConsultation.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Parent">
                <div className="consult-drawer-parent">
                  <Avatar
                    src={selectedConsultation.parentAvatar}
                    size="small"
                  />
                  <span>{selectedConsultation.parentName}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Child">
                {selectedConsultation.childName} (
                {selectedConsultation.childAge})
              </Descriptions.Item>
              <Descriptions.Item label="Request Date">
                {moment(selectedConsultation.requestDate).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedConsultation.description}
              </Descriptions.Item>
            </Descriptions>

            {selectedConsultation?.attachments && (
              <>
                <Divider orientation="left">Tệp đính kèm</Divider>
                <div className="attachments-container">
                  {renderAttachments(selectedConsultation.attachments)}
                </div>
              </>
            )}

            <Divider orientation="left">Child Information</Divider>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Date of Birth">
                {moment(selectedConsultation.childDateOfBirth).format(
                  "DD/MM/YYYY"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {selectedConsultation.childGender}
              </Descriptions.Item>
              <Descriptions.Item label="Allergies">
                {selectedConsultation.childAllergies}
              </Descriptions.Item>
              <Descriptions.Item label="Notes">
                {selectedConsultation.childNotes}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">System Information</Divider>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Created At">
                {moment(selectedConsultation.createdAt).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {moment(selectedConsultation.updatedAt).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Progress</Divider>
            <Timeline>
              <Timeline.Item>
                <p>
                  <strong>Request</strong> -{" "}
                  {moment(selectedConsultation.requestDate).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </p>
                <Card size="small">
                  <p>{selectedConsultation.description}</p>
                </Card>
              </Timeline.Item>
              {selectedConsultation.response && (
                <Timeline.Item>
                  <p>
                    <strong>Response</strong> -{" "}
                    {moment(selectedConsultation.updatedAt).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </p>
                  <Card size="small">
                    <p>{selectedConsultation.response}</p>
                  </Card>
                </Timeline.Item>
              )}
              {selectedConsultation.status === "Rejected" && (
                <Timeline.Item color="red">
                  <p>
                    <strong>Rejected</strong>
                  </p>
                  <Card size="small">
                    <p>{selectedConsultation.rejectReason}</p>
                  </Card>
                </Timeline.Item>
              )}
              {selectedConsultation.completedDate && (
                <Timeline.Item color="green">
                  <p>
                    <strong>Completed</strong> -{" "}
                    {moment(selectedConsultation.completedDate).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </p>
                </Timeline.Item>
              )}
            </Timeline>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default Consultations;
