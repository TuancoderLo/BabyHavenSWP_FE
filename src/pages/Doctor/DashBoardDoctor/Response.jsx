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
  Tooltip,
  Spin,
  Drawer,
  Descriptions,
  Avatar,
  Divider,
  Timeline,
  Rate,
  Empty,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  MessageOutlined,
  CalendarOutlined,
  UserOutlined,
  StarOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const Response = () => {
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchResponses();
  }, [activeTab]);

  const fetchResponses = () => {
    setLoading(true);

    // Giả lập API call để lấy danh sách phản hồi tư vấn
    setTimeout(() => {
      // Dữ liệu mẫu
      const mockData = [
        {
          id: 1,
          parentName: "Nguyễn Văn Hiếu",
          parentAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
          childName: "Hoàng",
          childAge: "2 tuổi",
          requestDate: "2023-11-10T08:30:00",
          responseDate: "2023-11-10T10:15:00",
          topic: "Tiêm chủng",
          description:
            "Con tôi sắp đến lịch tiêm phòng. Tôi muốn hỏi về các loại vaccine cần thiết cho bé 2 tuổi và các tác dụng phụ có thể xảy ra.",
          response:
            "Đối với bé 2 tuổi, các loại vaccine cần thiết bao gồm: MMR (sởi, quai bị, rubella), DPT (bạch hầu, ho gà, uốn ván), và vaccine cúm hàng năm. Tác dụng phụ thường gặp có thể là sốt nhẹ, đau tại chỗ tiêm trong 1-2 ngày. Tôi sẽ tư vấn chi tiết hơn trong buổi hẹn.",
          status: "completed",
          appointmentDate: "2023-11-15T14:00:00",
          completedDate: "2023-11-15T15:00:00",
          rating: 5,
          feedback:
            "Bác sĩ tư vấn rất chi tiết và dễ hiểu. Cảm ơn bác sĩ rất nhiều!",
          notes:
            "Đã tư vấn về lịch tiêm chủng và cách xử lý tác dụng phụ. Phụ huynh rất hài lòng.",
        },
        {
          id: 2,
          parentName: "Trần Thị Hạnh",
          parentAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
          childName: "Bin",
          childAge: "6 tháng",
          requestDate: "2023-11-08T10:15:00",
          responseDate: "2023-11-08T13:30:00",
          topic: "Dinh dưỡng",
          description:
            "Con tôi bắt đầu ăn dặm nhưng thường xuyên từ chối thức ăn. Tôi cần tư vấn về cách khuyến khích bé ăn và các loại thực phẩm phù hợp.",
          response:
            "Việc bé từ chối thức ăn trong giai đoạn đầu ăn dặm là khá phổ biến. Tôi đề xuất bắt đầu với các loại thức ăn có vị nhạt, kết cấu mịn như cháo, khoai tây nghiền. Hãy tạo không khí vui vẻ khi cho bé ăn và không ép buộc. Chúng ta sẽ thảo luận chi tiết hơn trong buổi tư vấn.",
          status: "completed",
          appointmentDate: "2023-11-12T09:00:00",
          completedDate: "2023-11-12T10:00:00",
          rating: 4,
          feedback:
            "Bác sĩ rất kiên nhẫn và đưa ra nhiều gợi ý hữu ích. Sau khi áp dụng, bé đã bắt đầu ăn tốt hơn.",
          notes:
            "Đã tư vấn về phương pháp ăn dặm BLW và cách chuẩn bị thức ăn phù hợp với độ tuổi.",
        },
        {
          id: 3,
          parentName: "Lê Văn Trường",
          parentAvatar: "https://randomuser.me/api/portraits/men/62.jpg",
          childName: "Tèo",
          childAge: "1 tuổi",
          requestDate: "2023-11-05T14:45:00",
          responseDate: "2023-11-06T09:20:00",
          topic: "Phát triển",
          description:
            "Con tôi 1 tuổi nhưng vẫn chưa biết đi. Tôi muốn biết đây có phải là vấn đề đáng lo ngại không và có cách nào giúp bé phát triển kỹ năng vận động tốt hơn.",
          response:
            "Mỗi bé có tốc độ phát triển khác nhau, một số bé có thể đi muộn hơn, thường là từ 9-18 tháng. Tuy nhiên, chúng ta nên đánh giá các mốc phát triển khác của bé. Tôi sẽ hướng dẫn một số bài tập đơn giản để kích thích phát triển vận động trong buổi tư vấn.",
          status: "scheduled",
          appointmentDate: "2023-11-19T16:30:00",
        },
        {
          id: 4,
          parentName: "Phạm Thị Dung",
          parentAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
          childName: "Đậu",
          childAge: "3 tuổi",
          requestDate: "2023-11-02T11:30:00",
          responseDate: "2023-11-03T15:45:00",
          topic: "Hành vi",
          description:
            "Con tôi hay cáu gắt và khóc khi không được như ý. Tôi muốn biết cách xử lý tình huống này một cách hiệu quả.",
          response:
            "Tôi không chuyên về tư vấn hành vi trẻ em. Tôi đề xuất bạn liên hệ với bác sĩ tâm lý trẻ em để được hỗ trợ tốt hơn.",
          status: "rejected",
          rejectReason:
            "Tôi không chuyên về tư vấn hành vi trẻ em. Tôi đề xuất bạn liên hệ với bác sĩ tâm lý trẻ em để được hỗ trợ tốt hơn.",
        },
        {
          id: 5,
          parentName: "Hoàng Văn Kiệt",
          parentAvatar: "https://randomuser.me/api/portraits/men/92.jpg",
          childName: "Hải Đăng",
          childAge: "4 tuổi",
          requestDate: "2023-10-28T09:00:00",
          responseDate: "2023-10-29T10:30:00",
          topic: "Sức khỏe",
          description:
            "Con tôi thường xuyên bị ho vào ban đêm. Tôi muốn biết nguyên nhân và cách điều trị.",
          response:
            "Dựa trên mô tả của bạn, bé có thể có dấu hiệu của hen suyễn nhẹ hoặc trào ngược dạ dày. Tôi sẽ tư vấn chi tiết về cách theo dõi và điều trị trong buổi hẹn.",
          status: "completed",
          appointmentDate: "2023-11-05T14:00:00",
          completedDate: "2023-11-05T15:00:00",
          rating: 5,
          feedback:
            "Bác sĩ rất tận tâm và chuyên nghiệp. Sau khi áp dụng phương pháp điều trị, tình trạng ho của bé đã giảm đáng kể.",
          notes:
            "Bé có dấu hiệu của hen suyễn nhẹ. Đã tư vấn cách sử dụng thuốc và theo dõi. Hẹn tái khám sau 2 tuần.",
        },
      ];

      // Lọc dữ liệu theo tab đang active
      let filteredData = [];
      switch (activeTab) {
        case "completed":
          filteredData = mockData.filter((item) => item.status === "completed");
          break;
        case "scheduled":
          filteredData = mockData.filter((item) => item.status === "scheduled");
          break;
        case "rejected":
          filteredData = mockData.filter((item) => item.status === "rejected");
          break;
        default:
          filteredData = mockData;
      }

      setResponses(filteredData);
      setLoading(false);
    }, 1000);
  };

  const handleViewDetail = (record) => {
    setSelectedResponse(record);
    setDetailVisible(true);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "scheduled":
        return <Tag color="blue">Scheduled</Tag>;
      case "completed":
        return <Tag color="green">Completed</Tag>;
      case "rejected":
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag>Unknown</Tag>;
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
      title: "Response Date",
      dataIndex: "responseDate",
      key: "responseDate",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) =>
        rating ? <Rate disabled defaultValue={rating} /> : "-",
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
          type="primary"
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="tab-container">
      <Title level={4} className="section-title">
        Consultation Response History
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarExtraContent={
          <Button type="primary" onClick={fetchResponses} loading={loading}>
            Refresh
          </Button>
        }
      >
        <TabPane tab="All" key="all">
          <Table
            columns={columns}
            dataSource={responses}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            locale={{
              emptyText: <Empty description="No response data available" />,
            }}
          />
        </TabPane>

        <TabPane tab="Completed" key="completed">
          <Table
            columns={columns}
            dataSource={responses}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            locale={{
              emptyText: <Empty description="No completed responses" />,
            }}
          />
        </TabPane>

        <TabPane tab="Scheduled" key="scheduled">
          <Table
            columns={columns}
            dataSource={responses}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            locale={{
              emptyText: <Empty description="No scheduled responses" />,
            }}
          />
        </TabPane>

        <TabPane tab="Rejected" key="rejected">
          <Table
            columns={columns}
            dataSource={responses}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            locale={{
              emptyText: <Empty description="No rejected responses" />,
            }}
          />
        </TabPane>
      </Tabs>

      {/* Drawer xem chi tiết */}
      <Drawer
        title="Consultation Response Details"
        placement="right"
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        width={600}
      >
        {selectedResponse && (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedResponse.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Parent">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Avatar src={selectedResponse.parentAvatar} size="small" />
                  <span style={{ marginLeft: 8 }}>
                    {selectedResponse.parentName}
                  </span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Child">
                {selectedResponse.childName} ({selectedResponse.childAge})
              </Descriptions.Item>
              <Descriptions.Item label="Topic">
                {selectedResponse.topic}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Consultation Progress</Divider>

            <Timeline>
              <Timeline.Item>
                <p>
                  <strong>Consultation Request</strong> -{" "}
                  {moment(selectedResponse.requestDate).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </p>
                <Card size="small">
                  <Paragraph>{selectedResponse.description}</Paragraph>
                </Card>
              </Timeline.Item>

              <Timeline.Item>
                <p>
                  <strong>Doctor's Response</strong> -{" "}
                  {moment(selectedResponse.responseDate).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </p>
                <Card size="small">
                  <Paragraph>{selectedResponse.response}</Paragraph>
                </Card>
              </Timeline.Item>

              {selectedResponse.status === "rejected" ? (
                <Timeline.Item color="red">
                  <p>
                    <strong>Request Rejected</strong>
                  </p>
                  <Card size="small">
                    <Paragraph>{selectedResponse.rejectReason}</Paragraph>
                  </Card>
                </Timeline.Item>
              ) : (
                selectedResponse.appointmentDate && (
                  <Timeline.Item color="blue">
                    <p>
                      <strong>Consultation Appointment</strong> -{" "}
                      {moment(selectedResponse.appointmentDate).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </p>
                    {selectedResponse.status === "scheduled" && (
                      <Tag color="processing">Upcoming</Tag>
                    )}
                  </Timeline.Item>
                )
              )}

              {selectedResponse.completedDate && (
                <Timeline.Item color="green">
                  <p>
                    <strong>Consultation Completed</strong> -{" "}
                    {moment(selectedResponse.completedDate).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </p>
                  {selectedResponse.notes && (
                    <Card size="small" title="Doctor's Notes">
                      <Paragraph>{selectedResponse.notes}</Paragraph>
                    </Card>
                  )}
                </Timeline.Item>
              )}

              {selectedResponse.feedback && (
                <Timeline.Item dot={<CommentOutlined />}>
                  <p>
                    <strong>Parent's Feedback</strong>
                  </p>
                  <Card size="small">
                    <Rate disabled defaultValue={selectedResponse.rating} />
                    <Paragraph style={{ marginTop: 8 }}>
                      {selectedResponse.feedback}
                    </Paragraph>
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

export default Response;
