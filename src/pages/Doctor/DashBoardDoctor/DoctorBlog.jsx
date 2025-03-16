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
      const email = localStorage.getItem("email");
      const response = await axios.get(`https://localhost:7279/api/Blog`);
      if (response.data.status === 1) {
        const doctorBlogs = response.data.data.filter(
          (blog) => blog.email === email
        );
        setBlogs(doctorBlogs.map((blog) => ({ ...blog, key: blog.blogId })));
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      message.error("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://localhost:7279/api/BlogCategories"
      );
      if (response.data.status === 1) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Không thể tải danh sách danh mục");
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
      const email = localStorage.getItem("email");
      if (!email) {
        message.error("Vui lòng đăng nhập lại");
        return;
      }

      const blogData = {
        title: values.title,
        content: content,
        email: email,
        categoryName: values.categoryName,
        imageBlog: values.imageBlog || "",
        tags: values.tags || "",
        referenceSources: values.referenceSources || "",
        status: 0, // Pending approval
      };

      await axios.post("https://localhost:7279/api/Blog", blogData);
      message.success("Tạo bài viết mới thành công");
      form.resetFields();
      setContent("");
      fetchBlogs();
      setActiveTab("2"); // Chuyển sang tab danh sách sau khi tạo thành công
    } catch (error) {
      console.error("Error submitting blog:", error);
      message.error("Không thể lưu bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    try {
      await axios.delete(`https://localhost:7279/api/Blog/${blogId}`);
      message.success("Xóa bài viết thành công");
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      message.error("Không thể xóa bài viết");
    }
  };

  const columns = [
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
          0: "orange", // Pending
          1: "green", // Approved
          2: "red", // Rejected
        };
        const statusText = {
          0: "Chờ duyệt",
          1: "Đã duyệt",
          2: "Từ chối",
        };
        return <Tag color={statusColors[status]}>{statusText[status]}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setActiveTab("1");
              form.setFieldsValue({
                title: record.title,
                categoryName: record.categoryName,
                imageBlog: record.imageBlog,
                tags: record.tags,
                referenceSources: record.referenceSources,
              });
              setContent(record.content);
            }}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.blogId)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="blog-container">
      <Card bordered={false}>
        <Title level={4} style={{ marginBottom: 24 }}>
          Quản lý Blog
        </Title>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Viết Blog" key="1">
            <div className="write-blog-container">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="blog-form"
              >
                <div className="input-row">
                  <Form.Item
                    name="title"
                    rules={[
                      { required: true, message: "Vui lòng nhập tiêu đề" },
                    ]}
                    className="input-item"
                  >
                    <Input placeholder="Title" className="blog-input" />
                  </Form.Item>

                  <Form.Item
                    name="tags"
                    rules={[
                      { required: true, message: "Tags sẽ được tự động điền" },
                    ]}
                    className="input-item"
                  >
                    <Input
                      placeholder="Tags"
                      className="blog-input"
                      disabled
                      style={{ backgroundColor: "#f5f5f5" }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="referenceSources"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập nguồn tham khảo",
                      },
                    ]}
                    className="input-item"
                  >
                    <Input
                      placeholder="Reference source"
                      className="blog-input"
                    />
                  </Form.Item>

                  <Form.Item name="status" className="input-item">
                    <Input
                      placeholder="Status"
                      className="blog-input"
                      disabled
                      value="Chờ duyệt"
                      style={{ backgroundColor: "#f5f5f5" }}
                    />
                  </Form.Item>
                </div>

                <div className="category-section">
                  <Form.Item
                    name="categoryName"
                    rules={[
                      { required: true, message: "Vui lòng chọn danh mục" },
                    ]}
                    className="category-item"
                  >
                    <Select
                      placeholder="Chọn danh mục"
                      onChange={(value) => {
                        const tags = getTagsFromCategory(value);
                        form.setFieldsValue({ tags });
                      }}
                      className="category-select"
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
                    name="imageBlog"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập đường dẫn ảnh",
                      },
                    ]}
                    className="image-item"
                  >
                    <Input placeholder="Image URL" className="blog-input" />
                  </Form.Item>
                </div>

                <div className="content-section">
                  <div className="content-header">
                    <h3>Nội dung bài viết</h3>
                  </div>
                  <div className="content-body">
                    <Form.Item
                      rules={[
                        { required: true, message: "Vui lòng nhập nội dung" },
                      ]}
                    >
                      <CustomEditor
                        value={content}
                        onChange={(newContent) => setContent(newContent)}
                      />
                    </Form.Item>
                  </div>
                </div>

                <div className="submit-button">
                  <Button type="primary" htmlType="submit" size="large">
                    Confirm
                  </Button>
                </div>
              </Form>
            </div>
          </TabPane>

          <TabPane tab="Danh sách Blog" key="2">
            <Table
              columns={columns}
              dataSource={blogs}
              loading={loading}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} bài viết`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default DoctorBlog;
