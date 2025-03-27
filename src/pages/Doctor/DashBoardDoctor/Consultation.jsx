import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
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
  CommentOutlined,
  SearchOutlined,
  UserOutlined,
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
  const [completedFilterType, setCompletedFilterType] = useState("all");
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
    activeTab,
    consultations,
    onGoingConsultations,
    completedFilterType,
    historyFilterStatus,
    historyFilterRating,
  ]);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const doctorId = localStorage.getItem("doctorId");
      if (!doctorId) {
        message.error("Doctor ID not found in localStorage!");
        return;
      }

      const response = await doctorApi.getConsultationRequestsByDoctorOData(doctorId);
      const requests = Array.isArray(response) ? response : response.data;

      const detailedRequests = await Promise.all(
        requests.map(async (request) => {
          try {
            const detailedResponse = await doctorApi.getConsultationRequestsById(request.requestId);
            const detailedData = detailedResponse.data;
            const responses = await doctorApi.getConsultationResponsesOData(
              `?$filter=requestId eq ${request.requestId}`
            );
            const latestResponse = responses.data[0] || {};
            return {
              id: request.requestId,
              requestId: request.requestId,
              parentName: detailedData.memberName || "N/A",
              parentAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
              childName: detailedData.childName || "N/A",
              childAge: detailedData.child?.age ? `${detailedData.child.age} tuổi` : "N/A",
              childGender: detailedData.child?.gender || "N/A",
              childAllergies: detailedData.child?.allergies || "None",
              childNotes: detailedData.child?.notes || "None",
              childDateOfBirth: detailedData.child?.dateOfBirth || "N/A",
              requestDate: detailedData.requestDate || moment().format(),
              topic: detailedData.category || "N/A",
              description: detailedData.description || "N/A",
              urgency: detailedData.urgency?.toLowerCase() || "normal",
              status: detailedData.status || "Pending",
              attachments: detailedData.attachments || [],
              createdAt: detailedData.createdAt || moment().format(),
              updatedAt: detailedData.updatedAt || moment().format(),
              response: latestResponse.content || "",
              rating: latestResponse.rating || 0,
              completedDate: detailedData.status === "Completed" ? detailedData.updatedAt : null,
            };
          } catch (error) {
            console.error(`Error fetching details for request ${request.requestId}:`, error);
            return null;
          }
        })
      );

      const mappedData = detailedRequests.filter((request) => request !== null);
      setConsultations(mappedData);
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

      const requests = await doctorApi.getConsultationRequestsByDoctorAndStatus(doctorId, "Approved");
      const consultationsData = await Promise.all(
        requests.map(async (req) => {
          try {
            const detailedResponse = await doctorApi.getConsultationRequestsById(req.requestId);
            const detailedData = detailedResponse.data;
            const responses = await doctorApi.getConsultationResponsesOData(
              `?$filter=requestId eq ${req.requestId}`
            );
            const latestResponse = responses.data[0] || {};
            return {
              id: req.requestId,
              requestId: req.requestId,
              parentName: detailedData.memberName || "N/A",
              parentAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
              childName: detailedData.childName || "N/A",
              childAge: detailedData.child?.age ? `${detailedData.child.age} tuổi` : "N/A",
              requestDate: detailedData.requestDate || moment().format(),
              topic: detailedData.category || "N/A",
              description: detailedData.description || "N/A",
              urgency: detailedData.urgency?.toLowerCase() || "normal",
              status: detailedData.status || "Approved",
              response: latestResponse.content || "",
            };
          } catch (error) {
            console.error(`Error fetching details for request ${req.requestId}:`, error);
            return null;
          }
        })
      );

      const validData = consultationsData.filter((item) => item !== null);
      setOnGoingConsultations(validData);
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
      data = onGoingConsultations;
      if (searchText) {
        data = data.filter(
          (item) =>
            item.parentName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.childName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.topic.toLowerCase().includes(searchText.toLowerCase()) ||
            item.description.toLowerCase().includes(searchText.toLowerCase()) ||
            item.response.toLowerCase().includes(searchText.toLowerCase())
        );
      }
    } else if (activeTab === "completed") {
      data = consultations.filter((item) => item.status === "Completed");
      if (completedFilterType === "request") {
        data = data.filter((item) =>
          item.description.toLowerCase().includes(searchText.toLowerCase())
        );
      } else if (completedFilterType === "response") {
        data = data.filter((item) =>
          item.response.toLowerCase().includes(searchText.toLowerCase())
        );
      } else {
        data = data.filter(
          (item) =>
            item.parentName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.childName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.topic.toLowerCase().includes(searchText.toLowerCase()) ||
            item.description.toLowerCase().includes(searchText.toLowerCase()) ||
            item.response.toLowerCase().includes(searchText.toLowerCase())
        );
      }
    } else if (activeTab === "history") {
      data = [...consultations];
      if (historyFilterStatus) {
        data = data.filter((item) => item.status === historyFilterStatus);
      }
      if (historyFilterRating) {
        data = data.filter((item) => item.rating.toString() === historyFilterRating);
      }
      if (searchText) {
        data = data.filter(
          (item) =>
            item.parentName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.childName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.topic.toLowerCase().includes(searchText.toLowerCase()) ||
            item.description.toLowerCase().includes(searchText.toLowerCase()) ||
            item.response.toLowerCase().includes(searchText.toLowerCase())
        );
      }
    } else {
      data = consultations.filter((item) => item.status === "Pending");
      if (searchText) {
        data = data.filter(
          (item) =>
            item.parentName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.childName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.topic.toLowerCase().includes(searchText.toLowerCase()) ||
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
      const statusMapForResponse = { approved: 1, rejected: 2, pending: 0, completed: 3 };
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
        isHelpful: false,
        status: numericStatus,
      };

      await doctorApi.createConsultationResponse(responsePayload);
      await doctorApi.updateConsultationRequestsStatus(selectedConsultation.requestId, stringStatus);

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
      await doctorApi.updateConsultationRequestsStatus(record.requestId, "Completed");
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

  const getUrgencyTag = (urgency) => {
    const tags = {
      high: <Tag color="red">Urgent</Tag>,
      medium: <Tag color="orange">Medium</Tag>,
      normal: <Tag color="blue">Normal</Tag>,
      low: <Tag color="green">Low Priority</Tag>,
    };
    return tags[urgency] || <Tag>Undefined</Tag>;
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
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
    },
    {
      title: "Priority",
      dataIndex: "urgency",
      key: "urgency",
      render: getUrgencyTag,
    },
    {
      title: "Request Date",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
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
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
    },
    {
      title: "Priority",
      dataIndex: "urgency",
      key: "urgency",
      render: getUrgencyTag,
    },
    {
      title: "Request Date",
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
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
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

  const newRequestsCount = consultations.filter((item) => item.status === "Pending").length;

  return (
    <div className="consult-container">
      <Card className="consult-card">
        <Title level={3} className="consult-title">
          Consultations
        </Title>

        <div className="consult-header" style={{ display: "flex", alignItems: "center" }}>
          <Input
            placeholder="Search by parent, child, topic, or response"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            style={{ width: 300 }}
          />
          {activeTab === "completed" && (
            <Select
              value={completedFilterType}
              onChange={setCompletedFilterType}
              style={{ width: 200, marginLeft: 10 }}
            >
              <Option value="all">All</Option>
              <Option value="request">Filter by Request</Option>
              <Option value="response">Filter by Response</Option>
            </Select>
          )}
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
                  <Option key={rate} value={rate.toString()}>{rate} Stars</Option>
                ))}
              </Select>
            </div>
          )}
          <Button
            type="primary"
            onClick={activeTab === "ongoing" ? fetchOnGoingConsultations : fetchConsultations}
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
                    <Badge count={newRequestsCount} style={{ backgroundColor: "#e92121" }} />
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
              <Descriptions.Item label="Parent">{selectedConsultation.parentName}</Descriptions.Item>
              <Descriptions.Item label="Child">
                {selectedConsultation.childName} ({selectedConsultation.childAge})
              </Descriptions.Item>
              <Descriptions.Item label="Topic">{selectedConsultation.topic}</Descriptions.Item>
              <Descriptions.Item label="Priority">
                {getUrgencyTag(selectedConsultation.urgency)}
              </Descriptions.Item>
              <Descriptions.Item label="Request Date">
                {moment(selectedConsultation.requestDate).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedConsultation.description}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Child Information</Divider>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Date of Birth">
                {moment(selectedConsultation.childDateOfBirth).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">{selectedConsultation.childGender}</Descriptions.Item>
              <Descriptions.Item label="Allergies">{selectedConsultation.childAllergies}</Descriptions.Item>
              <Descriptions.Item label="Notes">{selectedConsultation.childNotes}</Descriptions.Item>
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
                <Option value="pending">Set to Pending</Option>
                <Option value="completed">Set to Completed</Option>
              </Select>
            </Form.Item>

            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) =>
                getFieldValue("action") === "approved" ? (
                  <Form.Item
                    name="appointmentDate"
                    label="Appointment Date"
                    rules={[{ required: true, message: "Please select date/time" }]}
                  >
                    <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: "100%" }} />
                  </Form.Item>
                ) : getFieldValue("action") === "rejected" ? (
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
                <Button onClick={() => setResponseVisible(false)}>Cancel</Button>
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
                  <Avatar src={selectedConsultation.parentAvatar} size="small" />
                  <span>{selectedConsultation.parentName}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Child">
                {selectedConsultation.childName} ({selectedConsultation.childAge})
              </Descriptions.Item>
              <Descriptions.Item label="Topic">{selectedConsultation.topic}</Descriptions.Item>
              <Descriptions.Item label="Priority">
                {getUrgencyTag(selectedConsultation.urgency)}
              </Descriptions.Item>
              <Descriptions.Item label="Request Date">
                {moment(selectedConsultation.requestDate).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedConsultation.description}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Child Information</Divider>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Date of Birth">
                {moment(selectedConsultation.childDateOfBirth).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">{selectedConsultation.childGender}</Descriptions.Item>
              <Descriptions.Item label="Allergies">{selectedConsultation.childAllergies}</Descriptions.Item>
              <Descriptions.Item label="Notes">{selectedConsultation.childNotes}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">System Information</Divider>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Created At">
                {moment(selectedConsultation.createdAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {moment(selectedConsultation.updatedAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Progress</Divider>
            <Timeline>
              <Timeline.Item>
                <p>
                  <strong>Request</strong> -{" "}
                  {moment(selectedConsultation.requestDate).format("DD/MM/YYYY HH:mm")}
                </p>
                <Card size="small">
                  <p>{selectedConsultation.description}</p>
                </Card>
              </Timeline.Item>
              {selectedConsultation.response && (
                <Timeline.Item>
                  <p>
                    <strong>Response</strong> -{" "}
                    {moment(selectedConsultation.updatedAt).format("DD/MM/YYYY HH:mm")}
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
              {selectedConsultation.appointmentDate && (
                <Timeline.Item color="blue">
                  <p>
                    <strong>Appointment</strong> -{" "}
                    {moment(selectedConsultation.appointmentDate).format("DD/MM/YYYY HH:mm")}
                  </p>
                </Timeline.Item>
              )}
              {selectedConsultation.completedDate && (
                <Timeline.Item color="green">
                  <p>
                    <strong>Completed</strong> -{" "}
                    {moment(selectedConsultation.completedDate).format("DD/MM/YYYY HH:mm")}
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