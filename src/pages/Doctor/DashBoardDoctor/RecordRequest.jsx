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
  Spin,
  Drawer,
  Descriptions,
  Avatar,
  Divider,
  Timeline,
  List,
  Card,
  Empty,
  Badge,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text, Paragraph } = Typography;
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

    // Giả lập API call để lấy danh sách yêu cầu xem hồ sơ
    setTimeout(() => {
      // Dữ liệu mẫu
      const mockData = [
        {
          id: 1,
          parentName: "Nguyễn Văn A",
          parentAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
          childName: "Bé Na",
          childAge: "2 tuổi",
          requestDate: "2023-11-15T08:30:00",
          status: "pending",
          reason:
            "Cần thông tin về lịch sử tiêm chủng của bé để chuẩn bị cho việc nhập học mẫu giáo.",
          recordType: "vaccination",
        },
        {
          id: 2,
          parentName: "Trần Thị B",
          parentAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
          childName: "Bé Bin",
          childAge: "6 tháng",
          requestDate: "2023-11-14T10:15:00",
          status: "pending",
          reason:
            "Muốn xem lại kết quả khám sức khỏe gần đây nhất của bé để theo dõi sự phát triển.",
          recordType: "health_check",
        },
        {
          id: 3,
          parentName: "Lê Văn C",
          parentAvatar: "https://randomuser.me/api/portraits/men/62.jpg",
          childName: "Bé Cu",
          childAge: "1 tuổi",
          requestDate: "2023-11-13T14:45:00",
          status: "approved",
          reason:
            "Cần thông tin về tình trạng dị ứng của bé để chuẩn bị cho việc ăn dặm.",
          recordType: "allergy",
          responseDate: "2023-11-14T09:20:00",
          approvalNote:
            "Đã cung cấp thông tin về tình trạng dị ứng của bé. Bé có dị ứng nhẹ với trứng và sữa bò.",
        },
        {
          id: 4,
          parentName: "Phạm Thị D",
          parentAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
          childName: "Bé Đậu",
          childAge: "3 tuổi",
          requestDate: "2023-11-12T11:30:00",
          status: "rejected",
          reason: "Muốn xem toàn bộ hồ sơ y tế của bé.",
          recordType: "full_record",
          responseDate: "2023-11-13T15:45:00",
          rejectReason:
            "Yêu cầu xem toàn bộ hồ sơ y tế cần được thực hiện trực tiếp tại phòng khám với giấy tờ xác nhận phụ huynh.",
        },
        {
          id: 5,
          parentName: "Hoàng Văn E",
          parentAvatar: "https://randomuser.me/api/portraits/men/92.jpg",
          childName: "Bé Em",
          childAge: "4 tuổi",
          requestDate: "2023-11-11T09:00:00",
          status: "approved",
          reason:
            "Cần thông tin về lịch sử bệnh hen suyễn của bé để cung cấp cho trường mầm non.",
          recordType: "medical_history",
          responseDate: "2023-11-12T10:30:00",
          approvalNote:
            "Đã cung cấp thông tin về lịch sử bệnh hen suyễn của bé, bao gồm các đợt điều trị và thuốc đã sử dụng.",
        },
      ];

      // Lọc dữ liệu theo tab đang active
      let filteredData = [];
      switch (activeTab) {
        case "pending":
          filteredData = mockData.filter((item) => item.status === "pending");
          break;
        case "approved":
          filteredData = mockData.filter((item) => item.status === "approved");
          break;
        case "rejected":
          filteredData = mockData.filter((item) => item.status === "rejected");
          break;
        default:
          filteredData = mockData;
      }

      setRecordRequests(filteredData);
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
      status: values.action,
      note:
        values.action === "approved"
          ? values.approvalNote
          : values.rejectReason,
    };

    // Giả lập API call
    setTimeout(() => {
      console.log("Response data:", responseData);

      // Cập nhật trạng thái của yêu cầu trong danh sách
      const updatedRequests = recordRequests.map((req) => {
        if (req.id === selectedRequest.id) {
          return {
            ...req,
            status: values.action,
            responseDate: moment().format("YYYY-MM-DDTHH:mm:ss"),
            approvalNote:
              values.action === "approved" ? values.approvalNote : null,
            rejectReason:
              values.action === "rejected" ? values.rejectReason : null,
          };
        }
        return req;
      });

      setRecordRequests(updatedRequests);
      setResponseVisible(false);
      setLoading(false);

      message.success(
        values.action === "approved"
          ? "Đã chấp nhận yêu cầu xem hồ sơ"
          : "Đã từ chối yêu cầu xem hồ sơ"
      );

      // Refresh danh sách
      fetchRecordRequests();
    }, 1000);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "pending":
        return <Tag color="blue">Chờ phản hồi</Tag>;
      case "approved":
        return <Tag color="green">Đã chấp nhận</Tag>;
      case "rejected":
        return <Tag color="red">Đã từ chối</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  const getRecordTypeTag = (type) => {
    switch (type) {
      case "vaccination":
        return <Tag color="purple">Tiêm chủng</Tag>;
      case "health_check":
        return <Tag color="cyan">Khám sức khỏe</Tag>;
      case "allergy":
        return <Tag color="orange">Dị ứng</Tag>;
      case "medical_history":
        return <Tag color="blue">Lịch sử bệnh</Tag>;
      case "full_record":
        return <Tag color="magenta">Toàn bộ hồ sơ</Tag>;
      default:
        return <Tag>Khác</Tag>;
    }
  };

  const columns = [
    {
      title: "Phụ huynh",
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
      title: "Trẻ",
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
      title: "Loại hồ sơ",
      dataIndex: "recordType",
      key: "recordType",
      render: (type) => getRecordTypeTag(type),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>

          {record.status === "pending" && (
            <Tooltip title="Phản hồi">
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

  // Danh sách các loại hồ sơ y tế mẫu
  const getMedicalRecords = (childName) => [
    {
      id: 1,
      title: "Lịch sử tiêm chủng",
      type: "vaccination",
      lastUpdated: "2023-10-15",
      content: [
        {
          date: "2023-09-10",
          description: "Vaccine MMR (Sởi, Quai bị, Rubella)",
        },
        {
          date: "2023-06-15",
          description: "Vaccine DPT (Bạch hầu, Ho gà, Uốn ván)",
        },
        { date: "2023-03-20", description: "Vaccine Cúm mùa" },
        { date: "2022-12-05", description: "Vaccine Viêm gan B" },
      ],
    },
    {
      id: 2,
      title: "Khám sức khỏe định kỳ",
      type: "health_check",
      lastUpdated: "2023-11-01",
      content: [
        {
          date: "2023-11-01",
          description:
            "Chiều cao: 85cm, Cân nặng: 12kg, Phát triển bình thường",
        },
        {
          date: "2023-08-01",
          description:
            "Chiều cao: 83cm, Cân nặng: 11.5kg, Phát triển bình thường",
        },
        {
          date: "2023-05-01",
          description:
            "Chiều cao: 80cm, Cân nặng: 11kg, Phát triển bình thường",
        },
      ],
    },
    {
      id: 3,
      title: "Thông tin dị ứng",
      type: "allergy",
      lastUpdated: "2023-07-20",
      content: [
        { date: "2023-07-20", description: "Dị ứng nhẹ với trứng và sữa bò" },
        { date: "2023-04-10", description: "Test dị ứng thực phẩm" },
      ],
    },
    {
      id: 4,
      title: "Lịch sử bệnh",
      type: "medical_history",
      lastUpdated: "2023-10-25",
      content: [
        {
          date: "2023-10-20",
          description: "Viêm họng, điều trị bằng kháng sinh trong 5 ngày",
        },
        {
          date: "2023-08-15",
          description: "Sốt phát ban, nghỉ ngơi và uống nhiều nước",
        },
        {
          date: "2023-05-30",
          description: "Hen suyễn nhẹ, sử dụng thuốc xịt khi cần",
        },
      ],
    },
  ];

  return (
    <div className="tab-container">
      <Title level={4} className="section-title">
        Yêu cầu xem hồ sơ y tế
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarExtraContent={
          <Button
            type="primary"
            onClick={fetchRecordRequests}
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        <TabPane
          tab={
            <Badge
              count={
                recordRequests.filter((r) => r.status === "pending").length
              }
              offset={[10, 0]}
            >
              Chờ phản hồi
            </Badge>
          }
          key="pending"
        >
          <Table
            columns={columns}
            dataSource={recordRequests}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            locale={{
              emptyText: (
                <Empty description="Không có yêu cầu xem hồ sơ nào đang chờ phản hồi" />
              ),
            }}
          />
        </TabPane>

        <TabPane tab="Đã chấp nhận" key="approved">
          <Table
            columns={columns}
            dataSource={recordRequests}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            locale={{
              emptyText: (
                <Empty description="Không có yêu cầu xem hồ sơ nào đã được chấp nhận" />
              ),
            }}
          />
        </TabPane>

        <TabPane tab="Đã từ chối" key="rejected">
          <Table
            columns={columns}
            dataSource={recordRequests}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            locale={{
              emptyText: (
                <Empty description="Không có yêu cầu xem hồ sơ nào đã bị từ chối" />
              ),
            }}
          />
        </TabPane>
      </Tabs>

      {/* Modal phản hồi yêu cầu */}
      <Modal
        title="Phản hồi yêu cầu xem hồ sơ y tế"
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
            <Descriptions
              title="Thông tin yêu cầu"
              bordered
              size="small"
              column={1}
            >
              <Descriptions.Item label="Phụ huynh">
                {selectedRequest.parentName}
              </Descriptions.Item>
              <Descriptions.Item label="Trẻ">
                {selectedRequest.childName} ({selectedRequest.childAge})
              </Descriptions.Item>
              <Descriptions.Item label="Loại hồ sơ">
                {getRecordTypeTag(selectedRequest.recordType)}
              </Descriptions.Item>
              <Descriptions.Item label="Lý do yêu cầu">
                {selectedRequest.reason}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày yêu cầu">
                {moment(selectedRequest.requestDate).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Hồ sơ y tế liên quan</Title>
            <List
              dataSource={getMedicalRecords(selectedRequest.childName).filter(
                (record) =>
                  record.type === selectedRequest.recordType ||
                  selectedRequest.recordType === "full_record"
              )}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    title={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <FileTextOutlined style={{ marginRight: 8 }} />
                        {item.title}
                      </div>
                    }
                    extra={getRecordTypeTag(item.type)}
                    size="small"
                    style={{ width: "100%", marginBottom: 8 }}
                  >
                    <p>
                      <strong>Cập nhật lần cuối:</strong> {item.lastUpdated}
                    </p>
                    <List
                      size="small"
                      dataSource={item.content}
                      renderItem={(record) => (
                        <List.Item>
                          <Text type="secondary">{record.date}:</Text>{" "}
                          {record.description}
                        </List.Item>
                      )}
                    />
                  </Card>
                </List.Item>
              )}
            />

            <Divider />

            <Form.Item
              name="action"
              label="Hành động"
              rules={[{ required: true, message: "Vui lòng chọn hành động" }]}
            >
              <Select>
                <Option value="approved">Chấp nhận yêu cầu</Option>
                <Option value="rejected">Từ chối yêu cầu</Option>
              </Select>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.action !== currentValues.action
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("action") === "approved" ? (
                  <Form.Item
                    name="approvalNote"
                    label="Ghi chú khi chấp nhận"
                    rules={[
                      { required: true, message: "Vui lòng nhập ghi chú" },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Nhập ghi chú về thông tin hồ sơ đã cung cấp"
                    />
                  </Form.Item>
                ) : (
                  <Form.Item
                    name="rejectReason"
                    label="Lý do từ chối"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập lý do từ chối",
                      },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Nhập lý do từ chối yêu cầu"
                    />
                  </Form.Item>
                )
              }
            </Form.Item>

            <Form.Item>
              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
              >
                <Button onClick={() => setResponseVisible(false)}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Gửi phản hồi
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Drawer xem chi tiết */}
      <Drawer
        title="Chi tiết yêu cầu xem hồ sơ y tế"
        placement="right"
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        width={600}
      >
        {selectedRequest && (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(selectedRequest.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Phụ huynh">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Avatar src={selectedRequest.parentAvatar} size="small" />
                  <span style={{ marginLeft: 8 }}>
                    {selectedRequest.parentName}
                  </span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Trẻ">
                {selectedRequest.childName} ({selectedRequest.childAge})
              </Descriptions.Item>
              <Descriptions.Item label="Loại hồ sơ">
                {getRecordTypeTag(selectedRequest.recordType)}
              </Descriptions.Item>
              <Descriptions.Item label="Lý do yêu cầu">
                {selectedRequest.reason}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày yêu cầu">
                {moment(selectedRequest.requestDate).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>

              {selectedRequest.responseDate && (
                <Descriptions.Item label="Ngày phản hồi">
                  {moment(selectedRequest.responseDate).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Descriptions.Item>
              )}

              {selectedRequest.approvalNote && (
                <Descriptions.Item label="Ghi chú khi chấp nhận">
                  {selectedRequest.approvalNote}
                </Descriptions.Item>
              )}

              {selectedRequest.rejectReason && (
                <Descriptions.Item label="Lý do từ chối">
                  {selectedRequest.rejectReason}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedRequest.status === "approved" && (
              <>
                <Divider orientation="left">Hồ sơ y tế đã cung cấp</Divider>
                <List
                  dataSource={getMedicalRecords(
                    selectedRequest.childName
                  ).filter(
                    (record) =>
                      record.type === selectedRequest.recordType ||
                      selectedRequest.recordType === "full_record"
                  )}
                  renderItem={(item) => (
                    <List.Item>
                      <Card
                        title={
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <FileTextOutlined style={{ marginRight: 8 }} />
                            {item.title}
                          </div>
                        }
                        extra={getRecordTypeTag(item.type)}
                        size="small"
                        style={{ width: "100%", marginBottom: 8 }}
                      >
                        <p>
                          <strong>Cập nhật lần cuối:</strong> {item.lastUpdated}
                        </p>
                        <List
                          size="small"
                          dataSource={item.content}
                          renderItem={(record) => (
                            <List.Item>
                              <Text type="secondary">{record.date}:</Text>{" "}
                              {record.description}
                            </List.Item>
                          )}
                        />
                      </Card>
                    </List.Item>
                  )}
                />
              </>
            )}

            {selectedRequest.status === "pending" && (
              <div style={{ marginTop: 16, textAlign: "right" }}>
                <Button
                  type="primary"
                  onClick={() => {
                    setDetailVisible(false);
                    handleRespond(selectedRequest);
                  }}
                >
                  Phản hồi yêu cầu
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
