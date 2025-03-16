import React, { useState, useEffect } from "react";
import { Table, Button, message, Popconfirm, Typography } from "antd";
import membershipApi from "../../../../services/memberShipApi";
import "./members.css";

const { Title } = Typography;

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Thêm phương thức mới vào membershipApi
  const fetchAllMemberships = async () => {
    try {
      setLoading(true);
      const response = await membershipApi.getAllMemberships();
      // Kiểm tra cấu trúc dữ liệu và điều chỉnh
      if (Array.isArray(response.data)) {
        setMembers(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        // Nếu dữ liệu có cấu trúc { data: [...] }
        setMembers(response.data.data);
      } else {
        // Nếu không phải mảng, log ra để kiểm tra
        console.log("Dữ liệu không phải mảng:", response.data);
        setMembers([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      message.error("Không thể tải danh sách thành viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMemberships();
  }, []);

  // Xử lý xóa thành viên
  const handleDelete = async (memberMembershipId) => {
    try {
      setLoading(true);
      await membershipApi.deleteMembership(memberMembershipId);
      message.success("Xóa thành viên thành công");
      fetchAllMemberships();
    } catch (error) {
      message.error("Không thể xóa thành viên");
    } finally {
      setLoading(false);
    }
  };

  // Hàm render trạng thái với màu sắc tương ứng
  const renderStatus = (status) => {
    let className = "";

    if (status === "Active") {
      className = "status-active";
    } else if (status === "Inactive") {
      className = "status-inactive";
    } else {
      className = "status-pending";
    }

    return <span className={className}>{status}</span>;
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 80,
      className: "index-column",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên thành viên",
      dataIndex: "memberName",
      key: "memberName",
      className: "member-name",
    },
    {
      title: "Gói thành viên",
      dataIndex: "packageName",
      key: "packageName",
      className: "package-name",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(record.memberMembershipId)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger className="delete-button">
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="members-container">
      <div className="members-header">
        <Title level={4} className="members-title">
          Danh sách thành viên
        </Title>
      </div>

      <Table
        className="members-table"
        columns={columns}
        dataSource={members}
        rowKey="memberMembershipId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng cộng ${total} thành viên`,
        }}
      />
    </div>
  );
};

export default Members;
