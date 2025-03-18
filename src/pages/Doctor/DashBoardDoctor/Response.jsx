import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Drawer,
  Descriptions,
  Avatar,
  Divider,
  Timeline,
  Card,
  Rate,
  Typography,
  Tabs,
  Empty,
} from "antd";
import { EyeOutlined, UserOutlined, CommentOutlined } from "@ant-design/icons";
import moment from "moment";
import "./Response.css";

const { Title, Text, Paragraph } = Typography;
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
    // Giả lập API call
    setTimeout(() => {
      // Mock data
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
            "Con tôi sắp đến lịch tiêm phòng...",
          response: "Đối với bé 2 tuổi, vaccine...",
          status: "completed",
          appointmentDate: "2023-11-15T14:00:00",
          completedDate: "2023-11-15T15:00:00",
          rating: 5,
          feedback: "Bác sĩ tư vấn rất chi tiết...",
          notes: "Đã tư vấn về lịch tiêm chủng...",
        },
        // ...
      ];

      let filteredData = [];
      switch (activeTab) {
        case "completed":
          filteredData = mockData.filter((i) => i.status === "completed");
          break;
        case "scheduled":
          filteredData = mockData.filter((i) => i.status === "scheduled");
          break;
        case "rejected":
          filteredData = mockData.filter((i) => i.status === "rejected");
          break;
        default:
          filteredData = mockData;
      }

      setResponses(filteredData);
      setLoading(false);
    }, 800);
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
        <div className="response-parent-info">
          <Avatar src={record.parentAvatar} icon={<UserOutlined />} />
          <span className="response-parent-name">{text}</span>
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
      render: getStatusTag,
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (rating ? <Rate disabled defaultValue={rating} /> : "-"),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} type="primary">
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="response-container">
      <Card className="response-card">
        <Title level={3} className="response-title">
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
      </Card>

      {/* Drawer chi tiết */}
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
                <div className="response-drawer-parent">
                  <Avatar src={selectedResponse.parentAvatar} size="small" />
                  <span>{selectedResponse.parentName}</span>
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
                  {moment(selectedResponse.requestDate).format("DD/MM/YYYY HH:mm")}
                </p>
                <Card size="small">
                  <Paragraph>{selectedResponse.description}</Paragraph>
                </Card>
              </Timeline.Item>

              <Timeline.Item>
                <p>
                  <strong>Doctor's Response</strong> -{" "}
                  {moment(selectedResponse.responseDate).format("DD/MM/YYYY HH:mm")}
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
                      {moment(selectedResponse.appointmentDate).format("DD/MM/YYYY HH:mm")}
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
                    {moment(selectedResponse.completedDate).format("DD/MM/YYYY HH:mm")}
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
