import React, { useState, useEffect } from "react";
import blogCategoryApi from "../../../../services/blogCategoryApi";
import blogApi from "../../../../services/blogApi";
import "./BlogSection.css";
import { useNavigate } from "react-router-dom";

const BlogSection = ({ parentCategoryId }) => {
  const [parentCategory, setParentCategory] = useState(null);
  const [childCategories, setChildCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch parent category info và child categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Lấy thông tin category cha
        const parentResponse = await blogCategoryApi.getById(parentCategoryId);
        if (parentResponse?.data?.status === 1) {
          setParentCategory(parentResponse.data.data);
        }

        // Lấy danh sách category con
        const childResponse = await blogCategoryApi.getParentCategories(
          parentCategoryId
        );
        if (childResponse?.data?.status === 1) {
          setChildCategories(childResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [parentCategoryId]);

  // Fetch blogs dựa trên category được chọn
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        let blogsData = [];

        if (selectedCategory === "all") {
          // Khi chọn "All", giữ nguyên cách lấy tất cả bài viết của category cha
          const response = await blogApi.getByCategoryId(parentCategoryId);
          if (response?.data?.status === 1) {
            blogsData = response.data.data;
          }
        } else {
          // Khi chọn category con, sử dụng API mới để lấy thông tin category và danh sách blog
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
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [selectedCategory, parentCategoryId]);

  return (
    <div className="blog-section">
      {parentCategory && (
        <h2 className="section-topics">{parentCategory.categoryName}</h2>
      )}

      {/* Navigation */}
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

      {/* Blog Cards */}
      <div className="blog-cards">
        {loading ? (
          <div className="loading-indicator">
            <div className="loader"></div>
            <p>Đang tải bài viết...</p>
          </div>
        ) : (
          blogs.map((blog) => {
            // Log để kiểm tra
            console.log("Blog image:", blog.imageBlog);

            return (
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
                        ? blog.content
                            .replace(/<[^>]*>/g, "")
                            .substring(0, 80) + "..."
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
                            : new Date(blog.updatedAt).toLocaleDateString(
                                "vi-VN"
                              )
                          : "2 giờ trước"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BlogSection;
