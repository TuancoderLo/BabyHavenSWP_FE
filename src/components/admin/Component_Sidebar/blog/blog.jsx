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

function Blog() {
  // States quản lý dữ liệu chính

  const [categories, setCategories] = useState([]);
  // Mục đích: Lưu trữ thông tin các category cha để dùng trong dropdown select

  const [parentCategories, setParentCategories] = useState({});
  // Mục đích: Lưu trữ tên của các category cha để hiển thị trong cột Parent Category

  const [isModalVisible, setIsModalVisible] = useState(false);
  // Mục đích: Điều khiển việc hiển thị/ẩn modal form

  const [loading, setLoading] = useState(false);
  // Mục đích: Quản lý trạng thái loading khi gọi API, hiển thị loading spinner

  const [form] = Form.useForm();
  // Mục đích: Quản lý form của Ant Design, dùng để control form values
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("categories");
  const [blogs, setBlogs] = useState([]);
  const [blogModalVisible, setBlogModalVisible] = useState(false);
  const [blogForm] = Form.useForm();
  const [editingBlogId, setEditingBlogId] = useState(null);
  // Mục đích: Lưu ID của category đang được edit, null khi tạo mới
  // Dùng để phân biệt giữa thao tác create và update

  const [parentNames, setParentNames] = useState({});

  // Thêm useEffect để debug categories
  useEffect(() => {
    console.log("Categories State:", categories);
  }, [categories]);

  // Fetch danh sách category
  const fetchCategories = async () => {
    // Mục đích: Lấy danh sách categories từ API và cập nhật vào state
    // Được gọi: Khi component mount và sau mỗi lần create/update/delete
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

        // Fetch parent names sau khi có categories mới
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

  // Fetch danh sách parent categories
  const fetchParentCategories = async () => {
    // Mục đích: Lấy danh sách category cha để dùng trong dropdown select
    // Được gọi: Cùng với fetchCategories
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
      console.log("Form values:", values);

      const submitData = {
        categoryName: values.categoryName.trim(),
        description: values.description?.trim() || "",
        parentCategoryId: values.parentCategoryId || null,
        isActive: values.isActive === undefined ? true : values.isActive,
      };

      console.log("Data to submit:", submitData);

      let response;
      if (editingId) {
        // Nếu đang edit (có editingId) thì gọi API update
        response = await blogCategoryApi.update(editingId, submitData);
        console.log("Update response:", response);
      } else {
        // Nếu không có editingId thì gọi API create
        response = await blogCategoryApi.create(submitData);
        console.log("Create response:", response);
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
      } else {
        throw new Error(response?.data?.message || "Operation failed");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      message.error(`Operation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa category
  const handleDelete = async (id) => {
    // Mục đích: Xóa một category
    // Được gọi: Khi confirm xóa trong Popconfirm
    // Flow:
    // 1. Gọi API delete
    // 2. Fetch lại data mới
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

      console.log("Blog data to submit:", submitData);

      let response;
      if (editingBlogId) {
        response = await blogApi.update(editingBlogId, submitData);
        console.log("Update blog response:", response);
      } else {
        response = await blogApi.create(submitData);
        console.log("Create blog response:", response);
      }

      if (response?.data?.status === 1) {
        message.success(
          editingBlogId
            ? "Blog updated successfully"
            : "Blog created successfully"
        );
        setBlogModalVisible(false);
        blogForm.resetFields();
        setEditingBlogId(null);
        await fetchBlogs();
      } else {
        throw new Error(response?.data?.message || "Operation failed");
      }
    } catch (error) {
      console.error("Blog Submit Error:", error);
      message.error(`Operation failed: ${error.message}`);
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

  const handleEdit = (record) => {
    // Mục đích: Chuẩn bị form để edit category
    // Được gọi: Khi click nút modify
    // Flow:
    // 1. Set editingId = categoryId của record
    // 2. Fill form với dữ liệu của record
    // 3. Hiển thị modal
    console.log("Editing record:", record); // Thêm log để debug

    setEditingId(record.categoryId);
    form.setFieldsValue({
      categoryName: record.categoryName,
      description: record.description || "",
      parentCategoryId: record.parentCategoryId || null,
      isActive: record.isActive,
    });
    setIsModalVisible(true);
  };

  // Thêm hàm xử lý parent category
  const getParentCategoryDisplay = async (record) => {
    // Mục đích: Xử lý hiển thị thông tin category cha trong table
    // Được gọi: Trong render của cột Parent Category
    // Flow:
    // 1. Kiểm tra nếu là category cha -> hiển thị tag "Parent Category"
    // 2. Nếu là category con -> hiển thị tên của category cha
    console.log("=== Debug Parent Category Logic ===");
    console.log("Current record:", record);

    if (!record) return "N/A";

    // Nếu là category cha (parentCategoryId === null)
    if (record.parentCategoryId === null) {
      return <Tag color="green">Parent Category</Tag>;
    }

    try {
      // Lấy thông tin category cha bằng cách gọi API với parentCategoryId
      const parentResponse = await blogCategoryApi.getById(
        record.parentCategoryId
      );
      console.log(
        `Getting parent info for ID ${record.parentCategoryId}:`,
        parentResponse.data
      );

      if (parentResponse?.data?.status === 1) {
        const parentData = parentResponse.data.data;
        return <span>{parentData.categoryName}</span>;
      }
    } catch (error) {
      console.error(
        `Error fetching parent category for ID ${record.parentCategoryId}:`,
        error
      );
    }

    return "N/A";
  };

  // Tách logic fetch parent names thành function riêng
  const fetchParentNames = async (categoriesData) => {
    // Mục đích: Lấy tên của các category cha để hiển thị trong table
    // Được gọi: Sau khi fetchCategories thành công
    const newParentNames = {};
    for (const category of categoriesData) {
      if (category.parentCategoryId !== null) {
        try {
          const response = await blogCategoryApi.getById(
            category.parentCategoryId
          );
          if (response?.data?.status === 1) {
            newParentNames[category.categoryId] =
              response.data.data.categoryName;
          }
        } catch (error) {
          console.error(
            `Error fetching parent name for category ${category.categoryId}:`,
            error
          );
        }
      }
    }
    setParentNames(newParentNames);
  };

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

        // Lấy parent name từ state
        const parentName = parentNames[record.categoryId];
        return <span>{parentName || "Loading..."}</span>;
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
              handleEdit(record);
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

  const handleCancel = () => {
    // Mục đích: Xử lý khi đóng modal
    // Được gọi: Khi click Cancel hoặc nút X trên modal
    // Flow:
    // 1. Reset form
    // 2. Reset editingId
    // 3. Đóng modal
    form.resetFields();
    setEditingId(null);
    setIsModalVisible(false);
  };

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
            onChange={(pagination, filters, sorter) => {
              console.log("Table data hiện tại:", categories);
              console.log("Pagination:", pagination);
              console.log("Filters:", filters);
              console.log("Sorter:", sorter);
            }}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} categories`,
            }}
          />

          <Modal
            title={editingId ? "Edit Category" : "Add New Category"}
            open={isModalVisible}
            onCancel={handleCancel}
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
                  { required: true, message: "Please enter category name" },
                  {
                    max: 100,
                    message: "Category name cannot exceed 100 characters",
                  },
                ]}
              >
                <Input placeholder="Enter category name" />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <Input.TextArea
                  rows={4}
                  placeholder="Enter description (optional)"
                />
              </Form.Item>

              <Form.Item name="parentCategoryId" label="Parent Category">
                <Select
                  allowClear
                  placeholder="Select parent category (optional)"
                >
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
                  <Button onClick={handleCancel}>Cancel</Button>
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
                <CKEditor
                  editor={ClassicEditor}
                  config={{
                    licenseKey:
                      "eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NDE5OTY3OTksImp0aSI6IjI2Yzc2ZmYwLTA1M2EtNGFiYi05MzE1LTJkMTJmOGI1MDEzYyIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6ImI3MTUxOGY4In0.vICfmtINjCekKGTm_NVhjNHnL3-r5jROjdzpHuhYSKCBXc5nA_-xPV7WeViN36BggwgnprQ-EIFANTbAbTOP4Q",
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "outdent",
                      "indent",
                      "|",
                      "blockQuote",
                      "insertTable",
                      "mediaEmbed",
                      "undo",
                      "redo",
                    ],
                  }}
                  data={form.getFieldValue("content") || ""}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    form.setFieldsValue({ content: data });
                  }}
                />
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
