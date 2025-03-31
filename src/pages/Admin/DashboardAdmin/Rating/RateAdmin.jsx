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
        "https://babyhaven-swp-a3f2frh5g4gtf4ee.southeastasia-01.azurewebsites.net/api/RatingFeedback"
      );

      if (response.data.status === 1) {
        const feedbackData = response.data.data;
        setFeedbacks(feedbackData);

        // Lấy danh sách userId để tìm kiếm thông tin người dùng
        const userIds = feedbackData.map((feedback) => feedback.userId);
        fetchUserDetails(userIds);
      } else {
        message.error("Không thể lấy dữ liệu đánh giá");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đánh giá:", error);
      message.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy thông tin chi tiết người dùng
  const fetchUserDetails = async (userIds) => {
    if (!userIds || userIds.length === 0) return;

    try {
      const response = await axios.get(
        "https://babyhaven-swp-a3f2frh5g4gtf4ee.southeastasia-01.azurewebsites.net/api/UserAccounts/odata"
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
        `https://babyhaven-swp-a3f2frh5g4gtf4ee.southeastasia-01.azurewebsites.net/api/ConsultationResponses/odata?$filter=responseId eq ${responseId}`
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
            `https://babyhaven-swp-a3f2frh5g4gtf4ee.southeastasia-01.azurewebsites.net/api/ConsultationRequests/odata?$filter=requestId eq ${consultationResponse.requestId}`
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
                `https://babyhaven-swp-a3f2frh5g4gtf4ee.southeastasia-01.azurewebsites.net/api/ConsultationRequests/odata`
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
        message.info("Không tìm thấy thông tin chi tiết về phản hồi tư vấn");
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin chi tiết:", error);
      message.error("Không thể lấy thông tin chi tiết");
    } finally {
      setDetailLoading(false);
    }
  };

  // Hàm xóa đánh giá
  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `https://babyhaven-swp-a3f2frh5g4gtf4ee.southeastasia-01.azurewebsites.net/api/RatingFeedback/${feedbackToDelete.feedbackId}`
      );

      if (response.status === 200) {
        message.success("Đã xóa đánh giá thành công");
        fetchFeedbacks(); // Tải lại danh sách
      } else {
        message.error("Không thể xóa đánh giá");
      }
    } catch (error) {
      console.error("Lỗi khi xóa đánh giá:", error);
      message.error("Đã xảy ra lỗi khi xóa đánh giá");
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
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Người dùng",
      dataIndex: "userId",
      key: "userId",
      width: 200,
      render: (userId) => {
        const name = getUserName(userId);
        return <span>{name}</span>;
      },
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      width: 150,
      render: (rating) => <Rate disabled value={rating} />,
    },
    {
      title: "Bình luận",
      dataIndex: "comment",
      key: "comment",
      ellipsis: true,
    },
    {
      title: "Ngày đánh giá",
      dataIndex: "feedbackDate",
      key: "feedbackDate",
      width: 180,
      render: (date) => formatDate(date),
    },
    {
      title: "Loại",
      dataIndex: "feedbackType",
      key: "feedbackType",
      width: 150,
      render: (type) => renderFeedbackType(type),
      filters: [
        { text: "Chung", value: "General" },
        { text: "Chất lượng dịch vụ", value: "ServiceQuality" },
        { text: "Thái độ bác sĩ", value: "DoctorAttitude" },
        { text: "Thời gian phản hồi", value: "ResponseTime" },
        { text: "Trải nghiệm ứng dụng", value: "AppExperience" },
        { text: "Khác", value: "Other" },
      ],
      onFilter: (value, record) => record.feedbackType === value,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => renderStatus(status),
      filters: [
        { text: "Đang chờ", value: "Pending" },
        { text: "Đã duyệt", value: "Approved" },
        { text: "Từ chối", value: "Rejected" },
        { text: "Đã giải quyết", value: "Resolved" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => showDetailModal(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
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

  return (
    <div className="rate-admin-container">
      <h1>Quản lý đánh giá từ người dùng</h1>

      <div className="rate-admin-tools">
        <Search
          placeholder="Tìm kiếm theo người dùng hoặc nội dung"
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
            Làm mới
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
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} đánh giá`,
            }}
          />
        </Spin>
      </div>

      {/* Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa đánh giá này không?</p>
      </Modal>

      {/* Modal hiển thị chi tiết */}
      <Modal
        title="Chi tiết đánh giá"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedFeedback && (
          <div className="feedback-detail">
            <div className="feedback-info">
              <h3>Thông tin đánh giá</h3>
              <div className="feedback-item">
                <strong>Người dùng:</strong>{" "}
                {getUserName(selectedFeedback.userId)}
              </div>
              <div className="feedback-item">
                <strong>Đánh giá:</strong>{" "}
                <Rate disabled value={selectedFeedback.rating} />
              </div>
              <div className="feedback-item">
                <strong>Bình luận:</strong> {selectedFeedback.comment}
              </div>
              <div className="feedback-item">
                <strong>Ngày đánh giá:</strong>{" "}
                {formatDate(selectedFeedback.feedbackDate)}
              </div>
              <div className="feedback-item">
                <strong>Loại:</strong>{" "}
                {renderFeedbackType(selectedFeedback.feedbackType)}
              </div>
              <div className="feedback-item">
                <strong>Trạng thái:</strong>{" "}
                {renderStatus(selectedFeedback.status)}
              </div>
            </div>

            <div className="consultation-detail">
              <h3>Thông tin tư vấn</h3>
              {detailLoading ? (
                <Spin tip="Đang tải thông tin..."></Spin>
              ) : consultationDetail ? (
                <div>
                  <p>
                    <strong>Tên bác sĩ:</strong>{" "}
                    {consultationDetail.doctorName || "Không có thông tin"}
                  </p>
                  <p>
                    <strong>Ngày phản hồi:</strong>{" "}
                    {consultationDetail.responseDate
                      ? formatDate(consultationDetail.responseDate)
                      : "Không có thông tin"}
                  </p>
                  <p>
                    <strong>Nội dung phản hồi:</strong>
                  </p>
                  <div className="consultation-content">
                    {consultationDetail.content || "Không có nội dung"}
                  </div>
                  <p>
                    <strong>Hữu ích:</strong>{" "}
                    {consultationDetail.isHelpful !== undefined
                      ? consultationDetail.isHelpful
                        ? "Có"
                        : "Không"
                      : "Không có thông tin"}
                  </p>

                  {consultationRequest ? (
                    <div className="request-detail">
                      <h4>Thông tin yêu cầu ban đầu</h4>
                      <p>
                        <strong>Tên trẻ:</strong>{" "}
                        {consultationRequest.childName || "Không có thông tin"}
                      </p>
                      <p>
                        <strong>Người dùng:</strong>{" "}
                        {consultationRequest.memberName || "Không có thông tin"}
                      </p>
                      <p>
                        <strong>Ngày yêu cầu:</strong>{" "}
                        {consultationRequest.requestDate
                          ? formatDate(consultationRequest.requestDate)
                          : "Không có thông tin"}
                      </p>
                      <p>
                        <strong>Mô tả vấn đề:</strong>
                      </p>
                      <div className="consultation-content">
                        {consultationRequest.description || "Không có mô tả"}
                      </div>
                      <p>
                        <strong>Mức độ khẩn cấp:</strong>{" "}
                        <Tag
                          color={
                            consultationRequest.urgency === "High"
                              ? "red"
                              : consultationRequest.urgency === "Medium"
                              ? "orange"
                              : "blue"
                          }
                        >
                          {consultationRequest.urgency || "Không xác định"}
                        </Tag>
                      </p>
                      <p>
                        <strong>Danh mục:</strong>{" "}
                        {consultationRequest.category || "Không có thông tin"}
                      </p>
                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        <Tag
                          color={
                            consultationRequest.status === "Completed"
                              ? "green"
                              : consultationRequest.status === "Pending"
                              ? "orange"
                              : "blue"
                          }
                        >
                          {consultationRequest.status || "Không xác định"}
                        </Tag>
                      </p>
                    </div>
                  ) : (
                    <div className="no-request-info">
                      <p>Không tìm thấy thông tin về yêu cầu tư vấn ban đầu</p>
                    </div>
                  )}
                </div>
              ) : (
                <p>Không tìm thấy thông tin chi tiết về tư vấn</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RateAdmin;
