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
      message.error("Unable to load category list");
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
      message.error("Unable to load parent category list");
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
        message.warning(response?.data?.message || "No blog data");
      }
    } catch (error) {
      message.error("Unable to load blog list");
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
        message.error(response?.data?.message || "An error occurred");
      }
    } catch (error) {
      console.error("Submit Error:", error); // Thêm log để debug
      message.error(
        "An error occurred: " + (error.response?.data?.message || error.message)
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
      message.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      message.error("Unable to delete category: " + error.message);
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
            ? "Blog updated successfully"
            : "New blog added successfully"
        );
        setBlogModalVisible(false);
        blogForm.resetFields();
        fetchBlogs();
      } else {
        message.error(response?.data?.message || "An error occurred");
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
        message.success("Blog deleted successfully");
        fetchBlogs();
      } else {
        message.error(response?.data?.message || "Error deleting blog");
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
      title: "Name Category",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "parentCategory",
      dataIndex: "parentCategoryId",
      key: "parentCategoryId",
      render: (parentId) => {
        const parentCategory = parentCategories.find(
          (cat) => cat.categoryId === parentId
        );
        return parentCategory ? parentCategory.categoryName : "No Data";
      },
    },
    {
      title: "Active?",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <span style={{ color: isActive ? "green" : "red" }}>
          {isActive ? "Active" : "InActive"}
        </span>
      ),
    },
    {
      title: "Action",
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
            modify
          </Button>
          <Popconfirm
            title="Delete ?"
            description="Are you sure to delete this Data ?"
            onConfirm={() => handleDelete(record.categoryId)}
            okText="Delete"
            cancelText="Cancel"
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
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Category Name",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Status",
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
      title: "CreatedAt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button type="primary" onClick={() => handleEditBlog(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Confirm deletion"
            description="Are you sure you want to delete this blog?"
            onConfirm={() => handleDeleteBlog(record.blogId)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button type="primary" danger>
              Delete
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
          <Radio.Button value="categories">Category Management</Radio.Button>
          <Radio.Button value="blogs">Blog Management</Radio.Button>
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
            <h2>Manage blog categories</h2>
            <Button
              type="primary"
              onClick={() => {
                setEditingId(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Add new category
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
              showTotal: (total) => `Total ${total} categories`,
            }}
          />

          <Modal
            title={editingId ? "Edit Category" : "Add New Category"}
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
                label="Category Name"
                rules={[
                  { required: true, message: "Please enter the category name" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item name="parentCategoryId" label="Parent Category">
                <Select
                  allowClear
                  placeholder="Select parent category"
                  options={parentCategories.map((category) => ({
                    value: category.categoryId,
                    label: category.categoryName,
                    disabled: category.categoryId === editingId,
                  }))}
                />
              </Form.Item>

              <Form.Item name="isActive" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="InActive" />
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
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {editingId ? "Update" : "Add new"}
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
            <h2>Manage posts</h2>
            <Button
              type="primary"
              onClick={() => {
                setEditingBlogId(null);
                blogForm.resetFields();
                setBlogModalVisible(true);
              }}
            >
              Add new post
            </Button>
          </div>

          <Table
            columns={blogColumns}
            dataSource={blogs}
            loading={loading}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} posts`,
            }}
          />

          <Modal
            title={editingBlogId ? "Edit Blog Post" : "Add New Blog Post"}
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
                label="Title"
                rules={[{ required: true, message: "Please enter the title" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="content"
                label="Content"
                rules={[
                  { required: true, message: "Please enter the content" },
                ]}
              >
                <Input.TextArea rows={6} />
              </Form.Item>

              <Form.Item
                name="categoryId"
                label="Category"
                rules={[
                  { required: true, message: "Please select a category" },
                ]}
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

              <Form.Item name="imageBlog" label="Image URL">
                <Input placeholder="Enter image URL" />
              </Form.Item>

              <Form.Item name="tags" label="Tags">
                <Input placeholder="Enter tags, separated by commas (e.g., React, JavaScript)" />
              </Form.Item>

              <Form.Item name="referenceSources" label="Reference Sources">
                <Input placeholder="Enter reference source URL" />
              </Form.Item>

              <Form.Item name="status" label="Status" initialValue="Draft">
                <Select>
                  <Select.Option value="Draft">Draft</Select.Option>
                  <Select.Option value="Pending">
                    Pending Approval
                  </Select.Option>
                  <Select.Option value="Approved">Approved</Select.Option>
                  <Select.Option value="Rejected">Rejected</Select.Option>
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
                    <Form.Item name="rejectionReason" label="Rejection Reason">
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
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {editingId ? "Update" : "Add"}
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
