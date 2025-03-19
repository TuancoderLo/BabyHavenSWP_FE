import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import HeaderGuest from "../components/commonGuest/HeaderGuest";
import Footer from "../components/common/Footer";
import api from "../config/axios";
import "./CategoryPage.css";
import parse from "html-react-parser";

function CategoryPage() {
  const { categoryId } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsPerPage] = useState(6);
  const navigate = useNavigate();

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
        setError("Category is empty");
      }

      setBlogs(blogsData);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
      });
      setError("Error fetching blogs");
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

  // Thêm hàm để lọc bỏ thẻ HTML
  const stripHtmlTags = (html) => {
    if (!html) return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  // Phương pháp 2: Sử dụng thư viện html-react-parser
  const renderHtmlContent = (html) => {
    if (!html) return "";
    // Chuyển đổi HTML thành các phần tử React
    return parse(html);
  };

  // Hàm xử lý khi nhấp vào "Đọc thêm"
  const handleReadMore = (blog) => {
    const blogId = blog.blogId || blog.id;
    console.log("Handling read more click for blog:", blog);
    console.log("Navigating to blog with ID:", blogId);

    // Lưu blogId vào localStorage
    localStorage.setItem("currentBlogId", blogId);

    // Chuyển hướng theo cách thủ công
    navigate(`/blog/${blogId}`);
  };

  return (
    <div className="category-page">
      {isLoggedIn ? <Header /> : <HeaderGuest />}

      <main className="category-content">
        {categoryName && (
          <h1 className="category-title">Category: {categoryName}</h1>
        )}

        {loading ? (
          <div className="loading">Loading blogs...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="blogs-container">
              {getCurrentBlogs().map((blog) => (
                <div
                  key={blog.blogId || blog.id || blog.title}
                  className="blog-card"
                  onClick={() => handleReadMore(blog)}
                >
                  <div className="blog-image">
                    <img
                      src={blog.imageBlog || "/placeholder-image.jpg"}
                      alt={blog.title}
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                    <div className="blog-category-label">
                      {blog.categoryName}
                    </div>
                  </div>

                  <div className="blog-content">
                    <h2 className="blog-title">{blog.title}</h2>

                    <div className="blog-metadata">
                      {blog.status === "New" && (
                        <span className="blog-tag-highlight tag-new">NEW</span>
                      )}
                      <span className="blog-tag-highlight">
                        {blog.categoryName}
                      </span>
                    </div>

                    {/* Hiển thị phần tóm tắt bài viết ngắn gọn hơn */}
                    <p className="blog-excerpt">
                      {blog.content
                        ? stripHtmlTags(blog.content).length > 80
                          ? `${stripHtmlTags(blog.content).substring(0, 80)}...`
                          : stripHtmlTags(blog.content)
                        : ""}
                    </p>

                    <div className="blog-info">
                      <div className="blog-author-info">
                        <i className="fas fa-user"></i>
                        {blog.authorName || "Unknown"}
                      </div>
                      <div className="blog-date-info">
                        <i className="far fa-calendar-alt"></i>
                        {blog.createdAt
                          ? new Date(blog.createdAt).toLocaleDateString()
                          : ""}
                      </div>
                    </div>

                    {/* Thêm nút "Đọc thêm" */}
                    <div className="blog-read-more">
                      <button
                        className="read-more-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReadMore(blog);
                        }}
                      >
                        Đọc thêm
                      </button>
                    </div>
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
                  Next
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
