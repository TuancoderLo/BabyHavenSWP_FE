import React, { useState, useEffect } from "react";
import { Table, Button, message, Popconfirm } from "antd";
import membershipApi from "../../../../services/memberShipApi";

const Members = () => {
  const [members, setMembers] = useState([]);

  // Thêm phương thức mới vào membershipApi
  const fetchAllMemberships = async () => {
    try {
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
    }
  };

  useEffect(() => {
    fetchAllMemberships();
  }, []);

  // Xử lý xóa thành viên
  const handleDelete = async (memberMembershipId) => {
    try {
      await membershipApi.deleteMembership(memberMembershipId);
      message.success("Xóa thành viên thành công");
      fetchAllMemberships();
    } catch (error) {
      message.error("Không thể xóa thành viên");
    }
  };

  const columns = [
    {
      title: "Tên thành viên",
      dataIndex: "memberName",
      key: "memberName",
    },
    {
      title: "Gói thành viên",
      dataIndex: "packageName",
      key: "packageName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(record.memberMembershipId)}
          >
            <Button type="primary" danger>
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Table
        columns={columns}
        dataSource={members}
        rowKey="memberMembershipId"
      />
    </div>
  );
};

export default Members;
