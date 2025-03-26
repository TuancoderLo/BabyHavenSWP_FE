import React, { useState, useEffect } from "react";
import blogCategoryApi from "../../../../services/blogCategoryApi";
import blogApi from "../../../../services/blogApi";
import TextEditor from "./textEditor";

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

// Thêm CustomEditor component
const CustomEditor = ({ value = "", onChange }) => {
  return (
    <TextEditor
      value={value}
      onChange={(newContent) => {
        if (onChange) {
          onChange(newContent);
        }
      }}
    />
  );
};

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
  // Thêm state cho search query
  const [searchQuery, setSearchQuery] = useState("");

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
  // Lọc categories theo parent/child và search query
  const getFilteredCategories = () => {
    let filteredData = categories;

    // Lọc theo parent/child
    switch (categoryFilter) {
      case "parent":
        filteredData = categories.filter(
          (cat) => cat.parentCategoryId === null
        );
        break;
      case "child":
        filteredData = categories.filter(
          (cat) => cat.parentCategoryId !== null
        );
        break;
      default:
        filteredData = categories;
    }

    // Lọc theo search query nếu có
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredData = filteredData.filter((cat) =>
        cat.categoryName.toLowerCase().includes(query)
      );
    }

    return filteredData;
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
      const email = localStorage.getItem("email"); // Lấy email người dùng từ localStorage

      // Xử lý nội dung từ CKEditor theo yêu cầu của back-end
      const content =
        typeof values.content === "object"
          ? JSON.stringify(values.content) // Chuyển object thành chuỗi JSON
          : values.content?.getData?.() || values.content || ""; // Nếu là CKEditor instance hoặc string

      // Luôn đảm bảo rejectionReason có giá trị, ngay cả khi không có trong form
      const submitData = {
        title: values.title,
        content: content,
        categoryId: values.categoryId,
        categoryName:
          categories.find((cat) => cat.categoryId === values.categoryId)
            ?.categoryName || "",
        email: email || "",
        imageBlog: values.imageBlog || "",
        tags: values.tags || "",
        referenceSources: values.referenceSources || "",
        status: values.status || "Draft",
        rejectionReason:
          values.status === "Rejected"
            ? values.rejectionReason || "No reason provided"
            : values.rejectionReason || "",
      };

      console.log("Submitting blog data:", submitData);

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
      console.error("Blog submission error:", error);
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
      title: "No.",
      key: "index",
      width: 80,
      className: "index-column",
      render: (_, __, index) => index + 1,
    },
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
      title: "No.",
      key: "index",
      width: 80,
      className: "index-column",
      render: (_, __, index) => index + 1,
    },
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
          PendingApproval: "blue",
          Approved: "green",
          Rejected: "red",
        };
        return (
          <Tag color={statusColors[status] || "default"} className="status-tag">
            {status || "Unknown"}
          </Tag>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("en-US"),
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

  // Cập nhật handleEditBlog để lấy dữ liệu chi tiết từ API
  const handleEditBlog = async (record) => {
    try {
      setLoading(true);
      setEditingBlogId(record.blogId);

      // Gọi API để lấy thông tin chi tiết của blog theo ID
      const response = await blogApi.getById(record.blogId);

      if (response?.data?.status === 1) {
        const blogData = response.data.data;

        // Ánh xạ dữ liệu từ API vào cấu trúc phù hợp với form
        blogForm.setFieldsValue({
          title: blogData.title,
          content: blogData.content,
          categoryId: blogData.categoryId, // Lấy từ response hoặc lưu từ record
          imageBlog: blogData.imageBlog,
          tags: blogData.tags,
          referenceSources: blogData.referenceSources,
          status: blogData.status,
          rejectionReason: blogData.rejectionReason || "",
        });

        // Mở modal chỉnh sửa
        setBlogModalVisible(true);
      } else {
        message.error("Không thể tải thông tin bài viết");
      }
    } catch (error) {
      message.error("Lỗi khi tải thông tin bài viết: " + error.message);
      console.error("Error fetching blog details:", error);
    } finally {
      setLoading(false);
    }
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
            <div className="blog-actions">
              {/* Thêm ô tìm kiếm */}
              <Input.Search
                placeholder="Tìm kiếm theo tên danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={(value) => setSearchQuery(value)}
                style={{ width: 300, marginRight: 16 }}
                allowClear
              />
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
          </div>

          {/* Hiển thị một thông báo về kết quả tìm kiếm */}
          {searchQuery.trim() && (
            <div style={{ marginBottom: 16 }}>
              <span>
                Kết quả tìm kiếm cho "{searchQuery}" trong
                {categoryFilter === "parent"
                  ? " Parent Categories"
                  : categoryFilter === "child"
                  ? " Child Categories"
                  : " All Categories"}
              </span>
              <Button
                type="link"
                onClick={() => setSearchQuery("")}
                style={{ marginLeft: 8 }}
              >
                Xóa tìm kiếm
              </Button>
            </div>
          )}

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
              <h2>Manage Blogs</h2>
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
              Add New Blog
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
                rules={[{ required: true, message: "Content is required" }]}
                className="ck-editor-container"
              >
                <CustomEditor />
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

              {/* Luôn hiển thị trường rejectionReason */}
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.status !== currentValues.status
                }
              >
                {({ getFieldValue }) => (
                  <Form.Item
                    name="rejectionReason"
                    label="Rejection Reason"
                    rules={[
                      {
                        required: getFieldValue("status") === "Rejected",
                        message:
                          "Rejection reason is required when status is Rejected",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder={
                        getFieldValue("status") === "Rejected"
                          ? "Please enter rejection reason (required)"
                          : "Rejection reason (optional)"
                      }
                    />
                  </Form.Item>
                )}
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
