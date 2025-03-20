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

    const fetchConsultations = () => {
        setLoading(true);
        const mockData = [
            {
                id: 1,
                parentName: "Nguyễn Thị Lam",
                parentAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
                childName: "Nga",
                childAge: "2 tuổi",
                requestDate: "2023-11-15T08:30:00",
                topic: "Tiêm chủng",
                description: "Con tôi sắp đến lịch tiêm phòng...",
                urgency: "normal",
                status: "pending",
                contactMethod: "video",
                preferredTime: "2023-11-20T15:00:00",
            },
            {
                id: 2,
                parentName: "Nguyễn Văn Hiếu",
                parentAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
                childName: "Hoàng",
                childAge: "2 tuổi",
                requestDate: "2023-11-10T08:30:00",
                responseDate: "2023-11-10T10:15:00",
                topic: "Tiêm chủng",
                description: "Con tôi sắp đến lịch tiêm phòng...",
                response: "Đối với bé 2 tuổi, vaccine...",
                status: "completed",
                appointmentDate: "2023-11-15T14:00:00",
                completedDate: "2023-11-15T15:00:00",
                rating: 5,
                feedback: "Bác sĩ tư vấn rất chi tiết...",
                notes: "Đã tư vấn về lịch tiêm chủng...",
            },
        ];

        let filteredData = [];
        switch (activeTab) {
            case "new":
                filteredData = mockData.filter((item) => item.status === "pending");
                break;
            case "ongoing":
                filteredData = mockData.filter((item) => item.status === "accepted");
                break;
            case "completed":
                filteredData = mockData.filter((item) => item.status === "completed");
                break;
            case "history":
                filteredData = mockData;
                break;
            default:
                filteredData = mockData;
        }

        setConsultations(mockData);
        setFilteredConsultations(filteredData);
        setLoading(false);
    };

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
                    if (activeTab === "new") return item.status === "pending";
                    if (activeTab === "ongoing") return item.status === "accepted";
                    if (activeTab === "completed") return item.status === "completed";
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

    const handleResponseSubmit = (values) => {
        setLoading(true);
        setTimeout(() => {
            const updated = consultations.map((req) =>
                req.id === selectedConsultation.id
                    ? {
                        ...req,
                        status: values.action,
                        response: values.response,
                        responseDate: moment().format("YYYY-MM-DD HH:mm:ss"),
                        appointmentDate:
                            values.action === "accepted" ? values.appointmentDate : undefined,
                        rejectReason:
                            values.action === "rejected" ? values.rejectReason : undefined,
                    }
                    : req
            );
            setConsultations(updated);
            fetchConsultations();
            setResponseVisible(false);
            setLoading(false);
            message.success(
                values.action === "accepted"
                    ? "Consultation request accepted"
                    : "Consultation request rejected"
            );
        }, 800);
    };

    const handleComplete = (record) => {
        setLoading(true);
        setTimeout(() => {
            const updated = consultations.map((req) =>
                req.id === record.id
                    ? {
                        ...req,
                        status: "completed",
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

    const getStatusTag = (status) => {
        const tags = {
            pending: <Tag color="blue">Pending</Tag>,
            accepted: <Tag color="orange">Accepted</Tag>,
            completed: <Tag color="green">Completed</Tag>,
            rejected: <Tag color="red">Rejected</Tag>,
        };
        return tags[status] || <Tag>Unknown</Tag>;
    };

    const getUrgencyTag = (urgency) => {
        const tags = {
            high: <Tag color="red">Urgent</Tag>,
            normal: <Tag color="blue">Normal</Tag>,
            low: <Tag color="green">Low Priority</Tag>,
        };
        return tags[urgency] || <Tag>Undefined</Tag>;
    };

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
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record)}
                        className="consult-action-btn"
                    >
                        Details
                    </Button>
                    {record.status === "pending" && (
                        <Button
                            type="primary"
                            icon={<MessageOutlined />}
                            onClick={() => handleRespond(record)}
                            className="consult-action-btn"
                        >
                            Respond
                        </Button>
                    )}
                    {record.status === "accepted" && (
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleComplete(record)}
                            className="consult-action-btn"
                        >
                            Complete
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    const newRequestsCount = consultations.filter(
        (item) => item.status === "pending"
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
                        className="consult-search"
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
                                            style={{ backgroundColor: "#FF6F91" }}
                                        />
                                    )}
                                </span>
                            ),
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
                        initialValues={{ action: "accepted" }}
                    >
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
                            <Descriptions.Item label="Description">
                                {selectedConsultation.description}
                            </Descriptions.Item>
                        </Descriptions>

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
                                        <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: "100%" }} />
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
                            <Descriptions.Item label="Topic">
                                {selectedConsultation.topic}
                            </Descriptions.Item>
                            <Descriptions.Item label="Priority">
                                {getUrgencyTag(selectedConsultation.urgency)}
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

                            {selectedConsultation.responseDate && (
                                <Timeline.Item>
                                    <p>
                                        <strong>Response</strong> -{" "}
                                        {moment(selectedConsultation.responseDate).format("DD/MM/YYYY HH:mm")}
                                    </p>
                                    <Card size="small">
                                        <p>{selectedConsultation.response}</p>
                                    </Card>
                                </Timeline.Item>
                            )}

                            {selectedConsultation.status === "rejected" && (
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
                                        <p style={{ marginTop: 8 }}>{selectedConsultation.feedback}</p>
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