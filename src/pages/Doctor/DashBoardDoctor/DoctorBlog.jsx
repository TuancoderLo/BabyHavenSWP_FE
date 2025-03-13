import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  message,
  Typography,
  Upload,
  Spin,
  Select,
  Tag,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import TextEditor from "../../../components/admin/Component_Sidebar/blog/textEditor";
import axios from "axios";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingBlog, setEditingBlog] = useState(null);
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem("email");
      const response = await axios.get(`https://localhost:7279/api/Blog`);
      console.log("Blog response:", response.data);
      if (response.data.status === 1) {
        const doctorBlogs = response.data.data.filter(
          (blog) => blog.email === email
        );
        setBlogs(doctorBlogs.map((blog) => ({ ...blog, key: blog.blogId })));
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      message.error("Không thể tải danh sách bài viết");
      setBlogs([]);
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

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await axios.get(
        `https://localhost:7279/api/BlogCategories/parent-categories/${categoryId}`
      );
      if (response.data.status === 1) {
        setSubCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching sub-categories:", error);
      setSubCategories([]);
    }
  };

  const getTagsFromCategory = (categoryId) => {
    const selectedCategory = categories.find(
      (cat) => cat.categoryId === categoryId
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

  const handleCategoryChange = async (value) => {
    setSelectedCategory(value);
    await fetchSubCategories(value);
    const tags = getTagsFromCategory(value);
    form.setFieldsValue({ tags });
  };

  const handleSubCategoryChange = (value, option) => {
    form.setFieldsValue({ categoryName: option.children });
    setSelectedCategoryName(option.children);
  };

  const handleSubmit = async (values) => {
    try {
      const email = localStorage.getItem("email");
      if (!email) {
        message.error("Vui lòng đăng nhập lại");
        return;
      }

      const blogData = {
        title: values.title,
        content: content,
        email: email,
        categoryName:
          categories.find((cat) => cat.categoryId === values.categoryId)
            ?.categoryName || "",
        imageBlog: values.imageBlog || "",
        tags: values.tags || "",
        referenceSources: values.referenceSources || "",
        status: 0,
      };

      console.log("Submitting blog data:", blogData);

      if (editingBlog) {
        await axios.put(
          `https://localhost:7279/api/Blog/${editingBlog.blogId}`,
          blogData
        );
        message.success("Cập nhật bài viết thành công");
      } else {
        await axios.post("https://localhost:7279/api/Blog", blogData);
        message.success("Tạo bài viết mới thành công");
      }

      setModalVisible(false);
      form.resetFields();
      setContent("");
      setSelectedCategory(null);
      setSelectedCategoryName("");
      setSubCategories([]);
      fetchBlogs();
    } catch (error) {
      console.error("Error submitting blog:", error);
      message.error(error.response?.data?.message || "Không thể lưu bài viết");
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setContent(blog.content);
    const categoryObj = categories.find(
      (cat) => cat.categoryName === blog.categoryName
    );
    if (categoryObj) {
      setSelectedCategory(categoryObj.categoryId);
      fetchSubCategories(categoryObj.categoryId);
    }

    form.setFieldsValue({
      title: blog.title,
      categoryId: categoryObj?.categoryId,
      imageBlog: blog.imageBlog,
      tags: blog.tags,
      referenceSources: blog.referenceSources,
    });
    setModalVisible(true);
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
          0: "orange", // Draft
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
            onClick={() => handleEdit(record)}
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

  return (
    <div className="blog-container" style={{ padding: "24px" }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <Title level={4}>Quản lý Blog</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBlog(null);
              form.resetFields();
              setContent("");
              setModalVisible(true);
            }}
          >
            Tạo bài viết mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={blogs}
          loading={loading}
          rowKey="blogId"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bài viết`,
          }}
        />

        <Modal
          title={editingBlog ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setContent("");
            setSelectedCategory(null);
            setSelectedCategoryName("");
            setSubCategories([]);
          }}
          footer={null}
          width={800}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            >
              <Input placeholder="Nhập tiêu đề bài viết" />
            </Form.Item>

            <Form.Item
              name="categoryId"
              label="Danh mục"
              rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
            >
              <Select
                placeholder="Chọn danh mục"
                onChange={handleCategoryChange}
                value={selectedCategory}
              >
                {categories.map((category) => (
                  <Option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="tags"
              label="Tags"
              rules={[
                {
                  required: true,
                  message: "Tags sẽ được tự động điền theo danh mục",
                },
              ]}
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              name="imageBlog"
              label="Ảnh blog"
              rules={[
                { required: true, message: "Vui lòng nhập đường dẫn ảnh" },
              ]}
            >
              <Input placeholder="Nhập đường dẫn ảnh" />
            </Form.Item>

            <Form.Item
              label="Nội dung"
              rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
            >
              <CustomEditor
                value={content}
                onChange={(newContent) => setContent(newContent)}
              />
            </Form.Item>

            <Form.Item name="referenceSources" label="Nguồn tham khảo">
              <TextArea rows={3} placeholder="Nhập nguồn tham khảo (nếu có)" />
            </Form.Item>

            <Form.Item style={{ marginTop: "50px" }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>Hủy</Button>
                <Button type="primary" htmlType="submit">
                  {editingBlog ? "Cập nhật" : "Tạo mới"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default DoctorBlog;
