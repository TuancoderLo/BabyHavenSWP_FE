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
  Spin,
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
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [responseForm] = Form.useForm();
  const [responseVisible, setResponseVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("new");
  const [searchText, setSearchText] = useState("");

  // [CHANGED] Xoá biến historyFilterRating
  // và mọi logic filter rating bên ngoài
  const [historyFilterStatus, setHistoryFilterStatus] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const [cache, setCache] = useState({
    consultationDetails: {},
    lastFetch: {
      consultations: null,
    },
  });

  const [totalNewRequestsCount, setTotalNewRequestsCount] = useState(0);

  const getConsultationDetailFromCache = (requestId) => {
    return cache.consultationDetails[requestId];
  };

  const cacheConsultationDetail = (requestId, detailData) => {
    setCache((prev) => ({
      ...prev,
      consultationDetails: {
        ...prev.consultationDetails,
        [requestId]: {
          data: detailData,
          timestamp: new Date().getTime(),
        },
      },
    }));
  };

  useEffect(() => {
    fetchConsultationsWithPagination(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, historyFilterStatus, consultations]);

  // Lấy chi tiết request (có cache)
  const fetchConsultationRequestsById = async (requestId) => {
    const cachedData = getConsultationDetailFromCache(requestId);
    const currentTime = new Date().getTime();

    if (cachedData && currentTime - cachedData.timestamp < 5 * 60 * 1000) {
      return cachedData.data;
    }

    try {
      const response = await doctorApi.getConsultationRequestsById(requestId);
      const detailData = response.data;
      cacheConsultationDetail(requestId, detailData);
      return detailData;
    } catch (error) {
      console.error(`Error when getting request details ${requestId}:`, error);
      // Trả về mặc định khi lỗi
      return {
        requestId,
        memberName: "N/A (Data unavailable)",
        childName: "N/A",
        status: "Pending",
        attachments: [],
        requestDate: new Date().toISOString(),
        description: "Unable to load detail information. Server error.",
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
      if (Array.isArray(attachmentsData)) return attachmentsData;

      if (typeof attachmentsData === "string") {
        if (!attachmentsData.trim()) return [];
        try {
          const parsedData = JSON.parse(attachmentsData);

          if (typeof parsedData === "string") {
            return JSON.parse(parsedData);
          }
          return Array.isArray(parsedData) ? parsedData : [parsedData];
        } catch (innerError) {
          console.error("Lỗi khi parse attachments (inner):", innerError);
          console.log("Chuỗi attachments gốc:", attachmentsData);
          return [];
        }
      }
      if (typeof attachmentsData === "object") {
        return [attachmentsData];
      }
      return [];
    } catch (error) {
      console.error("Lỗi khi parse attachments:", error);
      return [];
    }
  };

  // Thêm hàm helper để sắp xếp theo thời gian mới nhất
  const sortByDateDesc = (items) => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.requestDate);
      const dateB = new Date(b.requestDate);
      return dateB - dateA; // Sắp xếp giảm dần (mới nhất đầu tiên)
    });
  };

  // Sửa lại hàm fetchConsultationsWithPagination để sắp xếp trước khi phân trang
  const fetchConsultationsWithPagination = async (page = 1, pageSize = 5) => {
    setLoading(true);
    try {
      const doctorId = localStorage.getItem("doctorId");
      if (!doctorId) {
        message.error("Doctor ID not found in localStorage!");
        return;
      }

      const response = await doctorApi.getConsultationRequestsByDoctorOData(
        doctorId
      );
      const allRequests = Array.isArray(response)
        ? response
        : response.data || [];

      // Tính tổng số yêu cầu mới (Pending) từ tất cả yêu cầu
      const totalPendingRequests = allRequests.filter(
        (item) => item.status === "Pending"
      ).length;

      // Cập nhật state lưu tổng số yêu cầu mới
      setTotalNewRequestsCount(totalPendingRequests);

      // Lọc theo tab
      let filteredData = allRequests;
      if (activeTab === "new") {
        filteredData = allRequests.filter((item) => item.status === "Pending");
      } else if (activeTab === "completed") {
        filteredData = allRequests.filter(
          (item) => item.status === "Completed"
        );
      } else if (activeTab === "history") {
        // hiển thị tất cả (nếu muốn)
      }

      // Sắp xếp theo thời gian mới nhất
      filteredData = sortByDateDesc(filteredData);

      const total = filteredData.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      const basicRequests = paginatedData.map((req) => ({
        id: req.requestId,
        requestId: req.requestId,
        parentName: req.memberName || "N/A",
        childName: req.childName || "N/A",
        requestDate: req.requestDate || moment().format(),
        status: req.status || "Pending",
      }));

      setConsultations(basicRequests);
      setPagination({
        current: page,
        pageSize,
        total,
      });
    } catch (error) {
      message.error("Failed to fetch consultation requests!");
      console.error("Error fetching consultations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật hàm applyFilters để duy trì thứ tự sắp xếp
  const applyFilters = () => {
    let data = [...consultations];

    if (activeTab === "completed") {
      data = data.filter((item) => item.status === "Completed");
    } else if (activeTab === "history") {
      if (historyFilterStatus) {
        data = data.filter((item) => item.status === historyFilterStatus);
      }
    } else {
      // Tab "new" => Pending
      data = data.filter((item) => item.status === "Pending");
    }

    if (searchText) {
      data = data.filter(
        (item) =>
          item.parentName?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.childName?.toLowerCase().includes(searchText.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Dữ liệu đã được sắp xếp từ API, không cần sắp xếp lại ở đây
    setFilteredConsultations(data);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Khi xem chi tiết
  const handleViewDetail = async (record) => {
    try {
      setSelectedConsultation({ ...record, isLoading: true });
      setDetailVisible(true);

      const detailedData = await fetchConsultationRequestsById(
        record.requestId
      );

      // Lấy responses
      const responses = await doctorApi.getConsultationResponsesOData(
        `?$filter=requestId eq ${record.requestId}`
      );
      const latestResponse = responses.data[0] || {};

      // Lấy rating, comment, feedbackDate
      let rating = 0;
      let comment = "";
      let feedbackDate = "";
      if (latestResponse.responseId) {
        try {
          const feedbackResponse =
            await doctorApi.getRatingFeedbackByResponseId(
              latestResponse.responseId
            );
          const feedbackData = feedbackResponse.data[0] || {};
          rating = feedbackData.rating || 0;
          comment = feedbackData.comment || "";
          feedbackDate = feedbackData.feedbackDate || "";
        } catch (error) {
          console.error(
            `Error fetching feedback for responseId=${latestResponse.responseId}:`,
            error
          );
        }
      }

      const attachmentsArray = parseAttachments(detailedData.attachments);

      setSelectedConsultation({
        ...record,
        isLoading: false,
        childAge: detailedData.child?.age
          ? `${detailedData.child.age} years old`
          : "N/A",
        childGender: detailedData.child?.gender || "N/A",
        childAllergies: detailedData.child?.allergies || "None",
        childNotes: detailedData.child?.notes || "None",
        childDateOfBirth: detailedData.child?.dateOfBirth || "N/A",
        description: detailedData.description || "N/A",
        attachments: attachmentsArray,
        response: latestResponse.content || "",
        createdAt: detailedData.createdAt || moment().format(),
        updatedAt: detailedData.updatedAt || moment().format(),
        completedDate:
          detailedData.status === "Completed" ? detailedData.updatedAt : null,

        // [CHANGED] Lưu thêm rating, comment, feedbackDate trong selectedConsultation
        rating,
        comment,
        feedbackDate,
      });
    } catch (error) {
      message.error("Unable to load details");
      console.error("Error fetching consultation detail:", error);
    }
  };

  const handleRespond = async (record) => {
    try {
      setSelectedConsultation({ ...record, isLoading: true });
      responseForm.resetFields();
      setResponseVisible(true);

      const detailedData = await fetchConsultationRequestsById(
        record.requestId
      );
      const attachmentsArray = parseAttachments(detailedData.attachments);

      setSelectedConsultation({
        ...record,
        isLoading: false,
        childAge: detailedData.child?.age
          ? `${detailedData.child.age} years old`
          : "N/A",
        childGender: detailedData.child?.gender || "N/A",
        childAllergies: detailedData.child?.allergies || "None",
        childNotes: detailedData.child?.notes || "None",
        childDateOfBirth: detailedData.child?.dateOfBirth || "N/A",
        description: detailedData.description || "N/A",
        attachments: attachmentsArray,
      });
    } catch (error) {
      message.error("Unable to load details for response");
      console.error("Error fetching consultation detail for response:", error);
    }
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

      // Nếu đang ở tab "new" hoặc status là "Pending", luôn sử dụng "completed"
      const action =
        activeTab === "new" || selectedConsultation.status === "Pending"
          ? "completed"
          : values.action;

      const numericStatus = statusMapForResponse[action];
      const stringStatus = statusMapForRequest[action];

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

      await fetchConsultationsWithPagination(
        pagination.current,
        pagination.pageSize
      );

      setResponseVisible(false);
      message.success(
        activeTab === "new" || selectedConsultation.status === "Pending"
          ? "Consultation completed successfully"
          : action === "approved"
          ? "Consultation request approved"
          : action === "rejected"
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
      await fetchConsultationsWithPagination(
        pagination.current,
        pagination.pageSize
      );
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

  // [CHANGED] Bỏ cột Rating ngoài bảng
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

  // [CHANGED] Cũng bỏ cột Rating ở bảng chung
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

  const downloadAttachment = (attachment) => {
    try {
      const fileName =
        attachment.fileName || attachment.FileName || "download.file";
      const content = attachment.content || attachment.Content || "";
      const mimeType =
        attachment.mimeType ||
        attachment.MimeType ||
        "application/octet-stream";

      if (!content) {
        message.error(`Missing attachment content for "${fileName}"`);
        return;
      }

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

      message.success(`Downloaded file ${fileName}`);
    } catch (error) {
      console.error("Error when downloading file:", error);
      message.error(`Cannot download file: ${error.message}`);
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
      return <p>No attachments</p>;
    }

    return attachments.map((attachment, index) => {
      if (!attachment) return null;

      const fileName =
        attachment.fileName || attachment.FileName || `File ${index + 1}`;
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
            Download
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

    const styleElement = document.createElement("style");
    styleElement.innerHTML = attachmentStyles;
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  const handleTableChange = (newPagination) => {
    fetchConsultationsWithPagination(
      newPagination.current,
      newPagination.pageSize
    );
  };

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
          {/* [CHANGED] Bỏ luôn filter rating UI */}
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
            </div>
          )}
          <Button
            type="primary"
            onClick={() =>
              fetchConsultationsWithPagination(
                pagination.current,
                pagination.pageSize
              )
            }
            loading={loading}
            className="consult-refresh-btn"
            style={{ marginLeft: "auto" }}
          >
            Refresh
          </Button>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane
            key="new"
            tab={
              <span>
                New Requests{" "}
                {totalNewRequestsCount > 0 && (
                  <Badge
                    count={totalNewRequestsCount}
                    style={{ backgroundColor: "#e92121" }}
                  />
                )}
              </span>
            }
          >
            <Table
              columns={newRequestColumns}
              dataSource={filteredConsultations}
              rowKey="id"
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
            />
          </Tabs.TabPane>

          <Tabs.TabPane key="completed" tab="Completed">
            <Table
              columns={columns}
              dataSource={filteredConsultations}
              rowKey="id"
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
            />
          </Tabs.TabPane>

          <Tabs.TabPane key="history" tab="History">
            <Table
              columns={columns}
              dataSource={filteredConsultations}
              rowKey="id"
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* Modal Respond */}
      <Modal
        title="Respond to Consultation Request"
        open={responseVisible}
        onCancel={() => setResponseVisible(false)}
        footer={null}
        width={600}
      >
        {selectedConsultation && selectedConsultation.isLoading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ marginBottom: "20px" }}>Loading details...</div>
            <Spin size="large" />
          </div>
        ) : (
          selectedConsultation && (
            <Form
              form={responseForm}
              layout="vertical"
              onFinish={handleResponseSubmit}
              initialValues={{
                action:
                  activeTab === "new" ||
                  selectedConsultation.status === "Pending"
                    ? "completed"
                    : "approved",
              }}
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

              {selectedConsultation.attachments?.length > 0 && (
                <>
                  <Divider orientation="left">Attachments</Divider>
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

              {/* Chỉ hiển thị lựa chọn Action khi KHÔNG phải ở tab "new" và status KHÔNG phải là "Pending" */}
              {activeTab !== "new" &&
                selectedConsultation.status !== "Pending" && (
                  <Form.Item
                    name="action"
                    label="Action"
                    rules={[
                      { required: true, message: "Please select an action" },
                    ]}
                  >
                    <Select>
                      <Option value="approved">Approve Request</Option>
                      <Option value="rejected">Reject Request</Option>
                    </Select>
                  </Form.Item>
                )}

              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) =>
                  getFieldValue("action") === "rejected" && (
                    <Form.Item
                      name="rejectReason"
                      label="Reject Reason"
                      rules={[
                        { required: true, message: "Please enter reason" },
                      ]}
                    >
                      <TextArea rows={4} placeholder="Enter reject reason" />
                    </Form.Item>
                  )
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
                    {activeTab === "new" ||
                    selectedConsultation.status === "Pending"
                      ? "Complete Consultation"
                      : "Send Response"}
                  </Button>
                </div>
              </Form.Item>
            </Form>
          )
        )}
      </Modal>

      {/* Drawer Chi Tiết */}
      <Drawer
        title="Consultation Details"
        placement="right"
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        width={500}
      >
        {selectedConsultation && selectedConsultation.isLoading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ marginBottom: "20px" }}>Loading details...</div>
            <Spin size="large" />
          </div>
        ) : (
          selectedConsultation && (
            <>
              <Divider orientation="left">Consultation Information</Divider>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Status">
                  {getStatusTag(selectedConsultation.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Parent">
                  <div className="consult-drawer-parent">
                    <Avatar size="small" icon={<UserOutlined />} />
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

              {selectedConsultation.attachments?.length > 0 && (
                <>
                  <Divider orientation="left">Attachments</Divider>
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

              {/* [CHANGED] Thêm phần hiển thị rating, comment, feedbackDate */}
              <Divider orientation="left">Feedback</Divider>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Rating">
                  {selectedConsultation.rating ? (
                    <Rate disabled value={selectedConsultation.rating} />
                  ) : (
                    "No rating"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Comment">
                  {selectedConsultation.comment || "No comment"}
                </Descriptions.Item>
                <Descriptions.Item label="Feedback Date">
                  {selectedConsultation.feedbackDate
                    ? moment(selectedConsultation.feedbackDate).format(
                        "DD/MM/YYYY HH:mm"
                      )
                    : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </>
          )
        )}
      </Drawer>
    </div>
  );
};

export default Consultations;
