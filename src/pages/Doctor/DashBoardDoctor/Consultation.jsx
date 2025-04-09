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
  LeftOutlined,
} from "@ant-design/icons";
import moment from "moment";
import doctorApi from "../../../services/DoctorApi";
import childApi from "../../../services/childApi";
import alertApi from "../../../services/alertApi";
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
  const [childInfoVisible, setChildInfoVisible] = useState(false);
  const [growthRecords, setGrowthRecords] = useState([]);
  const [growthLoading, setGrowthLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Hàm parseAlertMessage từ Alert.jsx
  const parseAlertMessage = (message) => {
    const fieldConfig = [
      { key: "alert", label: "Alert: " },
      { key: "diseaseType", label: "Disease Type: " },
      { key: "symptoms", label: "Symptoms: " },
      { key: "recommendedTreatment", label: "Recommended Treatment: " },
      { key: "preventionTips", label: "Prevention Tips: " },
      { key: "description", label: "Description: " },
      { key: "notes", label: "Notes: " },
      { key: "trendAnalysis", label: "Trend Analysis: " },
    ];

    const fields = {
      alert: "N/A",
      diseaseType: "N/A",
      symptoms: "N/A",
      recommendedTreatment: "N/A",
      preventionTips: "N/A",
      description: "N/A",
      notes: "N/A",
      trendAnalysis: "N/A",
    };

    if (!message || typeof message !== "string") {
      return fields;
    }

    fieldConfig.forEach(({ key, label }, i) => {
      const startIndex = message.indexOf(label);
      if (startIndex === -1) return;

      const contentStart = startIndex + label.length;
      let contentEnd;

      const nextField = fieldConfig[i + 1];
      if (nextField) {
        const nextLabelIndex = message.indexOf(nextField.label, contentStart);
        contentEnd = nextLabelIndex !== -1 ? nextLabelIndex : message.length;
      } else {
        contentEnd = message.endsWith(".") ? message.length - 1 : message.length;
      }

      const content = message.slice(contentStart, contentEnd).trim();
      if (content) {
        fields[key] = content;
      }
    });

    return fields;
  };

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
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
    fetchConsultationsWithPagination(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, historyFilterStatus, consultations]);

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

  const sortByDateDesc = (items) => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.requestDate);
      const dateB = new Date(b.requestDate);
      return dateB - dateA;
    });
  };

  const sortByDateAsc = (items) => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.requestDate);
      const dateB = new Date(b.requestDate);
      return dateA - dateB;
    });
  };

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

      const totalPendingRequests = allRequests.filter(
        (item) => item.status === "Pending"
      ).length;

      setTotalNewRequestsCount(totalPendingRequests);

      let filteredData = allRequests;
      if (activeTab === "new") {
        filteredData = allRequests.filter((item) => item.status === "Pending");
        filteredData = sortByDateAsc(filteredData);
      } else if (activeTab === "onGoing") {
        filteredData = allRequests.filter((item) => item.status === "Approved");
        filteredData = sortByDateDesc(filteredData);
      } else if (activeTab === "completed") {
        filteredData = allRequests.filter(
          (item) => item.status === "Completed"
        );
        filteredData = sortByDateDesc(filteredData);
      } else if (activeTab === "history") {
        filteredData = sortByDateDesc(filteredData);
      }

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

  const applyFilters = () => {
    let data = [...consultations];

    if (activeTab === "completed") {
      data = data.filter((item) => item.status === "Completed");
    } else if (activeTab === "history") {
      if (historyFilterStatus) {
        data = data.filter((item) => item.status === historyFilterStatus);
      }
    } else if (activeTab === "onGoing") {
      data = data.filter((item) => item.status === "Approved");
    } else {
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

    setFilteredConsultations(data);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const decodeHtmlEntities = (text) => {
    if (!text) return "";
    const element = document.createElement("div");
    element.innerHTML = text;
    return element.textContent;
  };

  const handleViewDetail = async (record) => {
    try {
      setSelectedConsultation({ ...record, isLoading: true });
      setDetailVisible(true);

      const detailedData = await fetchConsultationRequestsById(record.requestId);

      console.log("Detailed Data:", detailedData);

      if (!detailedData.child.memberId || !detailedData.child.childId) {
        console.error("memberId hoặc childId không tồn tại trong detailedData:", detailedData);
        throw new Error("Không thể lấy memberId hoặc childId từ chi tiết request");
      }

      const responses = await doctorApi.getConsultationResponsesOData(
        `?$filter=requestId eq ${record.requestId}`
      );
      const latestResponse = responses.data[0] || {};

      const doctorId = localStorage.getItem("doctorId");
      if (!doctorId) {
        throw new Error("Doctor ID not found in localStorage!");
      }

      const odataQuery = `${doctorId} and memberId eq ${detailedData.child.memberId} and childName eq '${detailedData.childName}' and status eq 'Approved'`;
      const relatedRequestsResponse = await doctorApi.getConsultationRequestsByDoctorOData(odataQuery);
      const relatedPendingRequests = Array.isArray(relatedRequestsResponse)
        ? relatedRequestsResponse
        : relatedRequestsResponse.data || [];

      console.log("Related Pending Requests:", relatedPendingRequests);

      relatedPendingRequests.sort((a, b) => new Date(a.requestDate) - new Date(b.requestDate));

      const pendingRequestsWithResponses = await Promise.all(
        relatedPendingRequests.map(async (req) => {
          const reqResponses = await doctorApi.getConsultationResponsesOData(
            `?$filter=requestId eq ${req.requestId}`
          );
          return {
            ...req,
            responses: reqResponses.data || [],
          };
        })
      );

      console.log("Pending Requests with Responses:", pendingRequestsWithResponses);

      let rating = 0;
      let comment = "";
      let feedbackDate = "";
      if (latestResponse.responseId) {
        try {
          const feedbackResponse = await doctorApi.getRatingFeedbackByResponseId(
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
      const cleanDescription = decodeHtmlEntities(detailedData.description || "N/A");

      setSelectedConsultation({
        ...record,
        isLoading: false,
        memberId: detailedData.child.memberId,
        childId: detailedData.child?.childId || "N/A",
        childAge: detailedData.child?.age
          ? `${detailedData.child.age} years old`
          : "N/A",
        childGender: detailedData.child?.gender || "N/A",
        childAllergies: detailedData.child?.allergies || "None",
        childNotes: detailedData.child?.notes || "None",
        childDateOfBirth: detailedData.child?.dateOfBirth || "N/A",
        description: cleanDescription,
        attachments: attachmentsArray,
        response: latestResponse.content || "",
        createdAt: detailedData.createdAt || moment().format(),
        updatedAt: detailedData.updatedAt || moment().format(),
        completedDate: detailedData.status === "Completed" ? detailedData.updatedAt : null,
        rating,
        comment,
        feedbackDate,
        relatedPendingRequests: pendingRequestsWithResponses,
      });
      console.log("Selected Consultation:", selectedConsultation);
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
      const cleanDescription = decodeHtmlEntities(
        detailedData.description || "N/A"
      );

      setSelectedConsultation({
        ...record,
        isLoading: false,
        childId: detailedData.child?.childId || "N/A",
        childAge: detailedData.child?.age
          ? `${detailedData.child.age} years old`
          : "N/A",
        childGender: detailedData.child?.gender || "N/A",
        childAllergies: detailedData.child?.allergies || "None",
        childNotes: detailedData.child?.notes || "None",
        childDateOfBirth: detailedData.child?.dateOfBirth || "N/A",
        description: cleanDescription,
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

      const action =
        activeTab === "new" || selectedConsultation.status === "Pending"
          ? "approved"
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
        "Approved"
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

  const fetchGrowthRecords = async (childName, parentName) => {
    setGrowthLoading(true);
    try {
      const response = await childApi.getGrowthRecords(childName, parentName);
      const records = response.data || [];
      const sortedRecords = records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setGrowthRecords(sortedRecords);
    } catch (error) {
      console.error("Error fetching growth records:", error);
      message.error("Failed to load growth records!");
      setGrowthRecords([]);
    } finally {
      setGrowthLoading(false);
    }
  };

  const fetchAlerts = async (childName, dob, memberId) => {
    setAlertsLoading(true);
    try {
      const response = await alertApi.getAlertsByChild(childName, dob, memberId);
      if (response.data && Array.isArray(response.data.data)) {
        const alertsData = response.data.data;
        alertsData.sort((a, b) => new Date(b.alertDate) - new Date(a.alertDate));
        setAlerts(alertsData || []);
      } else {
        setAlerts([]);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      message.error("Failed to load alerts!");
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    if (childInfoVisible && selectedConsultation) {
      fetchGrowthRecords(selectedConsultation.childName, selectedConsultation.parentName);
      const formattedDob = moment(selectedConsultation.childDateOfBirth).format("YYYY-MM-DD");
      fetchAlerts(selectedConsultation.childName, formattedDob, selectedConsultation.memberId);
    }
  }, [childInfoVisible, selectedConsultation]);

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

      .ant-drawer.child-info-drawer .ant-drawer-content-wrapper {
        right: 500px !important;
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

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const handleOpenChildInfo = () => {
    setChildInfoVisible(true);
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
                <Option value="Completed">Completed</Option>
              </Select>
            </div>
          )}

          {totalNewRequestsCount > 0 && (
            <div
              style={{
                marginLeft: "auto",
                marginRight: "10px",
                backgroundColor: "#fff2f0",
                border: "1px solid #ffccc7",
                padding: "5px 12px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#f5222d",
                  fontWeight: "bold",
                  marginRight: "5px",
                }}
              >
                {totalNewRequestsCount}
              </span>
              <span>pending requests</span>
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
          >
            Refresh
          </Button>
        </div>

        <Tabs activeKey={activeTab} onChange={handleTabChange}>
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
          <Tabs.TabPane key="onGoing" tab="On going">
            <Table
              columns={columns}
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

      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              icon={<LeftOutlined />}
              onClick={handleOpenChildInfo}
              style={{
                marginRight: 16,
                border: "none",
                boxShadow: "none",
                background: "transparent",
              }}
            />
            Consultation Details
          </div>
        }
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
                {selectedConsultation.relatedPendingRequests &&
                selectedConsultation.relatedPendingRequests.length > 0 ? (
                  selectedConsultation.relatedPendingRequests.map((req, index) => (
                    <React.Fragment key={index}>
                      <Timeline.Item>
                        <p>
                          <strong>{index === 0 ? "Request" : "Re-request"}</strong> -{" "}
                          {moment(req.requestDate).format("DD/MM/YYYY HH:mm")}
                        </p>
                        <Card size="small">
                          <p>{decodeHtmlEntities(req.description || "N/A")}</p>
                        </Card>
                      </Timeline.Item>
                      {req.responses &&
                        req.responses.length > 0 &&
                        req.responses.map((res, resIndex) => (
                          <Timeline.Item key={`response-${resIndex}`}>
                            <p>
                              <strong>Response</strong> -{" "}
                              {moment(res.createdAt).format("DD/MM/YYYY HH:mm")}
                            </p>
                            <Card size="small">
                              <p>{res.content || "N/A"}</p>
                            </Card>
                          </Timeline.Item>
                        ))}
                    </React.Fragment>
                  ))
                ) : (
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

      <Drawer
        title="Child Information - Alerts & Growth Records"
        placement="right"
        onClose={() => setChildInfoVisible(false)}
        open={childInfoVisible}
        width={500}
        className="child-info-drawer"
        zIndex={1000}
      >
        {selectedConsultation && (
          <>
            <Divider orientation="left">Alerts</Divider>
            <div style={{ minHeight: 100 }}>
              {alertsLoading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin size="large" />
                </div>
              ) : alerts.length > 0 ? (
                <Timeline>
                  {alerts.map((alert, index) => {
                    const parsedMessage = parseAlertMessage(alert.message);
                    return (
                      <Timeline.Item key={index} color="red">
                        <p>
                          <strong>Alert Date:</strong>{" "}
                          {alert.alertDate
                            ? moment(alert.alertDate).format("DD/MM/YYYY HH:mm")
                            : "N/A"}
                        </p>
                        <Card size="small">
                          <p><strong>Alert:</strong> {parsedMessage.alert}</p>
                          <p><strong>Disease Type:</strong> {parsedMessage.diseaseType}</p>
                          <p><strong>Symptoms:</strong> {parsedMessage.symptoms}</p>
                          <p><strong>Recommended Treatment:</strong> {parsedMessage.recommendedTreatment}</p>
                          <p><strong>Prevention Tips:</strong> {parsedMessage.preventionTips}</p>
                          <p><strong>Description:</strong> {parsedMessage.description}</p>
                          <p><strong>Notes:</strong> {parsedMessage.notes}</p>
                          <p><strong>Trend Analysis:</strong> {parsedMessage.trendAnalysis}</p>
                        </Card>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              ) : (
                <p>No alerts found for this child.</p>
              )}
            </div>

            <Divider orientation="left">Growth Records</Divider>
            <div style={{ minHeight: 100 }}>
              {growthLoading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin size="large" />
                </div>
              ) : growthRecords.length > 0 ? (
                <Timeline>
                  {growthRecords.map((record, index) => (
                    <Timeline.Item key={index}>
                      <p>
                        <strong>Record Date:</strong>{" "}
                        {moment(record.createdAt).format("DD/MM/YYYY HH:mm")}
                      </p>
                      <Card size="small">
                        <p><strong>Height:</strong> {record.height || "N/A"} cm</p>
                        <p><strong>Weight:</strong> {record.weight || "N/A"} kg</p>
                        <p><strong>Head Circumference:</strong> {record.headCircumference || "N/A"} cm</p>
                        <p><strong>Notes:</strong> {record.notes || "N/A"}</p>
                      </Card>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <p>No growth records found for this child.</p>
              )}
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default Consultations;