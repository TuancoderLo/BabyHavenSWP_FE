import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import api from "../config/axios";
import "./CategoryPage.css";

function CategoryPage() {
  const { categoryId } = useParams();
  const [blogs, setBlogs] = useState([]); // Khởi tạo là mảng rỗng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsPerPage] = useState(6);

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
      console.log("Blogs data:", response.data);

      // Đảm bảo response.data là một mảng
      const blogsData = Array.isArray(response.data) ? response.data : [];

      if (blogsData.length === 0) {
        setError("Không có bài viết nào trong danh mục này");
      }

      setBlogs(blogsData);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError("Có lỗi xảy ra khi tải bài viết. Vui lòng thử lại sau.");
      setBlogs([]); // Reset về mảng rỗng khi có lỗi
    } finally {
      setLoading(false);
    }
  };

  // Tính toán blogs cho trang hiện tại
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

  return (
    <div className="category-page">
      <Header />

      <main className="category-content">
        {categoryName && <h1 className="category-title">{categoryName}</h1>}

        {loading ? (
          <div className="loading">Đang tải bài viết...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="blogs-container">
              {getCurrentBlogs().map((blog) => (
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
                    <h2 className="blog-title">{blog.title}</h2>
                    <p className="blog-author">
                      {blog.authorName || "Ẩn danh"}
                    </p>
                    <p className="blog-excerpt">
                      {blog.content?.substring(0, 150)}...
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
