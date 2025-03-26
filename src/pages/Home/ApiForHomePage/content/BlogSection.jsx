import React, { useState, useEffect } from "react";
import blogCategoryApi from "../../../../services/blogCategoryApi";
import blogApi from "../../../../services/blogApi";
import "./BlogSection.css";
import { useNavigate } from "react-router-dom";

const BlogSection = ({ parentCategoryId }) => {
  const [parentCategories, setParentCategories] = useState([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [childCategories, setChildCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [autoLoaded, setAutoLoaded] = useState(false);
  const navigate = useNavigate();

  // Fetch tất cả danh mục cha
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const response = await blogCategoryApi.getAll();
        if (response?.data?.status === 1) {
          // Lọc ra danh mục cha (parentCategoryId === null)
          const parents = response.data.data.filter(
            (category) => category.parentCategoryId === null
          );
          setParentCategories(parents);

          // Xác định danh mục cha mặc định
          let defaultParent;
          if (parentCategoryId) {
            defaultParent = parents.find(
              (category) => category.categoryId === parentCategoryId
            );
          }

          // Nếu không tìm thấy danh mục đã chỉ định hoặc không có chỉ định, lấy danh mục đầu tiên
          if (!defaultParent && parents.length > 0) {
            defaultParent = parents[0];
          }

          setSelectedParentCategory(defaultParent);

          // Đánh dấu là đã tự động tải
          setAutoLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching parent categories:", error);
      }
    };
    fetchParentCategories();
  }, [parentCategoryId]);

  // Fetch danh mục con khi danh mục cha thay đổi
  useEffect(() => {
    const fetchChildCategories = async () => {
      if (!selectedParentCategory) return;

      try {
        const response = await blogCategoryApi.getAll();
        if (response?.data?.status === 1) {
          // Lọc ra danh mục con của danh mục cha đã chọn
          const children = response.data.data.filter(
            (category) =>
              category.parentCategoryId === selectedParentCategory.categoryId
          );
          setChildCategories(children);

          // Không reset selected category khi đã tự động tải
          if (!autoLoaded) {
            setSelectedCategory("all");
          }
        }
      } catch (error) {
        console.error("Error fetching child categories:", error);
      }
    };
    fetchChildCategories();
  }, [selectedParentCategory, autoLoaded]);

  // Fetch blogs dựa trên category được chọn
  useEffect(() => {
    const fetchBlogs = async () => {
      if (!selectedParentCategory) return;

      setLoading(true);
      try {
        let blogsData = [];

        if (selectedCategory === "all") {
          // Khi chọn "All", lấy tất cả bài viết của category cha
          const response = await blogApi.getByCategoryId(
            selectedParentCategory.categoryId
          );
          if (response?.data?.status === 1) {
            blogsData = response.data.data;
          }
        } else {
          // Khi chọn category con, sử dụng API để lấy thông tin blog của danh mục con
          const response = await blogCategoryApi.getById(selectedCategory);
          if (response?.data?.status === 1) {
            // Trích xuất danh sách blogs từ phản hồi API
            blogsData = response.data.data.blogs || [];
          }
        }

        // Sắp xếp theo thời gian và giới hạn 4 bài
        const sortedBlogs = blogsData
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 4);
        setBlogs(sortedBlogs);

        // Reset trạng thái autoLoaded sau khi đã tải
        if (autoLoaded) {
          setAutoLoaded(false);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [selectedCategory, selectedParentCategory, autoLoaded]);

  // Handler khi chọn danh mục cha
  const handleParentCategorySelect = (category) => {
    setSelectedParentCategory(category);
  };

  return (
    <div className="blog-section">
      {/* Bỏ phần này vì đã có 5 nút category cha ở trên đầu trang */}
      {/* <div className="blog-section-parent-categories">
        {parentCategories.map((category) => (
          <button
            key={category.categoryId}
            className={`blog-section-parent-category-btn ${
              selectedParentCategory?.categoryId === category.categoryId
                ? "active"
                : ""
            }`}
            onClick={() => handleParentCategorySelect(category)}
          >
            {category.categoryName}
          </button>
        ))}
      </div> */}

      {/* Vẫn giữ tiêu đề category cha đang chọn */}
      {selectedParentCategory && (
        <h2 className="section-topics">
          {selectedParentCategory.categoryName}
        </h2>
      )}

      {/* Giữ nguyên phần còn lại */}
      <div className="category-nav">
        <button
          className={`nav-item ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          All
        </button>
        {childCategories.map((category) => (
          <button
            key={category.categoryId}
            className={`nav-item ${
              selectedCategory === category.categoryId ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category.categoryId)}
          >
            {category.categoryName}
          </button>
        ))}
      </div>

      <div className="blog-cards">
        {loading ? (
          <div className="loading-indicator">
            <div className="loader"></div>
            <p>Đang tải bài viết...</p>
          </div>
        ) : blogs.length > 0 ? (
          blogs.map((blog) => (
            <div
              key={blog.blogId}
              className="blog-card"
              onClick={() => navigate(`/blog/${blog.blogId}`)}
            >
              <div className="blog-image">
                <img
                  src={blog.imageBlog || "/placeholder-image.jpg"}
                  alt={blog.title}
                  onError={(e) => {
                    console.log("Image error, using placeholder");
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
              </div>
              <div className="blog-content0-homepage">
                <div>
                  <h3 className="blog-title-homepage">
                    {blog.title || "Tiêu đề không có sẵn"}
                  </h3>
                  <p className="blog-description">
                    {blog.content
                      ? blog.content.replace(/<[^>]*>/g, "").substring(0, 80) +
                        "..."
                      : "Xem thêm chi tiết về bài viết này..."}
                  </p>
                </div>
                <div className="blog-metadata-homepage">
                  <div className="blog-author-info-homepage">
                    <p className="blog-author">
                      {blog.authorName ? blog.authorName : "Ẩn danh"}
                    </p>
                    <p className="blog-date">
                      {blog.updatedAt
                        ? new Date(blog.updatedAt).getTime() >
                          Date.now() - 86400000
                          ? `${Math.floor(
                              (Date.now() -
                                new Date(blog.updatedAt).getTime()) /
                                3600000
                            )} giờ trước`
                          : new Date(blog.updatedAt).toLocaleDateString("vi-VN")
                        : "2 giờ trước"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-blogs-message">
            <p>Không có bài viết nào trong danh mục này</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogSection;
