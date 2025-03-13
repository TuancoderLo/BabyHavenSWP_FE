import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/common/Header";
import HeaderGuest from "../components/commonGuest/HeaderGuest";
import Footer from "../components/common/Footer";
import api from "../config/axios";
import "./CategoryPage.css";

function CategoryPage() {
  const { categoryId } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsPerPage] = useState(6);

  // Kiểm tra trạng thái đăng nhập
  const isLoggedIn = localStorage.getItem("token") !== null;

  useEffect(() => {
    if (categoryId) {
      console.log("Loading category:", categoryId);
      fetchCategoryDetails();
      fetchBlogsByCategory();
    }
  }, [categoryId]);

  const fetchCategoryDetails = async () => {
    try {
      const response = await api.get(`BlogCategories/${categoryId}`);
      console.log("Category details:", response.data);
      if (response.data) {
        setCategoryName(response.data.categoryName || "");
      }
    } catch (error) {
      console.error("Error fetching category details:", error);
      setCategoryName("");
    }
  };

  const fetchBlogsByCategory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`Blog/blogs/${categoryId}`);
      console.log("Raw API Response:", response);
      console.log("Response data structure:", {
        hasData: !!response.data,
        type: typeof response.data,
        isArray: Array.isArray(response.data),
        data: response.data,
      });

      // Kiểm tra cấu trúc response
      let blogsData = [];
      if (response.data) {
        if (response.data.data) {
          // Nếu data nằm trong property 'data'
          blogsData = Array.isArray(response.data.data)
            ? response.data.data
            : [];
        } else {
          // Nếu data nằm trực tiếp trong response.data
          blogsData = Array.isArray(response.data) ? response.data : [];
        }
      }

      console.log("Processed blogs data:", blogsData);

      if (blogsData.length === 0) {
        setError("Không có bài viết nào trong danh mục này");
      }

      setBlogs(blogsData);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
      });
      setError("Có lỗi xảy ra khi tải bài viết. Vui lòng thử lại sau.");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentBlogs = () => {
    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    return Array.isArray(blogs)
      ? blogs.slice(indexOfFirstBlog, indexOfLastBlog)
      : [];
  };

  const totalPages = Math.ceil(
    (Array.isArray(blogs) ? blogs.length : 0) / blogsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  // Hàm xử lý tags
  const renderTags = (tags) => {
    if (!tags) return null;
    return tags.split(",").map((tag) => tag.trim());
  };

  return (
    <div className="category-page">
      {isLoggedIn ? <Header /> : <HeaderGuest />}

      <main className="category-content">
        {categoryName && (
          <h1 className="category-title">Danh mục: {categoryName}</h1>
        )}

        {loading ? (
          <div className="loading">Đang tải bài viết...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="blogs-container">
              {getCurrentBlogs().map((blog) => (
                <div key={blog.title} className="blog-card">
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
                    <h2 className="blog-title">{blog.title}</h2>

                    <div className="blog-metadata">
                      <p className="blog-author">
                        {blog.authorName
                          ? `Tác giả: ${blog.authorName}`
                          : "Tác giả: Ẩn danh"}
                      </p>
                      <p className="blog-category">
                        Danh mục: {blog.categoryName}
                      </p>
                    </div>

                    <div className="blog-tags">
                      {renderTags(blog.tags)?.map((tag, index) => (
                        <span key={index} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <p className="blog-excerpt">
                      {blog.content?.length > 200
                        ? `${blog.content.substring(0, 200)}...`
                        : blog.content}
                    </p>

                    {blog.status === "Approved" && (
                      <button className="read-more-btn">Đọc thêm</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Trước
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`pagination-btn ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default CategoryPage;
