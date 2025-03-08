import React, { useState, useEffect } from "react";
import blogCategoryApi from "../../../../services/blogCategoryApi";
import blogApi from "../../../../services/blogApi";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
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
        message.warning(response?.data?.message || "Không có dữ liệu");
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
        message.warning(response?.data?.message || "No blog data");
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
        return blogs.filter((blog) => blog.status === "Pending");
      case "draft":
        return blogs.filter((blog) => blog.status === "Draft");
      default:
        return blogs;
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
      message.error(`Operation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Blog Handlers
  const handleBlogSubmit = async (values) => {
    try {
      setLoading(true);
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
        authorName: "Admin",
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
            : "Blog created successfully"
        );
        setBlogModalVisible(false);
        blogForm.resetFields();
        await fetchBlogs();
      }
    } catch (error) {
      message.error(`Operation failed: ${error.message}`);
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
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa?"
            description="Bạn có chắc chắn muốn xóa mục này?"
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
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa?"
            description="Bạn có chắc chắn muốn xóa bài viết này?"
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
      message.error("Không thể xóa category: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chỉnh sửa blog
  const handleEditBlog = async (record) => {
    setEditingBlogId(record.blogId);
    blogForm.setFieldsValue({
      title: record.title,
      content: record.content,
      categoryId: record.categoryId,
      imageBlog: record.imageBlog,
      tags: record.tags,
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
      message.error("Không thể xóa bài viết: " + error.message);
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
          <Radio.Button value="categories">Quản lý Danh mục</Radio.Button>
          <Radio.Button value="blogs">Quản lý Bài viết</Radio.Button>
        </Radio.Group>
      </div>

      {activeTab === "categories" ? (
        <>
          <div className="blog-section-header">
            <div className="blog-title-section">
              <h2>Quản lý danh mục</h2>
              <Radio.Group
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="blog-filters"
              >
                <Radio.Button value="all">Tất cả</Radio.Button>
                <Radio.Button value="parent">Danh mục cha</Radio.Button>
                <Radio.Button value="child">Danh mục con</Radio.Button>
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
              Thêm danh mục mới
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
              showTotal: (total) => `Tổng ${total} danh mục`,
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
              <h2>Quản lý bài viết</h2>
              <Radio.Group
                value={blogFilter}
                onChange={(e) => setBlogFilter(e.target.value)}
                className="blog-filters"
              >
                <Radio.Button value="all">Tất cả</Radio.Button>
                <Radio.Button value="approved-rejected">
                  Đã duyệt/Từ chối
                </Radio.Button>
                <Radio.Button value="pending">Chờ duyệt</Radio.Button>
                <Radio.Button value="draft">Bản nháp</Radio.Button>
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
              Thêm bài viết mới
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
              showTotal: (total) => `Tổng ${total} bài viết`,
            }}
          />

          <Modal
            title={editingBlogId ? "Sửa bài viết" : "Thêm bài viết mới"}
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
            >
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
                <CKEditor
                  editor={ClassicEditor}
                  data={blogForm.getFieldValue("content") || ""}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    blogForm.setFieldsValue({ content: data });
                  }}
                />
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
                <Input placeholder="Nhập tags, phân cách bằng dấu phẩy" />
              </Form.Item>

              <Form.Item name="referenceSources" label="Nguồn tham khảo">
                <Input placeholder="Nhập nguồn tham khảo" />
              </Form.Item>

              <Form.Item name="status" label="Trạng thái" initialValue="Draft">
                <Select>
                  <Select.Option value="Draft">Bản nháp</Select.Option>
                  <Select.Option value="Pending">Chờ duyệt</Select.Option>
                  <Select.Option value="Approved">Đã duyệt</Select.Option>
                  <Select.Option value="Rejected">Từ chối</Select.Option>
                </Select>
              </Form.Item>

              <div className="blog-form-footer">
                <Button onClick={() => setBlogModalVisible(false)}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingBlogId ? "Cập nhật" : "Thêm mới"}
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
