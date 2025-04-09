import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Rate,
  message,
  Spin,
  Tag,
  Tooltip,
  Input,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import "./RateAdmin.css";

const { Search } = Input;

const RateAdmin = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [consultationDetail, setConsultationDetail] = useState(null);
  const [consultationRequest, setConsultationRequest] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState({}); // Lưu trữ thông tin người dùng

  // Hàm lấy danh sách đánh giá
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://babyhaven-swp-web-emhrccb7hfh7bkf5.southeastasia-01.azurewebsites.net/api/RatingFeedback"
      );

      if (response.data.status === 1) {
        const feedbackData = response.data.data;
        setFeedbacks(feedbackData);

        // Lấy danh sách userId để tìm kiếm thông tin người dùng
        const userIds = feedbackData.map((feedback) => feedback.userId);
        fetchUserDetails(userIds);
      } else {
        message.error("Unable to fetch rating data");
      }
    } catch (error) {
      console.error("Error when fetching rating list:", error);
      message.error("An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy thông tin chi tiết người dùng
  const fetchUserDetails = async (userIds) => {
    if (!userIds || userIds.length === 0) return;

    try {
      const response = await axios.get(
        "https://babyhaven-swp-web-emhrccb7hfh7bkf5.southeastasia-01.azurewebsites.net/api/UserAccounts/odata"
      );

      if (response.data) {
        // Tạo một đối tượng map từ userId đến thông tin người dùng
        const userMap = {};
        response.data.forEach((user) => {
          userMap[user.userId] = user;
        });

        setUsers(userMap);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  // Lấy thông tin chi tiết về đánh giá
  const fetchConsultationDetail = async (responseId) => {
    try {
      setDetailLoading(true);
      setConsultationDetail(null);
      setConsultationRequest(null);

      console.log("Fetching details for responseId:", responseId);

      // Bước 1: Lấy thông tin phản hồi tư vấn từ responseId
      const responseDetail = await axios.get(
        `https://babyhaven-swp-web-emhrccb7hfh7bkf5.southeastasia-01.azurewebsites.net/api/ConsultationResponses/odata?$filter=responseId eq ${responseId}`
      );

      console.log("Response detail API result:", responseDetail.data);

      let consultationResponse = null;
      if (
        responseDetail.data &&
        responseDetail.data.value &&
        responseDetail.data.value.length > 0
      ) {
        consultationResponse = responseDetail.data.value[0];
      } else if (
        Array.isArray(responseDetail.data) &&
        responseDetail.data.length > 0
      ) {
        consultationResponse = responseDetail.data[0];
      }

      if (consultationResponse) {
        setConsultationDetail(consultationResponse);
        console.log("Found consultation response:", consultationResponse);

        // Bước 2: Nếu có requestId, lấy thông tin yêu cầu tư vấn
        if (consultationResponse.requestId) {
          console.log(
            "Fetching request with ID:",
            consultationResponse.requestId
          );

          // Khi sử dụng OData với API ConsultationRequests
          const requestDetail = await axios.get(
            `https://babyhaven-swp-web-emhrccb7hfh7bkf5.southeastasia-01.azurewebsites.net/api/ConsultationRequests/odata?$filter=requestId eq ${consultationResponse.requestId}`
          );

          console.log("Request detail API result:", requestDetail.data);

          // Kiểm tra nhiều cấu trúc dữ liệu khác nhau mà API có thể trả về
          if (
            requestDetail.data &&
            Array.isArray(requestDetail.data) &&
            requestDetail.data.length > 0
          ) {
            setConsultationRequest(requestDetail.data[0]);
            console.log(
              "Found consultation request (array):",
              requestDetail.data[0]
            );
          } else if (
            requestDetail.data &&
            requestDetail.data.value &&
            requestDetail.data.value.length > 0
          ) {
            setConsultationRequest(requestDetail.data.value[0]);
            console.log(
              "Found consultation request (value):",
              requestDetail.data.value[0]
            );
          } else {
            // Nếu không tìm thấy, thử tìm trực tiếp trong dữ liệu hoàn chỉnh
            try {
              const allRequests = await axios.get(
                `https://babyhaven-swp-web-emhrccb7hfh7bkf5.southeastasia-01.azurewebsites.net/api/ConsultationRequests/odata`
              );

              console.log("All requests:", allRequests.data);

              const foundRequest = Array.isArray(allRequests.data)
                ? allRequests.data.find(
                    (req) => req.requestId === consultationResponse.requestId
                  )
                : allRequests.data.value
                ? allRequests.data.value.find(
                    (req) => req.requestId === consultationResponse.requestId
                  )
                : null;

              if (foundRequest) {
                setConsultationRequest(foundRequest);
                console.log(
                  "Found consultation request manually:",
                  foundRequest
                );
              } else {
                console.log(
                  "Could not find consultation request with ID:",
                  consultationResponse.requestId
                );
              }
            } catch (error) {
              console.error("Error when fetching all requests:", error);
            }
          }
        } else {
          console.log("No requestId found in consultation response");
        }
      } else {
        console.log(
          "No consultation response found for responseId:",
          responseId
        );
        message.info(
          "No detailed information found about consultation response"
        );
      }
    } catch (error) {
      console.error("Error when fetching detailed information:", error);
      message.error("Unable to fetch detailed information");
    } finally {
      setDetailLoading(false);
    }
  };

  // Hàm xóa đánh giá
  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `https://babyhaven-swp-web-emhrccb7hfh7bkf5.southeastasia-01.azurewebsites.net/api/RatingFeedback/${feedbackToDelete.feedbackId}`
      );

      if (response.status === 200) {
        message.success("Rating deleted successfully");
        fetchFeedbacks(); // Tải lại danh sách
      } else {
        message.error("Unable to delete rating");
      }
    } catch (error) {
      console.error("Error when deleting rating:", error);
      message.error("An error occurred while deleting rating");
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
    }
  };

  // Hiển thị modal xác nhận xóa
  const showDeleteConfirm = (feedback) => {
    setFeedbackToDelete(feedback);
    setDeleteModalVisible(true);
  };

  // Hiển thị modal chi tiết
  const showDetailModal = (feedback) => {
    setSelectedFeedback(feedback);
    setDetailVisible(true);
    fetchConsultationDetail(feedback.responseId);
  };

  // Lấy dữ liệu khi component được mount
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Format thời gian
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Render trạng thái đánh giá
  const renderStatus = (status) => {
    let color = "blue";

    switch (status) {
      case "Pending":
        color = "orange";
        break;
      case "Approved":
        color = "green";
        break;
      case "Rejected":
        color = "red";
        break;
      case "Resolved":
        color = "cyan";
        break;
      default:
        color = "blue";
    }

    return <Tag color={color}>{status}</Tag>;
  };

  // Render loại đánh giá
  const renderFeedbackType = (type) => {
    let color;

    switch (type) {
      case "General":
        color = "blue";
        break;
      case "ServiceQuality":
        color = "green";
        break;
      case "DoctorAttitude":
        color = "purple";
        break;
      case "ResponseTime":
        color = "orange";
        break;
      case "AppExperience":
        color = "cyan";
        break;
      case "Other":
        color = "gray";
        break;
      default:
        color = "default";
    }

    return <Tag color={color}>{type}</Tag>;
  };

  // Lấy tên người dùng từ userId
  const getUserName = (userId) => {
    if (users[userId]) {
      return users[userId].name;
    }
    return userId.substring(0, 8) + "...";
  };

  // Cấu hình cột của bảng
  const columns = [
    {
      title: "No.",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "User",
      dataIndex: "userId",
      key: "userId",
      width: 200,
      render: (userId) => {
        const name = getUserName(userId);
        return <span>{name}</span>;
      },
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: 150,
      render: (rating) => <Rate disabled value={rating} />,
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      ellipsis: true,
    },
    {
      title: "Rating Date",
      dataIndex: "feedbackDate",
      key: "feedbackDate",
      width: 180,
      render: (date) => formatDate(date),
    },
    {
      title: "Type",
      dataIndex: "feedbackType",
      key: "feedbackType",
      width: 150,
      render: (type) => renderFeedbackType(type),
      filters: [
        { text: "General", value: "General" },
        { text: "Service Quality", value: "ServiceQuality" },
        { text: "Doctor Attitude", value: "DoctorAttitude" },
        { text: "Response Time", value: "ResponseTime" },
        { text: "App Experience", value: "AppExperience" },
        { text: "Other", value: "Other" },
      ],
      onFilter: (value, record) => record.feedbackType === value,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => renderStatus(status),
      filters: [
        { text: "Pending", value: "Pending" },
        { text: "Approved", value: "Approved" },
        { text: "Rejected", value: "Rejected" },
        { text: "Resolved", value: "Resolved" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              showDetailModal(record);
            }}
            className="view-button"
            title="View details"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              showDeleteConfirm(record);
            }}
            className="delete-button"
            title="Delete rating"
          />
        </div>
      ),
    },
  ];

  // Hàm tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Lọc dữ liệu theo tìm kiếm
  const filteredFeedbacks = feedbacks.filter(
    (feedback) =>
      feedback.comment?.toLowerCase().includes(searchText.toLowerCase()) ||
      getUserName(feedback.userId)
        .toLowerCase()
        .includes(searchText.toLowerCase())
  );

  // Thêm click row để xem chi tiết
  const onRow = (record) => {
    return {
      onClick: () => {
        showDetailModal(record);
      },
    };
  };

  return (
    <div className="rate-admin-container">
      <h1>User Rating Management</h1>

      <div className="rate-admin-tools">
        <Search
          placeholder="Search by user or content"
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          onSearch={handleSearch}
          className="rate-admin-search"
        />
        <div className="rate-admin-refresh">
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchFeedbacks}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="rate-admin-table">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredFeedbacks}
            rowKey="feedbackId"
            bordered
            onRow={onRow}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} ratings`,
            }}
          />
        </Spin>
      </div>

      {/* Modal xác nhận xóa */}
      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this rating?</p>
      </Modal>

      {/* Modal hiển thị chi tiết */}
      <Modal
        title="Rating Details"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedFeedback && (
          <div className="feedback-detail">
            <div className="feedback-info">
              <div className="section-title">Rating Information</div>
              <div className="feedback-content">
                <div className="feedback-item">
                  <strong>User:</strong>
                  <span>{getUserName(selectedFeedback.userId)}</span>
                </div>
                <div className="feedback-item">
                  <strong>Rating:</strong>
                  <Rate disabled value={selectedFeedback.rating} />
                </div>
                <div className="feedback-item">
                  <strong>Comment:</strong>
                  <div className="content-box">{selectedFeedback.comment}</div>
                </div>
                <div className="feedback-item">
                  <strong>Rating Date:</strong>
                  <span>{formatDate(selectedFeedback.feedbackDate)}</span>
                </div>
                <div className="feedback-item">
                  <strong>Type:</strong>
                  {renderFeedbackType(selectedFeedback.feedbackType)}
                </div>
                <div className="feedback-item">
                  <strong>Status:</strong>
                  {renderStatus(selectedFeedback.status)}
                </div>
              </div>
            </div>

            <div className="consultation-detail">
              <div className="section-title">Consultation Information</div>
              <div className="feedback-content">
                {detailLoading ? (
                  <div className="detail-loading">
                    <Spin size="large" />
                    <div>Loading information...</div>
                  </div>
                ) : consultationDetail ? (
                  <>
                    <div className="consultation-item">
                      <strong>Doctor Name:</strong>
                      <span>
                        {consultationDetail.doctorName || "No information"}
                      </span>
                    </div>
                    <div className="consultation-item">
                      <strong>Response Date:</strong>
                      <span>
                        {consultationDetail.responseDate
                          ? formatDate(consultationDetail.responseDate)
                          : "No information"}
                      </span>
                    </div>
                    <div className="consultation-item">
                      <strong>Response:</strong>
                      <div className="content-box">
                        {consultationDetail.content || "No content"}
                      </div>
                    </div>
                    <div className="consultation-item">
                      <strong>Helpful:</strong>
                      <Tag
                        color={
                          consultationDetail.isHelpful ? "success" : "warning"
                        }
                      >
                        {consultationDetail.isHelpful ? "Yes" : "No"}
                      </Tag>
                    </div>

                    {consultationRequest && (
                      <div className="request-detail">
                        <div className="subsection-title">
                          Initial Request Information
                        </div>
                        <div className="request-item">
                          <strong>Child Name:</strong>
                          <span>
                            {consultationRequest.childName || "No information"}
                          </span>
                        </div>
                        <div className="request-item">
                          <strong>Problem:</strong>
                          <div className="content-box">
                            {consultationRequest.description ||
                              "No description"}
                          </div>
                        </div>
                        <div className="request-item">
                          <strong>Urgency Level:</strong>
                          <Tag
                            color={
                              consultationRequest.urgency === "High"
                                ? "red"
                                : consultationRequest.urgency === "Medium"
                                ? "orange"
                                : "blue"
                            }
                          >
                            {consultationRequest.urgency || "Undefined"}
                          </Tag>
                        </div>
                        <div className="request-item">
                          <strong>Category:</strong>
                          <span>
                            {consultationRequest.category || "No information"}
                          </span>
                        </div>
                        <div className="request-item">
                          <strong>Status:</strong>
                          <Tag
                            color={
                              consultationRequest.status === "Completed"
                                ? "success"
                                : consultationRequest.status === "Pending"
                                ? "processing"
                                : "default"
                            }
                          >
                            {consultationRequest.status || "Undefined"}
                          </Tag>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="content-box">
                    No detailed information found about consultation
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RateAdmin;
