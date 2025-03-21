import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Space,
  Form,
  Input,
  message,
  Typography,
  Tag,
  Tabs,
  Select,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import TextEditor from "../../../components/admin/Component_Sidebar/blog/textEditor";
import axios from "axios";
import "./DoctorBlog.css";
import blogApi from "../../../services/blogApi";
import blogCategoryApi from "../../../services/blogCategoryApi";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

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

const DoctorBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const email = localStorage.getItem("email");

      const response = await axios.get(
        "https://babyhaven-swp-a3f2frh5g4gtf4ee.southeastasia-01.azurewebsites.net/api/Blog"
      );

      if (response.data.status === 1) {
        const doctorBlogs = response.data.data.filter(
          (blog) => blog.authorId === userId || blog.email === email
        );

        setBlogs(
          doctorBlogs.map((blog) => ({
            ...blog,
            key: blog.blogId,
            // Chuyển đổi trạng thái từ chuỗi sang số cho phù hợp với hệ thống hiển thị
            status:
              blog.status === "Approved"
                ? 1
                : blog.status === "PendingApproval"
                ? 0
                : blog.status === "Draft"
                ? 3
                : blog.status === "Rejected"
                ? 2
                : 0,
          }))
        );
      }
    } catch (error) {
      message.error("Unable to load blog list");
      console.error("Error loading blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await blogCategoryApi.getAll();
      if (response.data.status === 1) {
        setCategories(response.data.data);
      }
    } catch (error) {
      message.error("Unable to load category list");
    }
  };

  const getTagsFromCategory = (categoryName) => {
    const selectedCategory = categories.find(
      (cat) => cat.categoryName === categoryName
    );
    if (!selectedCategory) return "";

    if (selectedCategory.parentCategoryId) {
      const parentCategory = categories.find(
        (cat) => cat.categoryId === selectedCategory.parentCategoryId
      );
      if (parentCategory) {
        return `${parentCategory.categoryName}, ${selectedCategory.categoryName}`;
      }
      return selectedCategory.categoryName;
    }
    return selectedCategory.categoryName;
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const email = localStorage.getItem("email");

      if (!userId || !email) {
        message.error("Please log in again");
        return;
      }

      // Nếu đang cập nhật blog (có blogId)
      if (values.blogId) {
        // Tìm blog cần cập nhật trong danh sách
        const blogToUpdate = blogs.find(
          (blog) => blog.blogId === values.blogId
        );

        // Kiểm tra trạng thái của blog
        if (blogToUpdate) {
          const status = blogToUpdate.status;
          const canUpdate =
            (typeof status === "string" &&
              (status === "Draft" || status === "PendingApproval")) ||
            (typeof status === "number" && (status === 3 || status === 0));

          if (!canUpdate) {
            message.error(
              "You cannot update blogs with Approved or Rejected status"
            );
            return;
          }
        }
      }

      // Lấy trạng thái từ form hoặc sử dụng trạng thái mặc định
      const status = values.status || "Draft";

      const blogData = {
        title: values.title,
        content: content,
        authorId: userId,
        email: email,
        categoryName: values.categoryName,
        imageBlog: values.imageBlog || "",
        tags: values.tags || "",
        referenceSources: values.referenceSources || "",
        status: status === "PendingApproval" ? "PendingApproval" : "Draft",
      };

      if (values.blogId) {
        // Đây là cập nhật blog đã tồn tại
        await blogApi.update(values.blogId, blogData);
        message.success("Blog updated successfully");
      } else {
        // Đây là tạo blog mới
        await blogApi.create(blogData);
        message.success("New blog created successfully");
      }

      form.resetFields();
      setContent("");
      fetchBlogs();
      setActiveTab("2");
    } catch (error) {
      message.error(
        values.blogId ? "Unable to update blog" : "Unable to save blog"
      );
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    try {
      // Tìm blog cần xóa trong danh sách
      const blogToDelete = blogs.find((blog) => blog.blogId === blogId);

      // Kiểm tra xem blog có tồn tại không
      if (!blogToDelete) {
        message.error("Blog not found");
        return;
      }

      // Kiểm tra trạng thái của blog
      const status = blogToDelete.status;
      const canDelete =
        (typeof status === "string" &&
          (status === "Draft" || status === "PendingApproval")) ||
        (typeof status === "number" && (status === 3 || status === 0));

      if (!canDelete) {
        message.error(
          "You cannot delete blogs with Approved or Rejected status"
        );
        return;
      }

      // Nếu trạng thái hợp lệ, tiến hành xóa
      const response = await axios.delete(
        `https://babyhaven-swp-a3f2frh5g4gtf4ee.southeastasia-01.azurewebsites.net/api/Blog/${blogId}`
      );

      if (response.data.status === 1) {
        message.success("Blog deleted successfully");
        fetchBlogs();
      } else {
        message.error(response.data.message || "Failed to delete blog");
      }
    } catch (error) {
      message.error("Unable to delete blog");
      console.error("Error when deleting blog:", error);
    }
  };

  const columns = [
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
        let color = "default";
        let text = "Undefined";

        if (typeof status === "string") {
          // Nếu status là chuỗi từ API
          if (status === "Approved") {
            color = "green";
            text = "Approved";
          } else if (status === "Draft") {
            color = "blue";
            text = "Draft";
          } else if (status === "PendingApproval") {
            color = "orange";
            text = "Pending Approval";
          } else if (status === "Rejected") {
            color = "red";
            text = "Rejected";
          }
        } else {
          // Nếu status là số từ hệ thống cũ
          const statusColors = {
            0: "orange",
            1: "green",
            2: "red",
            3: "blue",
          };
          const statusText = {
            0: "Pending Approval",
            1: "Approved",
            2: "Rejected",
            3: "Draft",
          };
          color = statusColors[status] || "default";
          text = statusText[status] || "Undefined";
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => {
        // Kiểm tra trạng thái của bài viết để quyết định hiển thị các nút action
        const canEditOrDelete =
          (typeof record.status === "string" &&
            (record.status === "Draft" ||
              record.status === "PendingApproval")) ||
          (typeof record.status === "number" &&
            (record.status === 3 || record.status === 0)); // 3 = Draft, 0 = PendingApproval

        return (
          <Space size="middle">
            {canEditOrDelete ? (
              <>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  className="DoctorRoleID2-doctor-blog__btn-primary"
                  onClick={() => {
                    setActiveTab("1");
                    form.setFieldsValue({
                      title: record.title,
                      categoryName: record.categoryName,
                      imageBlog: record.imageBlog,
                      tags: record.tags,
                      referenceSources: record.referenceSources || "",
                      blogId: record.blogId,
                    });
                    setContent(record.content);
                  }}
                >
                  Edit
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  className="DoctorRoleID2-doctor-blog__btn-dangerous"
                  onClick={() => handleDelete(record.blogId)}
                >
                  Delete
                </Button>
              </>
            ) : (
              <Tag color="gray">No Actions Available</Tag>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="DoctorRoleID2-doctor-blog-container">
      <Card bordered={false} className="DoctorRoleID2-doctor-blog-card">
        <Title level={3} className="DoctorRoleID2-doctor-blog-title">
          Medical Blog Management
        </Title>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="DoctorRoleID2-doctor-blog-tabs"
        >
          <TabPane tab="Write Blog" key="1">
            <div className="DoctorRoleID2-doctor-blog__write-blog-container">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="blog-form"
              >
                <Form.Item name="blogId" hidden>
                  <Input />
                </Form.Item>

                {/* Tiêu đề blog - Phần nổi bật */}
                <div className="DoctorRoleID2-doctor-blog__header-section">
                  <Form.Item
                    name="title"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your medical article title...",
                      },
                    ]}
                    className="blog-title-item"
                  >
                    <Input
                      placeholder="Enter your medical article title..."
                      className="DoctorRoleID2-doctor-blog__title-input"
                      size="large"
                      prefix={
                        <i
                          className="fas fa-heading"
                          style={{ color: "#0072ff", marginRight: "8px" }}
                        ></i>
                      }
                    />
                  </Form.Item>
                </div>

                <div className="DoctorRoleID2-doctor-blog__main-container">
                  {/* Phần bên trái: Category + Image */}
                  <div className="DoctorRoleID2-doctor-blog__left-column">
                    <div className="DoctorRoleID2-doctor-blog__section DoctorRoleID2-doctor-blog__category-section">
                      <h3 className="DoctorRoleID2-doctor-blog__section-title">
                        <i className="fas fa-info-circle"></i>
                        Basic Information
                      </h3>

                      <Form.Item
                        label="Category"
                        name="categoryName"
                        rules={[
                          {
                            required: true,
                            message: "Please select a category",
                          },
                        ]}
                        className="category-form-item"
                      >
                        <Select
                          placeholder="Select category..."
                          onChange={(value) => {
                            const tags = getTagsFromCategory(value);
                            form.setFieldsValue({ tags });
                          }}
                          className="DoctorRoleID2-doctor-blog__select"
                        >
                          {categories.map((category) => (
                            <Option
                              key={category.categoryId}
                              value={category.categoryName}
                            >
                              {category.categoryName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label="Featured Image"
                        name="imageBlog"
                        rules={[
                          {
                            required: true,
                            message: "Please enter image URL",
                          },
                        ]}
                        className="image-form-item"
                      >
                        <Input
                          placeholder="Enter article featured image URL (https://...)"
                          className="DoctorRoleID2-doctor-blog__input"
                          prefix={
                            <i
                              className="fas fa-image"
                              style={{ color: "#00b8ff" }}
                            ></i>
                          }
                        />
                      </Form.Item>

                      <Form.Item
                        label="Tags"
                        name="tags"
                        rules={[
                          { required: true, message: "Tags are auto-filled" },
                        ]}
                        className="tags-form-item"
                      >
                        <Input
                          placeholder="Tags"
                          className="DoctorRoleID2-doctor-blog__input"
                          disabled
                          style={{ backgroundColor: "#f5f5f5" }}
                        />
                      </Form.Item>

                      <Form.Item
                        label="Reference Sources"
                        name="referenceSources"
                        rules={[
                          {
                            required: true,
                            message: "Please enter reference sources",
                          },
                        ]}
                        className="reference-form-item"
                      >
                        <Input
                          placeholder="Enter reference sources..."
                          className="DoctorRoleID2-doctor-blog__input"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Publication Status"
                        name="status"
                        initialValue="Draft"
                        className="status-form-item"
                      >
                        <Select
                          placeholder="Select status"
                          className="DoctorRoleID2-doctor-blog__select"
                          dropdownStyle={{ borderRadius: "8px" }}
                        >
                          <Option value="Draft">
                            <span className="DoctorRoleID2-doctor-blog__status-option-draft">
                              <i className="fas fa-save"></i> Save as Draft
                            </span>
                          </Option>
                          <Option value="PendingApproval">
                            <span className="DoctorRoleID2-doctor-blog__status-option-pending">
                              <i className="fas fa-paper-plane"></i> Submit for
                              Approval
                            </span>
                          </Option>
                        </Select>
                      </Form.Item>
                    </div>
                  </div>

                  {/* Phần bên phải: Content Editor */}
                  <div className="DoctorRoleID2-doctor-blog__right-column">
                    <div className="DoctorRoleID2-doctor-blog__section DoctorRoleID2-doctor-blog__content-section">
                      <h3 className="DoctorRoleID2-doctor-blog__section-title">
                        <i className="fas fa-edit"></i>
                        Article Content
                      </h3>
                      <div className="DoctorRoleID2-doctor-blog__editor-wrapper">
                        <Form.Item
                          rules={[
                            {
                              required: true,
                              message: "Please enter content",
                            },
                          ]}
                        >
                          <CustomEditor
                            value={content}
                            onChange={(newContent) => setContent(newContent)}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="DoctorRoleID2-doctor-blog__action-buttons">
                  <Button
                    onClick={() => {
                      form.resetFields();
                      setContent("");
                    }}
                    className="DoctorRoleID2-doctor-blog__cancel-button"
                    icon={
                      <i
                        className="fas fa-times"
                        style={{ marginRight: "8px" }}
                      ></i>
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="DoctorRoleID2-doctor-blog__submit-button"
                    icon={
                      <i
                        className="fas fa-check"
                        style={{ marginRight: "8px" }}
                      ></i>
                    }
                  >
                    Save Article
                  </Button>
                </div>
              </Form>
            </div>
          </TabPane>

          <TabPane tab="Blog List" key="2">
            <Table
              columns={columns}
              dataSource={blogs}
              loading={loading}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} articles`,
              }}
              className="DoctorRoleID2-doctor-blog__table"
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default DoctorBlog;
