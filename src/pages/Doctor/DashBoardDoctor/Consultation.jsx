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
  Input as AntInput,
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
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [responseForm] = Form.useForm();
  const [responseVisible, setResponseVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("new");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchConsultations();
  }, [activeTab]);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const doctorId = localStorage.getItem("doctorId");
      if (!doctorId) {
        message.error("Doctor ID not found in localStorage!");
        setLoading(false);
        return;
      }

      // Gọi GET tất cả
      const response = await doctorApi.getConsultationRequests();
      let requests = response.data;

      if (!Array.isArray(requests)) {
        if (response && response.data) {
          requests = response.data;
        } else {
          throw new Error("API response is not an array");
        }
      }

      // Lọc theo doctorId
      const filteredByDoctor = requests.filter(
        (request) => request.doctorId === parseInt(doctorId)
      );

      // Lấy chi tiết từng request
      const detailedRequests = await Promise.all(
        filteredByDoctor.map(async (request) => {
          try {
            const detailedResponse = await doctorApi.getConsultationRequestsById(
              request.requestId
            );
            const detailedData = detailedResponse.data;

            return {
              id: request.requestId,
              requestId: request.requestId,
              parentName: detailedData.memberName,
              parentAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
              childName: detailedData.childName,
              childAge: detailedData.child.age
                ? `${detailedData.child.age} tuổi`
                : "N/A",
              childGender: detailedData.child.gender || "N/A",
              childAllergies: detailedData.child.allergies || "None",
              childNotes: detailedData.child.notes || "None",
              childDateOfBirth: detailedData.child.dateOfBirth || "N/A",
              requestDate: detailedData.requestDate,
              topic: detailedData.category,
              description: detailedData.description || "N/A",
              urgency: detailedData.urgency.toLowerCase(),
              // GIỮ NGUYÊN status thay vì .toLowerCase():
              status: detailedData.status, // "Pending", "Approved", "Rejected", "Completed"
              attachments: detailedData.attachments || [],
              createdAt: detailedData.createdAt,
              updatedAt: detailedData.updatedAt,
            };
          } catch (error) {
            console.error(
              `Error fetching details for request ${request.requestId}:`,
              error
            );
            return null;
          }
        })
      );

      const mappedData = detailedRequests.filter((request) => request !== null);

      // Lọc theo Tab
      let filteredData = [];
      switch (activeTab) {
        case "new":
          // "New Requests" -> hiển thị những request "Pending"
          filteredData = mappedData.filter((item) => item.status === "Pending");
          break;
        case "ongoing":
          // "Ongoing" -> hiển thị những request "Approved"
          filteredData = mappedData.filter((item) => item.status === "Approved");
          break;
        case "completed":
          // "Completed"
          filteredData = mappedData.filter(
            (item) => item.status === "Completed"
          );
          break;
        case "history":
          // History -> tất cả
          filteredData = mappedData;
          break;
        default:
          filteredData = mappedData;
      }

      setConsultations(mappedData);
      setFilteredConsultations(filteredData);
    } catch (error) {
      message.error("Failed to fetch consultation requests!");
      console.error("Error fetching consultations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm theo parent, child, topic
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = consultations.filter(
      (item) =>
        item.parentName.toLowerCase().includes(value.toLowerCase()) ||
        item.childName.toLowerCase().includes(value.toLowerCase()) ||
        item.topic.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredConsultations(
      activeTab === "history"
        ? filtered
        : filtered.filter((item) => {
            if (activeTab === "new") return item.status === "Pending";
            if (activeTab === "ongoing") return item.status === "Approved";
            if (activeTab === "completed") return item.status === "Completed";
            return true;
          })
    );
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

  /**
   * Khi bác sĩ ấn "Respond", ta gửi 2 API:
   * - POST /api/ConsultationResponses => status = numeric (0=Pending,1=Approved,2=Rejected,3=Completed)
   * - PUT /api/ConsultationRequests/{requestId}/{statusString} => statusString = "Pending"/"Approved"/"Rejected"/"Completed"
   */
  const handleResponseSubmit = async (values) => {
    setLoading(true);
    try {
      // Map cho createConsultationResponse (số)
      const statusMapForResponse = {
        approved: 1,
        rejected: 2,
        pending: 0,
        completed: 3,
      };

      // Map cho updateConsultationRequestStatus (chuỗi)
      // PUT /{requestId}/{statusString}
      const statusMapForRequest = {
        approved: "Approved",
        rejected: "Rejected",
        pending: "Pending",
        completed: "Completed",
      };

      // Lấy key "action" => "approved"/"rejected"
      const numericStatus = statusMapForResponse[values.action];
      const stringStatus = statusMapForRequest[values.action];

      // POST /api/ConsultationResponses
      const responsePayload = {
        requestId: selectedConsultation.requestId,
        content: values.response,
        attachments: [],
        isHelpful: false,
        status: numericStatus, // 1 = Approved, 2 = Rejected, ...
      };
      await doctorApi.createConsultationResponse(responsePayload);

      // PUT /api/ConsultationRequests/{requestId}/{stringStatus}
      await doctorApi.updateConsultationRequestStatus(
        selectedConsultation.requestId,
        stringStatus
      );

      // Cập nhật state local
      const updated = consultations.map((req) =>
        req.id === selectedConsultation.id
          ? {
              ...req,
              status: stringStatus, // Lưu "Approved" hoặc "Rejected"
              response: values.response,
              responseDate: moment().format("YYYY-MM-DD HH:mm:ss"),
              appointmentDate:
                values.action === "approved" ? values.appointmentDate : undefined,
              rejectReason:
                values.action === "rejected" ? values.rejectReason : undefined,
            }
          : req
      );
      setConsultations(updated);

      // Refresh
      await fetchConsultations();

      // Đóng modal
      setResponseVisible(false);
      message.success(
        values.action === "approved"
          ? "Consultation request approved"
          : "Consultation request rejected"
      );
    } catch (error) {
      message.error("Failed to submit response!");
      console.error("Error submitting consultation response:", error);
    } finally {
      setLoading(false);
    }
  };

  // Bác sĩ ấn "Complete"
  const handleComplete = (record) => {
    setLoading(true);
    setTimeout(() => {
      const updated = consultations.map((req) =>
        req.id === record.id
          ? {
              ...req,
              status: "Completed",
              completedDate: moment().format("YYYY-MM-DD HH:mm:ss"),
            }
          : req
      );
      setConsultations(updated);
      fetchConsultations();
      setLoading(false);
      message.success("Consultation completed");
    }, 800);
  };

  // Tag hiển thị: Pending, Approved, Rejected, Completed
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

  // Tag ưu tiên
  const getUrgencyTag = (urgency) => {
    const tags = {
      high: <Tag color="red">Urgent</Tag>,
      medium: <Tag color="orange">Medium</Tag>,
      normal: <Tag color="blue">Normal</Tag>,
      low: <Tag color="green">Low Priority</Tag>,
    };
    return tags[urgency] || <Tag>Undefined</Tag>;
  };

  // Cột cho tab "new" -> hiển thị request "Pending"
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

  // Cột chung cho ongoing, completed, history
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
          {/* Nếu đang "Pending" -> Respond */}
          {record.status === "Pending" && (
            <Button
              type="primary"
              icon={<MessageOutlined />}
              onClick={() => handleRespond(record)}
            >
              Respond
            </Button>
          )}
          {/* Nếu đang "Approved" -> Complete */}
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

  return (
    <div className="consult-container">
      <Card className="consult-card">
        <Title level={3} className="consult-title">
          Consultations
        </Title>

        <div className="consult-header">
          <AntInput
            placeholder="Search by parent, child, or topic"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            onClick={fetchConsultations}
            loading={loading}
            className="consult-refresh-btn"
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

      {/* Modal for responding */}
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
            // Mặc định action="approved"
            initialValues={{ action: "approved" }}
          >
            <Divider orientation="left">Consultation Information</Divider>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Parent">
                {selectedConsultation.parentName}
              </Descriptions.Item>
              <Descriptions.Item label="Child">
                {selectedConsultation.childName} ({selectedConsultation.childAge})
              </Descriptions.Item>
              <Descriptions.Item label="Topic">
                {selectedConsultation.topic}
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                {getUrgencyTag(selectedConsultation.urgency)}
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
                <Option value="pending">Set to Pending</Option>
                <Option value="completed">Set to Completed</Option>
              </Select>
            </Form.Item>

            {/* Hiển thị Appointment Date nếu action=approved, hoặc Reject Reason nếu action=rejected */}
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) =>
                getFieldValue("action") === "approved" ? (
                  <Form.Item
                    name="appointmentDate"
                    label="Appointment Date"
                    rules={[
                      { required: true, message: "Please select date/time" },
                    ]}
                  >
                    <DatePicker
                      showTime
                      format="DD/MM/YYYY HH:mm"
                      style={{ width: "100%" }}
                    />
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

      {/* Drawer for details */}
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
                {selectedConsultation.childName} ({selectedConsultation.childAge})
              </Descriptions.Item>
              <Descriptions.Item label="Topic">
                {selectedConsultation.topic}
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                {getUrgencyTag(selectedConsultation.urgency)}
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

              {selectedConsultation.responseDate && (
                <Timeline.Item>
                  <p>
                    <strong>Response</strong> -{" "}
                    {moment(selectedConsultation.responseDate).format(
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

              {selectedConsultation.appointmentDate && (
                <Timeline.Item color="blue">
                  <p>
                    <strong>Appointment</strong> -{" "}
                    {moment(selectedConsultation.appointmentDate).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </p>
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
                  {selectedConsultation.notes && (
                    <Card size="small" title="Notes">
                      <p>{selectedConsultation.notes}</p>
                    </Card>
                  )}
                </Timeline.Item>
              )}

              {selectedConsultation.feedback && (
                <Timeline.Item dot={<CommentOutlined />}>
                  <p>
                    <strong>Feedback</strong>
                  </p>
                  <Card size="small">
                    <Rate disabled value={selectedConsultation.rating} />
                    <p style={{ marginTop: 8 }}>
                      {selectedConsultation.feedback}
                    </p>
                  </Card>
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
