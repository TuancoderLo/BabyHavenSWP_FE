import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../common/Header";
import HeaderGuest from "../commonGuest/HeaderGuest";
import Footer from "../common/Footer";
import api from "../../config/axios";
import "./FormatBlog.css";
// Import ảnh mặc định từ public thay vì assets
// import avatar_LOGO from "../../assets/avatar_LOGO.jpg";

// Sử dụng URL ảnh từ nguồn đáng tin cậy thay vì file local
const DEFAULT_AVATAR =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
const DEFAULT_IMAGE =
  "https://cdn.pixabay.com/photo/2017/02/10/19/11/placeholder-2055727_1280.jpg";

function FormatBlog() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
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

        // Sau khi có dữ liệu blog, lấy các bài viết liên quan
        if (blogData.categoryId) {
          fetchRelatedBlogs(blogData.categoryId, id);
        }
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

  // Lấy các bài viết liên quan từ cùng danh mục
  const fetchRelatedBlogs = async (categoryId, currentBlogId) => {
    try {
      console.log(`Fetching related blogs for category: ${categoryId}`);
      const response = await api.get(`Blog/blogs/${categoryId}`);
      console.log("Related blogs API response:", response);

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

      console.log("All blogs in category:", blogsData);

      // Lọc bỏ bài viết hiện tại và giới hạn còn 8 bài
      const filteredBlogs = blogsData
        .filter((blog) => {
          // Chuyển đổi sang cùng kiểu dữ liệu để so sánh
          const blogIdNum = parseInt(blog.blogId);
          const currentIdNum = parseInt(currentBlogId);

          console.log(
            `Comparing blog ID ${blogIdNum} with current ID ${currentIdNum}`
          );

          return blogIdNum !== currentIdNum && blog.status === "Approved";
        })
        .slice(0, 8);

      console.log("Filtered related blogs:", filteredBlogs);
      setRelatedBlogs(filteredBlogs);
    } catch (error) {
      console.error("Error fetching related blogs:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
      });
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

  // Hàm chuyển hướng đến bài viết khác
  const handleReadMore = (blog) => {
    const blogId = blog.blogId || blog.id;
    console.log("Navigating to related blog:", blog);
    console.log("Using blog ID:", blogId);

    // Lưu blogId vào localStorage
    localStorage.setItem("currentBlogId", blogId);

    // Chuyển hướng đến trang chi tiết blog
    navigate(`/blog/${blogId}`);

    // Cuộn lên đầu trang
    window.scrollTo(0, 0);
  };

  return (
    <div className="blog-page">
      {isLoggedIn ? <Header /> : <HeaderGuest />}

      <div className="blog-navigation">
        <div className="blog-navigation-container">
          <button onClick={handleGoBack} className="back-button">
            &larr; Quay lại
          </button>
          <div className="breadcrumbs">
            <span>Trang chủ</span> &gt;
            <span>{blog?.categoryName || "Danh mục"}</span> &gt;
            <span className="current-page">{blog?.title || "Bài viết"}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading">Đang tải bài viết...</div>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error">{error}</div>
        </div>
      ) : blog ? (
        <main className="blog-content-container">
          <div className="blog-grid-layout">
            {/* Nội dung bài viết chính - div6 */}
            <div className="blog-main-content">
              <h1 className="blog-title">{blog.title}</h1>

              <div className="blog-metadata">
                <span className="blog-date">
                  {formatDate(blog.createdAt || blog.createdDate)}
                </span>
                <span className="blog-category">{blog.categoryName}</span>
              </div>

              {blog.imageBlog && (
                <div className="blog-featured-image">
                  <img
                    src={blog.imageBlog}
                    alt={blog.title}
                    onError={(e) => {
                      console.log("Sử dụng ảnh mặc định cho bài viết");
                      e.target.onerror = null;
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />
                </div>
              )}

              <div className="blog-content">
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              </div>

              <div className="blog-tags">
                {renderTags(blog.tags)?.map((tag, index) => (
                  <span key={index} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Thông tin tác giả - div7 */}
            <div className="blog-author-card">
              <div className="author-image">
                {/* Kiểm tra URL ảnh trước khi hiển thị */}
                {(() => {
                  // Kiểm tra xem URL ảnh có hợp lệ không
                  const authorImageUrl = blog.authorImage || blog.imageProfile;
                  const isValidUrl =
                    authorImageUrl &&
                    (authorImageUrl.startsWith("http://") ||
                      authorImageUrl.startsWith("https://"));

                  return (
                    <img
                      src={isValidUrl ? authorImageUrl : DEFAULT_AVATAR}
                      alt={blog.authorName || "Tác giả"}
                      onError={(e) => {
                        console.log("Sử dụng ảnh mặc định cho tác giả");
                        e.target.onerror = null;
                        e.target.src = DEFAULT_AVATAR;
                      }}
                    />
                  );
                })()}
              </div>
              <h3 className="author-name">
                {blog.authorName || "Tác giả ẩn danh"}
              </h3>
              <p className="author-bio">
                {blog.authorBio ||
                  "Tác giả của bài viết này chưa cập nhật thông tin giới thiệu."}
              </p>
              <div className="author-specialization">
                <p>
                  Chuyên ngành: {blog.authorSpecialization || "Chưa cập nhật"}
                </p>
              </div>
              <button className="contact-author-btn">Liên hệ ngay</button>
            </div>

            {/* Các bài viết liên quan - div8-15 */}
            {relatedBlogs.length > 0 ? (
              relatedBlogs.map((relatedBlog, index) => (
                <div
                  key={relatedBlog.blogId || relatedBlog.id || index}
                  className={`related-blog-card related-blog-${index + 1}`}
                  onClick={() => handleReadMore(relatedBlog)}
                >
                  <div className="related-blog-image">
                    <img
                      src={relatedBlog.imageBlog || DEFAULT_IMAGE}
                      alt={relatedBlog.title}
                      onError={(e) => {
                        console.log(
                          "Sử dụng ảnh mặc định cho bài viết liên quan"
                        );
                        e.target.onerror = null;
                        e.target.src = DEFAULT_IMAGE;
                      }}
                    />
                  </div>
                  <div className="related-blog-content">
                    <h3 className="related-blog-title">{relatedBlog.title}</h3>
                    <p className="related-blog-author">
                      {relatedBlog.authorName || "Tác giả ẩn danh"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-related-blogs">
                <p>Không có bài viết liên quan</p>
              </div>
            )}
          </div>
        </main>
      ) : (
        <div className="error-container">
          <div className="error">Không tìm thấy bài viết</div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default FormatBlog;
