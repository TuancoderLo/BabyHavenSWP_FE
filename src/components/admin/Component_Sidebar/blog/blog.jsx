import React, { useState, useEffect } from "react";
import blogCategoryApi from "../../../../services/blogCategoryApi";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Select,
  message,
  Popconfirm,
} from "antd";

function Blog() {
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // Fetch danh sách category
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await blogCategoryApi.getAll();
      if (response?.data) {
        setCategories(response.data);
      }
    } catch (error) {
      message.error("Không thể tải danh sách danh mục");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh sách parent categories
  const fetchParentCategories = async () => {
    try {
      const response = await blogCategoryApi.getAll();
      if (response?.data) {
        setParentCategories(response.data);
      }
    } catch (error) {
      message.error("Không thể tải danh sách danh mục cha");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, []);

  // Xử lý thêm/sửa category
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingId) {
        await blogCategoryApi.update(editingId, values);
        message.success("Cập nhật danh mục thành công");
      } else {
        await blogCategoryApi.create(values);
        message.success("Thêm danh mục thành công");
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa category
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await blogCategoryApi.delete(id);
      message.success("Xóa danh mục thành công");
      fetchCategories();
    } catch (error) {
      message.error("Không thể xóa danh mục: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <span style={{ color: isActive ? "green" : "red" }}>
          {isActive ? "Hoạt động" : "Không hoạt động"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="primary"
            onClick={() => {
              setEditingId(record.categoryId);
              form.setFieldsValue({
                ...record,
                parentCategoryId: record.parentCategoryId || undefined,
              });
              setIsModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDelete(record.categoryId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="primary" danger>
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="blog-container">
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Quản lý danh mục blog</h2>
        <Button
          type="primary"
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Thêm danh mục mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="categoryId"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} danh mục`,
        }}
      />

      <Modal
        title={editingId ? "Sửa danh mục" : "Thêm danh mục mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        confirmLoading={loading}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{ isActive: true }}
        >
          <Form.Item
            name="categoryName"
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="parentCategoryId" label="Danh mục cha">
            <Select
              allowClear
              placeholder="Chọn danh mục cha"
              options={parentCategories.map((category) => ({
                value: category.categoryId,
                label: category.categoryName,
                disabled: category.categoryId === editingId,
              }))}
            />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch
              checkedChildren="Hoạt động"
              unCheckedChildren="Không hoạt động"
            />
          </Form.Item>

          <Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingId ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Blog;
