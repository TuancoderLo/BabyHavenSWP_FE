import React, { useState, useEffect } from "react";
import blogCategoryApi from "../../services/blogCategoryApi";
import blogApi from "../../services/blogApi";
import "./BlogSection.css";

const BlogSection = ({ parentCategoryId }) => {
  const [parentCategory, setParentCategory] = useState(null);
  const [childCategories, setChildCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

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
        let response;
        if (selectedCategory === "all") {
          // Khi chọn "All", lấy tất cả bài viết của category cha (bao gồm cả bài viết của category con)
          response = await blogApi.getByCategoryId(parentCategoryId);
        } else {
          // Khi chọn category con, chỉ lấy bài viết của category đó
          response = await blogApi.getByCategoryId(selectedCategory);
        }

        if (response?.data?.status === 1) {
          // Sắp xếp theo thời gian và giới hạn 4 bài
          const sortedBlogs = response.data.data
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 4);
          setBlogs(sortedBlogs);
        }
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
        <h2 className="section-title">{parentCategory.categoryName}</h2>
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
          <div>Loading...</div>
        ) : (
          blogs.map((blog) => (
            <div key={blog.blogId} className="blog-card">
              <div className="blog-image">
                <img
                  src={blog.imageBlog || "/placeholder-image.jpg"}
                  alt={blog.title}
                  onError={(e) => {
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
              </div>
              <div className="blog-content">
                <h3 className="blog-title">{blog.title}</h3>
                <div className="blog-metadata">
                  <p className="blog-author">
                    {blog.authorName
                      ? `Tác giả: ${blog.authorName}`
                      : "Tác giả: Ẩn danh"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BlogSection;
