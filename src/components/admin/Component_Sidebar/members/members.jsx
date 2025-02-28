import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Popconfirm,
} from "antd";
import userAccountsApi from "../../../../services/userAccountsApi";
import moment from "moment";

const { Option } = Select;

const Members = () => {
  const [members, setMembers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // Lấy danh sách thành viên
  const fetchMembers = async () => {
    try {
      const response = await userAccountsApi.getAll();
      setMembers(response.data.data);
    } catch (error) {
      message.error("Không thể tải danh sách thành viên");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Xử lý thêm/sửa thành viên
  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await userAccountsApi.update(editingId, values);
        message.success("Cập nhật thành viên thành công");
      } else {
        await userAccountsApi.create(values);
        message.success("Thêm thành viên thành công");
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchMembers();
    } catch (error) {
      message.error("Có lỗi xảy ra");
    }
  };

  // Xử lý xóa thành viên
  const handleDelete = async (id) => {
    try {
      await userAccountsApi.delete(id);
      message.success("Xóa thành viên thành công");
      fetchMembers();
    } catch (error) {
      message.error("Không thể xóa thành viên");
    }
  };

  const columns = [
    {
      title: "Tên người dùng",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
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
          <Button
            type="primary"
            onClick={() => {
              setEditingId(record.id);
              form.setFieldsValue({
                ...record,
                dateOfBirth: moment(record.dateOfBirth),
              });
              setIsModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="primary" danger style={{ marginLeft: 8 }}>
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Button
        type="primary"
        onClick={() => {
          setEditingId(null);
          form.resetFields();
          setIsModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Thêm thành viên
      </Button>

      <Table columns={columns} dataSource={members} rowKey="id" />

      <Modal
        title={editingId ? "Sửa thành viên" : "Thêm thành viên"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="username"
            label="Tên người dùng"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Male">Nam</Option>
              <Option value="Female">Nữ</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            rules={[{ required: true }]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>

          {!editingId && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingId ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Members;
