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
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Hàm lấy danh sách đánh giá
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://babyhaven-swp-a3f2frh5g4gtf4ee.southeastasia-01.azurewebsites.net/api/RatingFeedback"
      );

      if (response.data.status === 1) {
        setFeedbacks(response.data.data);
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

  // Lấy thông tin chi tiết về đánh giá
  const fetchConsultationDetail = async (responseId) => {
    try {
      setDetailLoading(true);
      const response = await axios.get(
        `https://babyhaven-swp-a3f2frh5g4gtf4ee.southeastasia-01.azurewebsites.net/api/ConsultationResponses/odata?$filter=responseId eq ${responseId}`
      );

      if (
        response.data &&
        response.data.value &&
        response.data.value.length > 0
      ) {
        setConsultationDetail(response.data.value[0]);
      } else {
        setConsultationDetail(null);
        message.info("Không tìm thấy thông tin chi tiết");
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin chi tiết:", error);
      message.error("Không thể lấy thông tin chi tiết");
      setConsultationDetail(null);
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

  // Cấu hình cột của bảng
  const columns = [
    {
      title: "ID",
      dataIndex: "feedbackId",
      key: "feedbackId",
      width: 80,
    },
    {
      title: "Người dùng",
      dataIndex: "userId",
      key: "userId",
      width: 280,
      ellipsis: true,
      render: (userId) => (
        <Tooltip title={userId}>
          <span>{userId.substring(0, 8)}...</span>
        </Tooltip>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      width: 180,
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
      feedback.userId?.toLowerCase().includes(searchText.toLowerCase()) ||
      feedback.feedbackId?.toString().includes(searchText)
  );

  return (
    <div className="rate-admin-container">
      <h1>Quản lý đánh giá từ người dùng</h1>

      <div className="rate-admin-tools">
        <Search
          placeholder="Tìm kiếm theo ID, người dùng hoặc nội dung"
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
              <p>
                <strong>ID:</strong> {selectedFeedback.feedbackId}
              </p>
              <p>
                <strong>Người dùng:</strong> {selectedFeedback.userId}
              </p>
              <p>
                <strong>Đánh giá:</strong>{" "}
                <Rate disabled value={selectedFeedback.rating} />
              </p>
              <p>
                <strong>Bình luận:</strong> {selectedFeedback.comment}
              </p>
              <p>
                <strong>Ngày đánh giá:</strong>{" "}
                {formatDate(selectedFeedback.feedbackDate)}
              </p>
              <p>
                <strong>Loại:</strong>{" "}
                {renderFeedbackType(selectedFeedback.feedbackType)}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {renderStatus(selectedFeedback.status)}
              </p>
            </div>

            <div className="consultation-detail">
              <h3>Thông tin tư vấn</h3>
              {detailLoading ? (
                <Spin tip="Đang tải thông tin..."></Spin>
              ) : consultationDetail ? (
                <div>
                  <p>
                    <strong>Tên bác sĩ:</strong> {consultationDetail.doctorName}
                  </p>
                  <p>
                    <strong>Ngày phản hồi:</strong>{" "}
                    {formatDate(consultationDetail.responseDate)}
                  </p>
                  <p>
                    <strong>Nội dung:</strong>
                  </p>
                  <div className="consultation-content">
                    {consultationDetail.content}
                  </div>
                  <p>
                    <strong>Hữu ích:</strong>{" "}
                    {consultationDetail.isHelpful ? "Có" : "Không"}
                  </p>
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
