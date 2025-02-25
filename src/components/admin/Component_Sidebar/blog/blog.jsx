import React, { useState, useEffect } from "react";
import blogCategoryApi from "../../../../services/blogCategoryApi";
import blogApi from "../../../../services/blogApi";
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
  Radio,
  Tag,
} from "antd";

function Blog() {
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("categories");
  const [blogs, setBlogs] = useState([]);
  const [blogModalVisible, setBlogModalVisible] = useState(false);
  const [blogForm] = Form.useForm();
  const [editingBlogId, setEditingBlogId] = useState(null);

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

  // Thêm các function để quản lý blog
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogApi.getAll();
      if (response?.data?.status === 1) {
        setBlogs(
          response.data.data.map((blog) => ({ ...blog, key: blog.blogId }))
        );
      } else {
        message.warning(response?.data?.message || "Không có dữ liệu blog");
      }
    } catch (error) {
      message.error("Không thể tải danh sách blog");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "categories") {
      fetchCategories();
      fetchParentCategories();
    } else {
      fetchBlogs();
    }
  }, [activeTab]);

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

  const handleBlogSubmit = async (values) => {
    try {
      setLoading(true);
      const submitData = {
        title: values.title,
        content: values.content,
        categoryName:
          categories.find((cat) => cat.categoryId === values.categoryId)
            ?.categoryName || "",
        imageBlog: values.imageBlog,
        tags: values.tags,
        referenceSources: values.referenceSources,
        authorName: "Admin", // Tạm thời hardcode authorName
      };

      let response;
      if (editingBlogId) {
        response = await blogApi.update(editingBlogId, submitData);
      } else {
        response = await blogApi.create(submitData);
      }

      if (response?.data?.status === 1) {
        message.success(
          editingBlogId
            ? "Cập nhật blog thành công"
            : "Thêm blog mới thành công"
        );
        setBlogModalVisible(false);
        blogForm.resetFields();
        fetchBlogs();
      } else {
        message.error(response?.data?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi xử lý blog");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      setLoading(true);
      const response = await blogApi.delete(blogId);
      if (response?.data?.status === 1) {
        message.success("Xóa blog thành công");
        fetchBlogs();
      } else {
        message.error(response?.data?.message || "Có lỗi xảy ra khi xóa blog");
      }
    } catch (error) {
      message.error("Không thể xóa blog");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlog = async (record) => {
    try {
      setLoading(true);
      const response = await blogApi.getById(record.blogId);
      if (response?.data?.status === 1) {
        const blogData = response.data.data;
        setEditingBlogId(blogData.blogId);
        blogForm.setFieldsValue({
          title: blogData.title,
          content: blogData.content,
          categoryId: blogData.categoryId,
          imageBlog: blogData.imageBlog,
          tags: blogData.tags,
          referenceSources: blogData.referenceSources,
          status: blogData.status,
        });
        setBlogModalVisible(true);
      }
    } catch (error) {
      message.error("Không thể tải thông tin blog");
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

  const blogColumns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusColors = {
          Draft: "orange",
          Pending: "blue",
          Approved: "green",
          Rejected: "red",
        };
        return (
          <Tag color={statusColors[status] || "default"}>
            {status || "Không xác định"}
          </Tag>
        );
      },
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags) => (
        <div>
          {tags?.split(",").map((tag, index) => (
            <Tag key={index}>{tag.trim()}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button type="primary" onClick={() => handleEditBlog(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa blog này?"
            onConfirm={() => handleDeleteBlog(record.blogId)}
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
      <div style={{ marginBottom: 16 }}>
        <Radio.Group
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          <Radio.Button value="categories">Quản lý danh mục</Radio.Button>
          <Radio.Button value="blogs">Quản lý bài viết</Radio.Button>
        </Radio.Group>
      </div>

      {activeTab === "categories" ? (
        <>
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
                rules={[
                  { required: true, message: "Vui lòng nhập tên danh mục" },
                ]}
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

              <Form.Item
                name="isActive"
                label="Trạng thái"
                valuePropName="checked"
              >
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
        </>
      ) : (
        <>
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2>Quản lý bài viết</h2>
            <Button
              type="primary"
              onClick={() => {
                setEditingBlogId(null);
                blogForm.resetFields();
                setBlogModalVisible(true);
              }}
            >
              Thêm bài viết mới
            </Button>
          </div>

          <Table
            columns={blogColumns}
            dataSource={blogs}
            loading={loading}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} bài viết`,
            }}
          />

          <Modal
            title={editingBlogId ? "Sửa bài viết" : "Thêm bài viết mới"}
            open={blogModalVisible}
            onCancel={() => {
              setBlogModalVisible(false);
              blogForm.resetFields();
            }}
            footer={null}
            width={800}
          >
            <Form form={blogForm} onFinish={handleBlogSubmit} layout="vertical">
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="content"
                label="Nội dung"
                rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
              >
                <Input.TextArea rows={6} />
              </Form.Item>

              <Form.Item
                name="categoryId"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select>
                  {categories.map((category) => (
                    <Select.Option
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.categoryName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="imageBlog" label="URL Hình ảnh">
                <Input placeholder="Nhập URL hình ảnh" />
              </Form.Item>

              <Form.Item name="tags" label="Tags">
                <Input placeholder="Nhập tags, phân cách bằng dấu phẩy (vd: React, JavaScript)" />
              </Form.Item>

              <Form.Item name="referenceSources" label="Nguồn tham khảo">
                <Input placeholder="Nhập URL nguồn tham khảo" />
              </Form.Item>

              <Form.Item name="status" label="Trạng thái" initialValue="Draft">
                <Select>
                  <Select.Option value="Draft">Bản nháp</Select.Option>
                  <Select.Option value="Pending">Chờ duyệt</Select.Option>
                  <Select.Option value="Approved">Đã duyệt</Select.Option>
                  <Select.Option value="Rejected">Từ chối</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.status !== currentValues.status
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("status") === "Rejected" ? (
                    <Form.Item name="rejectionReason" label="Lý do từ chối">
                      <Input.TextArea rows={3} />
                    </Form.Item>
                  ) : null
                }
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
                      setBlogModalVisible(false);
                      blogForm.resetFields();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {editingBlogId ? "Cập nhật" : "Thêm mới"}
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
}

export default Blog;
