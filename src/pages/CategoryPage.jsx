import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import api from "../config/axios";
import "./CategoryPage.css";

function CategoryPage() {
  const { categoryId } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsPerPage] = useState(5); // Số blogs mỗi trang

  useEffect(() => {
    fetchBlogsByCategory();
  }, [categoryId]);

  const fetchBlogsByCategory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`Blog/blogs/${categoryId}`);
      setBlogs(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError("Không thể tải bài viết. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Tính toán blogs cho trang hiện tại
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  // Xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Cuộn lên đầu trang khi chuyển trang
  };

  return (
    <div className="category-page">
      <Header />

      <main className="category-content">
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="blogs-container">
              {currentBlogs.map((blog) => (
                <div key={blog.blogId} className="blog-card">
                  <div className="blog-image">
                    <img
                      src={blog.imageBlog || "/images/placeholder.jpg"}
                      alt={blog.title}
                      onError={(e) => {
                        e.target.src = "/images/placeholder.jpg";
                      }}
                    />
                  </div>
                  <div className="blog-content">
                    <h2 className="blog-title">{blog.title}</h2>
                    <p className="blog-author">
                      {blog.authorName
                        ? `Tác giả: ${blog.authorName}`
                        : "Tác giả: Ẩn danh"}
                    </p>
                    <p className="blog-category">
                      Danh mục: {blog.categoryName}
                    </p>
                    <p className="blog-excerpt">{blog.content}</p>
                    {blog.status === "Approved" && (
                      <button className="read-more-btn">Đọc thêm</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Phân trang */}
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
