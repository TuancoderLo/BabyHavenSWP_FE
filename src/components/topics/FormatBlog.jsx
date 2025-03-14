import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../common/Header";
import HeaderGuest from "../commonGuest/HeaderGuest";
import Footer from "../common/Footer";
import api from "../../config/axios";
import "./FormatBlog.css";

function FormatBlog() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kiểm tra trạng thái đăng nhập
  const isLoggedIn = localStorage.getItem("token") !== null;

  useEffect(() => {
    // Log để debug
    console.log("FormatBlog mounted with blogId:", blogId);

    // Lấy blogId từ URL hoặc localStorage nếu không có trong URL
    const currentBlogId = blogId || localStorage.getItem("currentBlogId");

    if (currentBlogId) {
      console.log("Fetching blog with ID:", currentBlogId);
      fetchBlogDetails(currentBlogId);
    } else {
      setError("Không tìm thấy ID bài viết");
      setLoading(false);
    }
  }, [blogId]);

  const fetchBlogDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Calling API: Blog/${id}`);
      const response = await api.get(`Blog/${id}`);
      console.log("Blog API response:", response);

      // Kiểm tra cấu trúc response
      let blogData = null;
      if (response.data) {
        if (response.data.data) {
          // Nếu data nằm trong property 'data'
          blogData = response.data.data;
        } else {
          // Nếu data nằm trực tiếp trong response.data
          blogData = response.data;
        }
      }

      console.log("Processed blog data:", blogData);

      if (!blogData) {
        setError("Không tìm thấy bài viết này");
      } else {
        setBlog(blogData);
      }
    } catch (error) {
      console.error("Error fetching blog details:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
      });
      setError("Có lỗi xảy ra khi tải bài viết. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý tags
  const renderTags = (tags) => {
    if (!tags) return null;
    return tags.split(",").map((tag) => tag.trim());
  };

  // Hàm định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Hàm quay lại trang trước
  const handleGoBack = () => {
    navigate(-1); // Quay lại trang trước đó
  };

  return (
    <div className="blog-page">
      {isLoggedIn ? <Header /> : <HeaderGuest />}

      <main className="blog-content-container">
        <button onClick={handleGoBack} className="back-button">
          &larr; Quay lại
        </button>

        {loading ? (
          <div className="loading">Đang tải bài viết...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : blog ? (
          <article className="blog-detail">
            <header className="blog-header">
              <h1 className="blog-title">{blog.title}</h1>

              <div className="blog-metadata">
                <p className="blog-author">
                  {blog.authorName
                    ? `Tác giả: ${blog.authorName}`
                    : "Tác giả: Ẩn danh"}
                </p>
                <p className="blog-category">Danh mục: {blog.categoryName}</p>
                {blog.createdAt && (
                  <p className="blog-date">
                    Ngày đăng: {formatDate(blog.createdAt)}
                  </p>
                )}
              </div>

              <div className="blog-tags">
                {renderTags(blog.tags)?.map((tag, index) => (
                  <span key={index} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </header>

            {blog.imageBlog && (
              <div className="blog-featured-image">
                <img
                  src={blog.imageBlog}
                  alt={blog.title}
                  onError={(e) => {
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
              </div>
            )}

            <div className="blog-full-content">
              {/* Hiển thị nội dung blog */}
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
          </article>
        ) : (
          <div className="error">Không tìm thấy bài viết</div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default FormatBlog;
