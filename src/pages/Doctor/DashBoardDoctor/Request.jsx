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
  Spin,
  Drawer,
  Descriptions,
  Avatar,
  Divider,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  MessageOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

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

    // Giả lập API call để lấy danh sách yêu cầu tư vấn
    setTimeout(() => {
      // Dữ liệu mẫu
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
        {
          id: 2,
          parentName: "Trần Văn Hiếu",
          parentAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
          childName: "Hoàng",
          childAge: "6 tháng",
          requestDate: "2023-11-14T10:15:00",
          status: "pending",
          topic: "Dinh dưỡng",
          description:
            "Con tôi bắt đầu ăn dặm nhưng thường xuyên từ chối thức ăn. Tôi cần tư vấn về cách khuyến khích bé ăn và các loại thực phẩm phù hợp.",
          urgency: "high",
          contactMethod: "chat",
          preferredTime: "2023-11-18T09:00:00",
        },
        {
          id: 3,
          parentName: "Lê Văn C",
          parentAvatar: "https://randomuser.me/api/portraits/men/62.jpg",
          childName: "Bé Cu",
          childAge: "1 tuổi",
          requestDate: "2023-11-13T14:45:00",
          status: "accepted",
          topic: "Phát triển",
          description:
            "Con tôi 1 tuổi nhưng vẫn chưa biết đi. Tôi muốn biết đây có phải là vấn đề đáng lo ngại không và có cách nào giúp bé phát triển kỹ năng vận động tốt hơn.",
          urgency: "normal",
          contactMethod: "video",
          preferredTime: "2023-11-19T16:30:00",
          responseDate: "2023-11-14T09:20:00",
          appointmentDate: "2023-11-19T16:30:00",
        },
        {
          id: 4,
          parentName: "Phạm Thị D",
          parentAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
          childName: "Bé Đậu",
          childAge: "3 tuổi",
          requestDate: "2023-11-12T11:30:00",
          status: "rejected",
          topic: "Hành vi",
          description:
            "Con tôi hay cáu gắt và khóc khi không được như ý. Tôi muốn biết cách xử lý tình huống này một cách hiệu quả.",
          urgency: "low",
          contactMethod: "chat",
          preferredTime: "2023-11-17T10:00:00",
          responseDate: "2023-11-13T15:45:00",
          rejectReason:
            "Tôi không chuyên về tư vấn hành vi trẻ em. Tôi đề xuất bạn liên hệ với bác sĩ tâm lý trẻ em để được hỗ trợ tốt hơn.",
        },
        {
          id: 5,
          parentName: "Hoàng Văn E",
          parentAvatar: "https://randomuser.me/api/portraits/men/92.jpg",
          childName: "Bé Em",
          childAge: "4 tuổi",
          requestDate: "2023-11-11T09:00:00",
          status: "completed",
          topic: "Sức khỏe",
          description:
            "Con tôi thường xuyên bị ho vào ban đêm. Tôi muốn biết nguyên nhân và cách điều trị.",
          urgency: "high",
          contactMethod: "video",
          preferredTime: "2023-11-15T14:00:00",
          responseDate: "2023-11-12T10:30:00",
          appointmentDate: "2023-11-15T14:00:00",
          completedDate: "2023-11-15T15:00:00",
          notes:
            "Bé có dấu hiệu của hen suyễn nhẹ. Đã tư vấn cách sử dụng thuốc và theo dõi. Hẹn tái khám sau 2 tuần.",
        },
      ];

      // Lọc dữ liệu theo tab đang active
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
    }, 1000);
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

    // Chuẩn bị dữ liệu để gửi lên server
    const responseData = {
      requestId: selectedRequest.id,
      response: values.response,
      status: values.action,
      appointmentDate: values.appointmentDate
        ? values.appointmentDate.format("YYYY-MM-DDTHH:mm:ss")
        : null,
      rejectReason: values.rejectReason,
    };

    // Giả lập API call
    setTimeout(() => {
      console.log("Response data:", responseData);

      // Cập nhật trạng thái của yêu cầu trong danh sách
      const updatedRequests = consultRequests.map((req) => {
        if (req.id === selectedRequest.id) {
          return {
            ...req,
            status: values.action,
            responseDate: moment().format("YYYY-MM-DDTHH:mm:ss"),
            appointmentDate: values.appointmentDate
              ? values.appointmentDate.format("YYYY-MM-DDTHH:mm:ss")
              : null,
            rejectReason: values.rejectReason,
          };
        }
        return req;
      });

      setConsultRequests(updatedRequests);
      setResponseVisible(false);
      setLoading(false);

      message.success(
        values.action === "accepted"
          ? "Consultation request accepted"
          : "Consultation request rejected"
      );

      // Refresh danh sách
      fetchConsultRequests();
    }, 1000);
  };

  const handleComplete = (record) => {
    setLoading(true);

    // Giả lập API call
    setTimeout(() => {
      // Cập nhật trạng thái của yêu cầu trong danh sách
      const updatedRequests = consultRequests.map((req) => {
        if (req.id === record.id) {
          return {
            ...req,
            status: "completed",
            completedDate: moment().format("YYYY-MM-DDTHH:mm:ss"),
          };
        }
        return req;
      });

      setConsultRequests(updatedRequests);
      setLoading(false);
      message.success("Consultation completed");

      // Refresh danh sách
      fetchConsultRequests();
    }, 1000);
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
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar src={record.parentAvatar} icon={<UserOutlined />} />
          <span style={{ marginLeft: 8 }}>{text}</span>
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
      render: (urgency) => getUrgencyTag(urgency),
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
      render: (status) => getStatusTag(status),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="View details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
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
    <div className="tab-container">
      <Title level={4} className="section-title">
        Consultation Requests
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarExtraContent={
          <Button
            type="primary"
            onClick={fetchConsultRequests}
            loading={loading}
          >
            Refresh
          </Button>
        }
      >
        <TabPane
          tab={
            <Badge
              count={
                consultRequests.filter((r) => r.status === "pending").length
              }
              offset={[10, 0]}
            >
              Pending
            </Badge>
          }
          key="pending"
        >
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

      {/* Modal phản hồi yêu cầu */}
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
            <Descriptions
              title="Request Information"
              bordered
              size="small"
              column={1}
            >
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
                {selectedRequest.contactMethod === "video"
                  ? "Video Call"
                  : "Chat"}
              </Descriptions.Item>
              <Descriptions.Item label="Preferred Time">
                {moment(selectedRequest.preferredTime).format(
                  "DD/MM/YYYY HH:mm"
                )}
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

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.action !== currentValues.action
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("action") === "accepted" ? (
                  <Form.Item
                    name="appointmentDate"
                    label="Appointment Date"
                    rules={[
                      {
                        required: true,
                        message: "Please select an appointment date",
                      },
                    ]}
                  >
                    <DatePicker
                      showTime
                      format="DD/MM/YYYY HH:mm"
                      style={{ width: "100%" }}
                      placeholder="Select appointment date"
                    />
                  </Form.Item>
                ) : (
                  <Form.Item
                    name="rejectReason"
                    label="Reject Reason"
                    rules={[
                      {
                        required: true,
                        message: "Please enter reject reason",
                      },
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
              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
              >
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

      {/* Drawer xem chi tiết */}
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
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Avatar src={selectedRequest.parentAvatar} size="small" />
                  <span style={{ marginLeft: 8 }}>
                    {selectedRequest.parentName}
                  </span>
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
              <Descriptions.Item label="Contact Method">
                {selectedRequest.contactMethod === "video"
                  ? "Video Call"
                  : "Chat"}
              </Descriptions.Item>
              <Descriptions.Item label="Preferred Time">
                {moment(selectedRequest.preferredTime).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Request Date">
                {moment(selectedRequest.requestDate).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>

              {selectedRequest.responseDate && (
                <Descriptions.Item label="Response Date">
                  {moment(selectedRequest.responseDate).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Descriptions.Item>
              )}

              {selectedRequest.appointmentDate && (
                <Descriptions.Item label="Appointment Date">
                  {moment(selectedRequest.appointmentDate).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Descriptions.Item>
              )}

              {selectedRequest.completedDate && (
                <Descriptions.Item label="Completed Date">
                  {moment(selectedRequest.completedDate).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Descriptions.Item>
              )}

              {selectedRequest.rejectReason && (
                <Descriptions.Item label="Reject Reason">
                  {selectedRequest.rejectReason}
                </Descriptions.Item>
              )}

              {selectedRequest.notes && (
                <Descriptions.Item label="Notes">
                  {selectedRequest.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedRequest.status === "pending" && (
              <div style={{ marginTop: 16, textAlign: "right" }}>
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
