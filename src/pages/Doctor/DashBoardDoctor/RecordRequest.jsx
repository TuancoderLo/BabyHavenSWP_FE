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
  Typography,
  Tabs,
  Space,
  Tooltip,
  Drawer,
  Descriptions,
  Avatar,
  Divider,
  List,
  Card,
  Empty,
  Badge,
} from "antd";
import { EyeOutlined, FileSearchOutlined, UserOutlined, FileTextOutlined } from "@ant-design/icons";
import moment from "moment";
import "./RecordRequest.css"; // Import file CSS

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const RecordRequest = () => {
  const [loading, setLoading] = useState(false);
  const [recordRequests, setRecordRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseForm] = Form.useForm();
  const [responseVisible, setResponseVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchRecordRequests();
  }, [activeTab]);

  const fetchRecordRequests = () => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      // Mock data
      const mockData = [
        {
          id: 1,
          parentName: "Nguyễn Văn A",
          parentAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
          childName: "Bé Na",
          childAge: "2 tuổi",
          requestDate: "2023-11-15T08:30:00",
          status: "pending",
          reason: "Cần thông tin về lịch sử tiêm chủng...",
          recordType: "vaccination",
        },
        // ...
      ];

      let filteredData = [];
      switch (activeTab) {
        case "pending":
          filteredData = mockData.filter((i) => i.status === "pending");
          break;
        case "approved":
          filteredData = mockData.filter((i) => i.status === "approved");
          break;
        case "rejected":
          filteredData = mockData.filter((i) => i.status === "rejected");
          break;
        default:
          filteredData = mockData;
      }

      setRecordRequests(filteredData);
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
    setTimeout(() => {
      const updated = recordRequests.map((req) =>
        req.id === selectedRequest.id
          ? {
              ...req,
              status: values.action,
              responseDate: moment().format("YYYY-MM-DD HH:mm:ss"),
            }
          : req
      );
      setRecordRequests(updated);
      setResponseVisible(false);
      setLoading(false);
      message.success(
        values.action === "approved"
          ? "Record request approved"
          : "Record request rejected"
      );
      fetchRecordRequests();
    }, 800);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "pending":
        return <Tag color="blue">Pending</Tag>;
      case "approved":
        return <Tag color="green">Approved</Tag>;
      case "rejected":
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const getRecordTypeTag = (type) => {
    switch (type) {
      case "vaccination":
        return <Tag color="purple">Vaccination</Tag>;
      case "health_check":
        return <Tag color="cyan">Health Check</Tag>;
      case "allergy":
        return <Tag color="orange">Allergy</Tag>;
      case "medical_history":
        return <Tag color="blue">Medical History</Tag>;
      case "full_record":
        return <Tag color="magenta">Full Record</Tag>;
      default:
        return <Tag>Other</Tag>;
    }
  };

  const columns = [
    {
      title: "Parent",
      dataIndex: "parentName",
      key: "parentName",
      render: (text, record) => (
        <div className="record-parent-info">
          <Avatar src={record.parentAvatar} icon={<UserOutlined />} />
          <span className="record-parent-name">{text}</span>
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
      title: "Record Type",
      dataIndex: "recordType",
      key: "recordType",
      render: getRecordTypeTag,
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
                icon={<FileSearchOutlined />}
                onClick={() => handleRespond(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Giả lập data cho MedicalRecords
  const getMedicalRecords = (childName) => [
    {
      id: 1,
      title: "Lịch sử tiêm chủng",
      type: "vaccination",
      lastUpdated: "2023-10-15",
      content: [
        { date: "2023-09-10", description: "Vaccine MMR" },
        // ...
      ],
    },
    // ...
  ];

  return (
    <div className="record-request-container">
      <Card className="record-request-card">
        <Title level={3} className="record-request-title">
          Medical Record Request
        </Title>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            <Button type="primary" onClick={fetchRecordRequests} loading={loading}>
              Refresh
            </Button>
          }
        >
          <TabPane tab="Pending" key="pending">
            <Table
              columns={columns}
              dataSource={recordRequests}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
              locale={{
                emptyText: <Empty description="No pending record requests" />,
              }}
            />
          </TabPane>

          <TabPane tab="Approved" key="approved">
            <Table
              columns={columns}
              dataSource={recordRequests}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
              locale={{
                emptyText: <Empty description="No approved record requests" />,
              }}
            />
          </TabPane>

          <TabPane tab="Rejected" key="rejected">
            <Table
              columns={columns}
              dataSource={recordRequests}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
              locale={{
                emptyText: <Empty description="No rejected record requests" />,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal phản hồi */}
      <Modal
        title="Respond to Medical Record Request"
        open={responseVisible}
        onCancel={() => setResponseVisible(false)}
        footer={null}
        width={700}
      >
        {selectedRequest && (
          <Form
            form={responseForm}
            layout="vertical"
            onFinish={handleResponseSubmit}
            initialValues={{ action: "approved" }}
          >
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Parent">
                {selectedRequest.parentName}
              </Descriptions.Item>
              <Descriptions.Item label="Child">
                {selectedRequest.childName} ({selectedRequest.childAge})
              </Descriptions.Item>
              <Descriptions.Item label="Record Type">
                {getRecordTypeTag(selectedRequest.recordType)}
              </Descriptions.Item>
              <Descriptions.Item label="Request Reason">
                {selectedRequest.reason}
              </Descriptions.Item>
              <Descriptions.Item label="Request Date">
                {moment(selectedRequest.requestDate).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Related Medical Records</Title>
            {/* Giả lập hiển thị data */}
            <div className="record-related-list">
              {getMedicalRecords(selectedRequest.childName)
                .filter(
                  (r) =>
                    r.type === selectedRequest.recordType ||
                    selectedRequest.recordType === "full_record"
                )
                .map((item) => (
                  <Card
                    key={item.id}
                    title={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <FileTextOutlined style={{ marginRight: 8 }} />
                        {item.title}
                      </div>
                    }
                    extra={getRecordTypeTag(item.type)}
                    size="small"
                    style={{ marginBottom: 8 }}
                  >
                    <p>
                      <strong>Last Updated:</strong> {item.lastUpdated}
                    </p>
                    <List
                      size="small"
                      dataSource={item.content}
                      renderItem={(c) => (
                        <List.Item>
                          <Text type="secondary">{c.date}:</Text> {c.description}
                        </List.Item>
                      )}
                    />
                  </Card>
                ))}
            </div>

            <Divider />

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
                getFieldValue("action") === "approved" ? (
                  <Form.Item
                    name="approvalNote"
                    label="Approval Note"
                    rules={[{ required: true, message: "Please enter note" }]}
                  >
                    <TextArea rows={4} placeholder="Enter approval note" />
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

            <Form.Item>
              <div className="record-modal-buttons">
                <Button onClick={() => setResponseVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Submit
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Drawer chi tiết */}
      <Drawer
        title="Medical Record Request Details"
        placement="right"
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        width={600}
      >
        {selectedRequest && (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedRequest.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Parent">
                <div className="record-drawer-parent">
                  <Avatar src={selectedRequest.parentAvatar} size="small" />
                  <span>{selectedRequest.parentName}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Child">
                {selectedRequest.childName} ({selectedRequest.childAge})
              </Descriptions.Item>
              <Descriptions.Item label="Record Type">
                {getRecordTypeTag(selectedRequest.recordType)}
              </Descriptions.Item>
              <Descriptions.Item label="Request Reason">
                {selectedRequest.reason}
              </Descriptions.Item>
              <Descriptions.Item label="Request Date">
                {moment(selectedRequest.requestDate).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>

            {selectedRequest.status === "pending" && (
              <div className="record-drawer-action">
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

export default RecordRequest;
