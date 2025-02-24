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
      // Kiểm tra cấu trúc dữ liệu trả về
      console.log("GET Response:", response.data); // Thêm log để debug
      if (response?.data?.status === 1) {
        const formattedData = response.data.data.map((item) => ({
          ...item,
          key: item.categoryId,
        }));
        setCategories(formattedData);
      } else {
        message.warning(response?.data?.message || "Không có dữ liệu");
      }
    } catch (error) {
      message.error("Không thể tải danh sách danh mục");
      console.error("GET Error:", error); // Thêm log để debug
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh sách parent categories
  const fetchParentCategories = async () => {
    try {
      const response = await blogCategoryApi.getAll();
      if (response?.data?.data) {
        setParentCategories(response.data.data);
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
      const submitData = {
        categoryName: values.categoryName,
        description: values.description || "",
        isActive: values.isActive,
        parentCategoryId: values.parentCategoryId || null,
      };
      console.log("Form Submit Data:", submitData); // Thêm log để debug

      let response;
      if (editingId) {
        response = await blogCategoryApi.update(editingId, submitData);
      } else {
        response = await blogCategoryApi.create(submitData);
      }
      console.log("Submit Response:", response.data); // Thêm log để debug

      if (response?.data?.status === 1) {
        message.success(response.data.message);
        setIsModalVisible(false);
        form.resetFields();
        fetchCategories();
      } else {
        message.error(response?.data?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Submit Error:", error); // Thêm log để debug
      message.error(
        "Có lỗi xảy ra: " + (error.response?.data?.message || error.message)
      );
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
      title: "Danh mục cha",
      dataIndex: "parentCategoryId",
      key: "parentCategoryId",
      render: (parentId) => {
        const parentCategory = parentCategories.find(
          (cat) => cat.categoryId === parentId
        );
        return parentCategory ? parentCategory.categoryName : "Không có";
      },
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
          initialValues={{
            isActive: true,
            parentCategoryId: null,
          }}
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
