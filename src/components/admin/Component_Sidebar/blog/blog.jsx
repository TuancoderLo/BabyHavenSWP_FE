import React, { useState, useEffect } from "react";
import blogCategoryApi from "../../../../services/blogCategoryApi";
import blogApi from "../../../../services/blogApi";
// import TextEditor from "./textEditor";

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
import "./blog.css";
import TextEditor from "./textEditor";

function Blog() {
  /* ==========================================================================
     STATE MANAGEMENT
     ========================================================================== */
  // Category States
  const [categories, setCategories] = useState([]); // Lưu danh sách categories
  const [parentCategories, setParentCategories] = useState({}); // Lưu thông tin category cha
  const [parentNames, setParentNames] = useState({}); // Lưu tên của category cha
  const [categoryFilter, setCategoryFilter] = useState("all"); // Filter cho categories
  const [editingId, setEditingId] = useState(null); // ID của category đang edit

  // Blog States
  const [blogs, setBlogs] = useState([]); // Lưu danh sách blogs
  const [blogFilter, setBlogFilter] = useState("all"); // Filter cho blogs
  const [editingBlogId, setEditingBlogId] = useState(null); // ID của blog đang edit

  // UI States
  const [activeTab, setActiveTab] = useState("categories"); // Tab hiện tại
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [isModalVisible, setIsModalVisible] = useState(false); // Hiển thị modal category
  const [blogModalVisible, setBlogModalVisible] = useState(false); // Hiển thị modal blog

  // Form Controls
  const [form] = Form.useForm(); // Form cho category
  const [blogForm] = Form.useForm(); // Form cho blog

  /* ==========================================================================
     API CALLS & DATA FETCHING
     ========================================================================== */
  // Tách logic fetch parent names thành function riêng
  const fetchParentNames = async (categoriesData) => {
    try {
      const newParentNames = {};
      for (const category of categoriesData) {
        if (category.parentCategoryId !== null) {
          const response = await blogCategoryApi.getById(
            category.parentCategoryId
          );
          if (response?.data?.status === 1) {
            newParentNames[category.categoryId] =
              response.data.data.categoryName;
          }
        }
      }
      setParentNames(newParentNames);
    } catch (error) {
      console.error("Error fetching parent names:", error);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await blogCategoryApi.getAll();
      if (response?.data?.status === 1) {
        const formattedData = response.data.data.map((item) => ({
          ...item,
          key: item.categoryId,
          level: item.parentCategoryId !== null ? 1 : 0,
        }));
        setCategories(formattedData);
        await fetchParentNames(formattedData);
      } else {
        message.warning(response?.data?.message || "No data available");
      }
    } catch (error) {
      message.error("Unable to load category list");
      console.error("GET Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogApi.getAll();
      if (response?.data?.status === 1) {
        setBlogs(
          response.data.data.map((blog) => ({ ...blog, key: blog.blogId }))
        );
      } else {
        message.warning(response?.data?.message || "No data available");
      }
    } catch (error) {
      message.error("Unable to load blog list");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================================
     FILTER FUNCTIONS
     ========================================================================== */
  // Lọc categories theo parent/child
  const getFilteredCategories = () => {
    switch (categoryFilter) {
      case "parent":
        return categories.filter((cat) => cat.parentCategoryId === null);
      case "child":
        return categories.filter((cat) => cat.parentCategoryId !== null);
      default:
        return categories;
    }
  };

  // Lọc blogs theo status
  const getFilteredBlogs = () => {
    switch (blogFilter) {
      case "approved-rejected":
        return blogs.filter(
          (blog) => blog.status === "Approved" || blog.status === "Rejected"
        );
      case "pending":
        return blogs.filter((blog) => blog.status === "PendingApproval");
      case "draft":
        return blogs.filter((blog) => blog.status === "Draft");
      default:
        return blogs;
    }
  };

  // Render status options based on current blog status and filter
  const getStatusOptions = (currentStatus) => {
    // Nếu đang ở filter Draft
    if (blogFilter === "draft") {
      return [
        { value: "Draft", label: "Draft" },
        { value: "PendingApproval", label: "Submit for Approval" },
      ];
    }

    // Nếu đang ở filter Pending Approval
    if (blogFilter === "pending") {
      return [
        { value: "PendingApproval", label: "Pending Approval" },
        { value: "Approved", label: "Approve" },
        { value: "Rejected", label: "Reject" },
      ];
    }

    // Nếu đang ở filter Approved/Rejected
    if (blogFilter === "approved-rejected") {
      return [
        { value: "Approved", label: "Approved" },
        { value: "Rejected", label: "Rejected" },
      ];
    }

    // Nếu đang tạo mới (không có currentStatus)
    if (!currentStatus) {
      return [
        { value: "Draft", label: "Draft" },
        { value: "PendingApproval", label: "Submit for Approval" },
      ];
    }

    // Dựa vào trạng thái hiện tại của blog
    switch (currentStatus) {
      case "Draft":
        return [
          { value: "Draft", label: "Draft" },
          { value: "PendingApproval", label: "Submit for Approval" },
        ];
      case "PendingApproval":
        return [
          { value: "PendingApproval", label: "Pending Approval" },
          { value: "Approved", label: "Approve" },
          { value: "Rejected", label: "Reject" },
        ];
      case "Approved":
      case "Rejected":
        return [
          { value: "Approved", label: "Approved" },
          { value: "Rejected", label: "Rejected" },
        ];
      default:
        return [
          { value: "Draft", label: "Draft" },
          { value: "PendingApproval", label: "Submit for Approval" },
        ];
    }
  };

  /* ==========================================================================
     EVENT HANDLERS
     ========================================================================== */
  // Category Handlers
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const submitData = {
        categoryName: values.categoryName.trim(),
        description: values.description?.trim() || "",
        parentCategoryId: values.parentCategoryId || null,
        isActive: values.isActive === undefined ? true : values.isActive,
      };

      let response;
      if (editingId) {
        response = await blogCategoryApi.update(editingId, submitData);
      } else {
        response = await blogCategoryApi.create(submitData);
      }

      if (response?.data?.status === 1) {
        message.success(
          editingId
            ? "Category updated successfully"
            : "Category created successfully"
        );
        setIsModalVisible(false);
        form.resetFields();
        await fetchCategories();
      }
    } catch (error) {
      message.error("Unable to delete category: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Blog Handlers
  const handleBlogSubmit = async (values) => {
    try {
      setLoading(true);
      const authorName = localStorage.getItem("name"); // Lấy tên người dùng từ localStorage

      const submitData = {
        title: values.title,
        content: values.content,
        categoryId: values.categoryId,
        categoryName:
          categories.find((cat) => cat.categoryId === values.categoryId)
            ?.categoryName || "",
        imageBlog: values.imageBlog || "",
        tags: values.tags || "",
        referenceSources: values.referenceSources || "",
        status: values.status || "Draft",
        authorName: authorName || "Anonymous", // Sử dụng tên từ localStorage
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
            ? "Blog post updated successfully"
            : "Blog post created successfully"
        );
        setBlogModalVisible(false);
        blogForm.resetFields();
        await fetchBlogs();
      }
    } catch (error) {
      message.error("Unable to save blog post: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================================
     EFFECTS & LIFECYCLE
     ========================================================================== */
  // Effect để fetch dữ liệu ban đầu
  useEffect(() => {
    if (activeTab === "categories") {
      fetchCategories();
    } else {
      fetchBlogs();
    }
  }, [activeTab]);

  /* ==========================================================================
     TABLE COLUMNS CONFIGURATION
     ========================================================================== */
  // Cấu hình cột cho bảng Categories
  const columns = [
    {
      title: "Category Name",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (text, record) => (
        <span style={{ marginLeft: record.level ? "40px" : "0" }}>
          {record.level ? "└ " : ""}
          {text}
        </span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Parent Category",
      dataIndex: "parentCategoryId",
      key: "parentCategoryId",
      render: (_, record) => {
        if (record.parentCategoryId === null) {
          return <Tag color="green">Parent Category</Tag>;
        }
        return <span>{parentNames[record.categoryId] || "Loading..."}</span>;
      },
    },
    {
      title: "Active?",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "InActive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="blog-action-buttons">
          <Button type="primary" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete Confirmation"
            description="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.categoryId)}
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

  // Cấu hình cột cho bảng Blogs
  const blogColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Category",
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
          <Tag color={statusColors[status] || "default"} className="status-tag">
            {status || "Không xác định"}
          </Tag>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="blog-action-buttons">
          <Button type="primary" onClick={() => handleEditBlog(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete Confirmation"
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

  /* ==========================================================================
     ADDITIONAL HANDLERS
     ========================================================================== */
  // Xử lý chỉnh sửa category
  const handleEdit = (record) => {
    setEditingId(record.categoryId);
    form.setFieldsValue({
      categoryName: record.categoryName,
      description: record.description || "",
      parentCategoryId: record.parentCategoryId || null,
      isActive: record.isActive,
    });
    setIsModalVisible(true);
  };

  // Xử lý xóa category
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await blogCategoryApi.delete(id);
      if (response?.data?.status === 1) {
        message.success("Xóa category thành công");
        fetchCategories();
      }
    } catch (error) {
      message.error("Unable to delete category: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm để lấy tags dựa trên category được chọn
  const getTagsFromCategory = (categoryId) => {
    const selectedCategory = categories.find(
      (cat) => cat.categoryId === categoryId
    );
    if (!selectedCategory) return "";

    // Nếu là category con (có parentCategoryId)
    if (selectedCategory.parentCategoryId) {
      // Tìm category cha
      const parentCategory = categories.find(
        (cat) => cat.categoryId === selectedCategory.parentCategoryId
      );
      if (parentCategory) {
        // Trả về "Baby, Sleep Tips" (ví dụ)
        return `${parentCategory.categoryName}, ${selectedCategory.categoryName}`;
      }
      return selectedCategory.categoryName;
    }

    // Nếu là category cha (không có parentCategoryId)
    return selectedCategory.categoryName;
  };

  // Cập nhật handleEditBlog để set tags tự động
  const handleEditBlog = async (record) => {
    setEditingBlogId(record.blogId);
    const tags = getTagsFromCategory(record.categoryId);
    blogForm.setFieldsValue({
      title: record.title,
      content: record.content,
      categoryId: record.categoryId,
      imageBlog: record.imageBlog,
      tags: tags,
      referenceSources: record.referenceSources,
      status: record.status,
    });
    setBlogModalVisible(true);
  };

  // Xử lý xóa blog
  const handleDeleteBlog = async (id) => {
    try {
      setLoading(true);
      const response = await blogApi.delete(id);
      if (response?.data?.status === 1) {
        message.success("Xóa bài viết thành công");
        fetchBlogs();
      }
    } catch (error) {
      message.error("Unable to delete blog post: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================================
     RENDER
     ========================================================================== */
  return (
    <div className="blog-container">
      <div className="blog-tabs">
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
          <div className="blog-section-header">
            <div className="blog-title-section">
              <h2>Manage Categories</h2>
              <Radio.Group
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="blog-filters"
              >
                <Radio.Button value="all">All</Radio.Button>
                <Radio.Button value="parent">Parent Categories</Radio.Button>
                <Radio.Button value="child">Child Categories</Radio.Button>
              </Radio.Group>
            </div>
            <Button
              type="primary"
              onClick={() => {
                setEditingId(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Add New Category
            </Button>
          </div>

          <Table
            className="blog-table"
            columns={columns}
            dataSource={getFilteredCategories()}
            loading={loading}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} categories`,
            }}
          />

          <Modal
            title={editingId ? "Sửa danh mục" : "Thêm danh mục mới"}
            open={isModalVisible}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
              setEditingId(null);
            }}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="blog-form"
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
                <Select allowClear placeholder="Chọn danh mục cha">
                  {categories
                    .filter((cat) => cat.parentCategoryId === null)
                    .map((cat) => (
                      <Select.Option
                        key={cat.categoryId}
                        value={cat.categoryId}
                      >
                        {cat.categoryName}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="isActive"
                label="Trạng thái"
                valuePropName="checked"
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>

              <div className="blog-form-footer">
                <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingId ? "Cập nhật" : "Thêm mới"}
                </Button>
              </div>
            </Form>
          </Modal>
        </>
      ) : (
        <>
          <div className="blog-section-header">
            <div className="blog-title-section">
              <h2>Manage Posts</h2>
              <Radio.Group
                value={blogFilter}
                onChange={(e) => setBlogFilter(e.target.value)}
                className="blog-filters"
              >
                <Radio.Button value="all">All</Radio.Button>
                <Radio.Button value="approved-rejected">
                  Approved/Rejected
                </Radio.Button>
                <Radio.Button value="pending">Pending Approval</Radio.Button>
                <Radio.Button value="draft">Draft</Radio.Button>
              </Radio.Group>
            </div>
            <Button
              type="primary"
              onClick={() => {
                setEditingBlogId(null);
                blogForm.resetFields();
                setBlogModalVisible(true);
              }}
            >
              Add New Post
            </Button>
          </div>

          <Table
            className="blog-table"
            columns={blogColumns}
            dataSource={getFilteredBlogs()}
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
              setEditingBlogId(null);
            }}
            footer={null}
            width={800}
          >
            <Form
              form={blogForm}
              layout="vertical"
              onFinish={handleBlogSubmit}
              className="blog-form"
              initialValues={{
                status: "Draft",
              }}
            >
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: "Title is required" }]}
              >
                <Input placeholder="Enter blog title" />
              </Form.Item>

              <Form.Item
                name="content"
                label="Content"
                rules={[
                  { required: true, message: "Please enter the content" },
                ]}
                valuePropName="data"
                getValueFromEvent={(event, editor) => {
                  return editor.getData(); // Lấy dữ liệu từ CKEditor
                }}
              >
                <TextEditor />
              </Form.Item>

              <Form.Item
                name="categoryId"
                label="Category"
                rules={[{ required: true, message: "Category is required" }]}
              >
                <Select
                  placeholder="Select a category"
                  onChange={(value) => {
                    const tags = getTagsFromCategory(value);
                    blogForm.setFieldsValue({ tags });
                  }}
                >
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

              <Form.Item
                name="tags"
                label="Tags"
                rules={[{ required: true, message: "Tags are required" }]}
              >
                <Input
                  placeholder="Tags will be automatically filled based on category"
                  disabled
                />
              </Form.Item>

              <Form.Item name="referenceSources" label="Reference Sources">
                <Input placeholder="Enter reference sources" />
              </Form.Item>

              <Form.Item
                name="status"
                label="Status"
                initialValue="Draft"
                rules={[{ required: true, message: "Please select a status" }]}
              >
                <Select>
                  {getStatusOptions(
                    editingBlogId ? blogForm.getFieldValue("status") : null
                  ).map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Rejection reason field */}
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.status !== currentValues.status
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("status") === "Rejected" ? (
                    <Form.Item
                      name="rejectionReason"
                      label="Rejection Reason"
                      rules={[
                        {
                          required: true,
                          message: "Please enter rejection reason",
                        },
                      ]}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Enter reason for rejection"
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>

              <div className="blog-form-footer">
                <Button
                  onClick={() => {
                    setBlogModalVisible(false);
                    blogForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingBlogId ? "Update" : "Create"}
                </Button>
              </div>
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
}

export default Blog;
