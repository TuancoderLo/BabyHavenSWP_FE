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
  Badge,
  Space,
  Tooltip,
  Drawer,
  Descriptions,
  Avatar,
  Divider,
} from "antd";
import {
  CheckCircleOutlined,
  EyeOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "./Request.css"; // Import file CSS mới

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const Request = () => {
  const [loading, setLoading] = useState(false);
  const [consultRequests, setConsultRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseForm] = Form.useForm();
  const [responseVisible, setResponseVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchConsultRequests();
  }, [activeTab]);

  const fetchConsultRequests = () => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      // Mock data
      const mockData = [
        {
          id: 1,
          parentName: "Nguyễn Thị Lam",
          parentAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
          childName: "NGa",
          childAge: "2 tuổi",
          requestDate: "2023-11-15T08:30:00",
          status: "pending",
          topic: "Tiêm chủng",
          description:
            "Con tôi sắp đến lịch tiêm phòng. Tôi muốn hỏi về các loại vaccine cần thiết cho bé 2 tuổi và các tác dụng phụ có thể xảy ra.",
          urgency: "normal",
          contactMethod: "video",
          preferredTime: "2023-11-20T15:00:00",
        },
        // ...
      ];

      let filteredData = [];
      switch (activeTab) {
        case "pending":
          filteredData = mockData.filter((item) => item.status === "pending");
          break;
        case "accepted":
          filteredData = mockData.filter((item) => item.status === "accepted");
          break;
        case "completed":
          filteredData = mockData.filter((item) => item.status === "completed");
          break;
        case "rejected":
          filteredData = mockData.filter((item) => item.status === "rejected");
          break;
        default:
          filteredData = mockData;
      }

      setConsultRequests(filteredData);
      setLoading(false);
    }, 800);
  };

  const handleViewDetail = (record) => {
    setSelectedRequest(record);
    setDetailVisible(true);
  };

  const handleRespond = (record) => {
    setSelectedRequest(record);
    responseForm.resetFields();
    setResponseVisible(true);
  };

  const handleResponseSubmit = (values) => {
    setLoading(true);
    // Mock update
    setTimeout(() => {
      const updated = consultRequests.map((req) =>
        req.id === selectedRequest.id
          ? {
              ...req,
              status: values.action,
              responseDate: moment().format("YYYY-MM-DD HH:mm:ss"),
            }
          : req
      );
      setConsultRequests(updated);
      setResponseVisible(false);
      setLoading(false);
      message.success(
        values.action === "accepted"
          ? "Consultation request accepted"
          : "Consultation request rejected"
      );
      fetchConsultRequests();
    }, 800);
  };

  const handleComplete = (record) => {
    setLoading(true);
    setTimeout(() => {
      const updated = consultRequests.map((req) =>
        req.id === record.id
          ? {
              ...req,
              status: "completed",
              completedDate: moment().format("YYYY-MM-DD HH:mm:ss"),
            }
          : req
      );
      setConsultRequests(updated);
      setLoading(false);
      message.success("Consultation completed");
      fetchConsultRequests();
    }, 800);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "pending":
        return <Tag color="blue">Pending</Tag>;
      case "accepted":
        return <Tag color="green">Accepted</Tag>;
      case "rejected":
        return <Tag color="red">Rejected</Tag>;
      case "completed":
        return <Tag color="purple">Completed</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const getUrgencyTag = (urgency) => {
    switch (urgency) {
      case "high":
        return <Tag color="red">Urgent</Tag>;
      case "normal":
        return <Tag color="blue">Normal</Tag>;
      case "low":
        return <Tag color="green">Low Priority</Tag>;
      default:
        return <Tag>Undefined</Tag>;
    }
  };

  const columns = [
    {
      title: "Parent",
      dataIndex: "parentName",
      key: "parentName",
      render: (text, record) => (
        <div className="request-parent-info">
          <Avatar src={record.parentAvatar} icon={<UserOutlined />} />
          <span className="request-parent-name">{text}</span>
        </div>
      ),
    },
    {
      title: "Child",
      dataIndex: "childName",
      key: "childName",
      render: (text, record) => (
        <>
          <div>{text}</div>
          <Text type="secondary">{record.childAge}</Text>
        </>
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
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="View details">
            <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} />
          </Tooltip>
          {record.status === "pending" && (
            <Tooltip title="Respond">
              <Button
                type="primary"
                icon={<MessageOutlined />}
                onClick={() => handleRespond(record)}
              />
            </Tooltip>
          )}
          {record.status === "accepted" && (
            <Tooltip title="Complete">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleComplete(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="request-container">
      <Card className="request-card">
        <Title level={3} className="request-title">
          Consultation Requests
        </Title>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            <Button type="primary" onClick={fetchConsultRequests} loading={loading}>
              Refresh
            </Button>
          }
        >
          <TabPane tab="Pending" key="pending">
            <Table
              columns={columns}
              dataSource={consultRequests}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>

          <TabPane tab="Accepted" key="accepted">
            <Table
              columns={columns}
              dataSource={consultRequests}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>

          <TabPane tab="Completed" key="completed">
            <Table
              columns={columns}
              dataSource={consultRequests}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>

          <TabPane tab="Rejected" key="rejected">
            <Table
              columns={columns}
              dataSource={consultRequests}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal phản hồi */}
      <Modal
        title="Respond to Consultation Request"
        open={responseVisible}
        onCancel={() => setResponseVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRequest && (
          <Form
            form={responseForm}
            layout="vertical"
            onFinish={handleResponseSubmit}
            initialValues={{ action: "accepted" }}
          >
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Parent">
                {selectedRequest.parentName}
              </Descriptions.Item>
              <Descriptions.Item label="Child">
                {selectedRequest.childName} ({selectedRequest.childAge})
              </Descriptions.Item>
              <Descriptions.Item label="Topic">
                {selectedRequest.topic}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedRequest.description}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Method">
                {selectedRequest.contactMethod === "video" ? "Video Call" : "Chat"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Form.Item
              name="action"
              label="Action"
              rules={[{ required: true, message: "Please select an action" }]}
            >
              <Select>
                <Option value="accepted">Accept Request</Option>
                <Option value="rejected">Reject Request</Option>
              </Select>
            </Form.Item>

            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) =>
                getFieldValue("action") === "accepted" ? (
                  <Form.Item
                    name="appointmentDate"
                    label="Appointment Date"
                    rules={[{ required: true, message: "Please select date/time" }]}
                  >
                    <DatePicker
                      showTime
                      format="DD/MM/YYYY HH:mm"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                ) : (
                  <Form.Item
                    name="rejectReason"
                    label="Reject Reason"
                    rules={[{ required: true, message: "Please enter reason" }]}
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
              <div className="request-modal-buttons">
                <Button onClick={() => setResponseVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Send Response
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Drawer chi tiết */}
      <Drawer
        title="Consultation Request Details"
        placement="right"
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        width={500}
      >
        {selectedRequest && (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedRequest.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Parent">
                <div className="request-drawer-parent">
                  <Avatar src={selectedRequest.parentAvatar} size="small" />
                  <span>{selectedRequest.parentName}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Child">
                {selectedRequest.childName} ({selectedRequest.childAge})
              </Descriptions.Item>
              <Descriptions.Item label="Topic">
                {selectedRequest.topic}
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                {getUrgencyTag(selectedRequest.urgency)}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedRequest.description}
              </Descriptions.Item>
            </Descriptions>

            {selectedRequest.status === "pending" && (
              <div className="request-drawer-action">
                <Button
                  type="primary"
                  onClick={() => {
                    setDetailVisible(false);
                    handleRespond(selectedRequest);
                  }}
                >
                  Respond to Request
                </Button>
              </div>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default Request;
