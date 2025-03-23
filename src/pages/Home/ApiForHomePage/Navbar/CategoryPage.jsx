import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../../layouts/Home/Navbar/Header";
import HeaderGuest from "../../../../layouts/Home/Navbar/HeaderGuest";
import Footer from "../../../../layouts/Home/Footer";
import api from "../../../../config/axios";
import "./CategoryPage.css";
import parse from "html-react-parser";

function CategoryPage() {
  const { categoryId } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsPerPage] = useState(8);
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);

  // Kiểm tra trạng thái đăng nhập
  const isLoggedIn = localStorage.getItem("token") !== null;

  useEffect(() => {
    if (categoryId) {
      console.log("Loading category:", categoryId);
      // Đặt lại currentPage về 1 mỗi khi categoryId thay đổi
      setCurrentPage(1);
      checkCategoryType();
    }
  }, [categoryId]);

  // Hàm mới: Kiểm tra loại category (cha/con)
  const checkCategoryType = async () => {
    try {
      setLoading(true);

      // 1. Gọi API để lấy danh sách tất cả categories
      const response = await api.get("BlogCategories");
      console.log("All categories:", response.data);

      // 2. Lấy dữ liệu categories (xử lý cả trường hợp data nằm trong response.data.data)
      const allCategories =
        response.data && response.data.data
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

      // 3. Tìm category cụ thể dựa vào categoryId
      const currentCategory = allCategories.find(
        (cat) => cat.categoryId.toString() === categoryId.toString()
      );

      if (!currentCategory) {
        setError("Category not found");
        setLoading(false);
        return;
      }

      // 4. Lưu thông tin category và tên category
      setCategory(currentCategory);
      setCategoryName(currentCategory.categoryName);

      console.log("Current category:", currentCategory);
      console.log("Parent Category ID:", currentCategory.parentCategoryId);

      // 5. Kiểm tra loại category dựa vào parentCategoryId
      if (currentCategory.parentCategoryId === null) {
        console.log("This is a parent category");
        // Lấy blogs từ category cha
        fetchBlogsFromParentCategory(categoryId);
      } else {
        console.log("This is a child category");
        // Lấy blogs từ category con
        fetchBlogsFromChildCategory(categoryId);
      }
    } catch (error) {
      console.error("Error checking category type:", error);
      setError("Error loading category");
      setLoading(false);
    }
  };

  // Hàm để lấy blogs từ danh mục cha
  const fetchBlogsFromParentCategory = async (parentCategoryId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(
        `BlogCategories/parent-categories/${parentCategoryId}`
      );
      console.log("Response from parent API:", response.data);

      let blogsData = [];

      // Xử lý dữ liệu từ API danh mục cha
      // API này trả về mảng các danh mục con, mỗi danh mục có mảng blogs
      if (response.data) {
        const categories = Array.isArray(response.data)
          ? response.data
          : response.data.data && Array.isArray(response.data.data)
          ? response.data.data
          : [];

        // Lặp qua từng danh mục con
        categories.forEach((category) => {
          if (category.blogs && Array.isArray(category.blogs)) {
            // Lọc blog có status là "Approved"
            const approvedBlogs = category.blogs.filter(
              (blog) => blog.status === "Approved"
            );

            // Chuẩn hóa dữ liệu blog từ mỗi danh mục con
            const formattedBlogs = approvedBlogs.map((blog) => ({
              blogId: blog.blogId,
              title: blog.title,
              content: blog.content,
              authorId: blog.authorId,
              // Nếu không có authorName, sử dụng "Unknown"
              authorName:
                blog.authorName || (blog.author ? blog.author.name : "Unknown"),
              categoryName: category.categoryName,
              categoryId: category.categoryId,
              imageBlog: blog.imageBlog,
              status: blog.status,
              tags: blog.tags,
              createdAt: blog.createdAt,
              updatedAt: blog.updatedAt,
            }));
            blogsData = [...blogsData, ...formattedBlogs];
          }
        });
      }

      console.log("Processed blogs data (Parent):", blogsData);

      if (blogsData.length === 0) {
        setError("No approved blogs found in this category");
      }

      setBlogs(blogsData);
    } catch (error) {
      console.error("Error fetching blogs from parent category:", error);
      setError("Error fetching blogs");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm để lấy blogs từ danh mục con
  const fetchBlogsFromChildCategory = async (childCategoryId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`BlogCategories/${childCategoryId}`);
      console.log("Response from child API:", response.data);

      let blogsData = [];

      // Xử lý dữ liệu từ API danh mục con
      if (response.data) {
        const categoryData = response.data.data || response.data;
        const blogs = categoryData.blogs;

        if (blogs && Array.isArray(blogs)) {
          // Lọc blog có status là "Approved"
          const approvedBlogs = blogs.filter(
            (blog) => blog.status === "Approved"
          );

          // Chuẩn hóa dữ liệu blog từ danh mục con
          blogsData = approvedBlogs.map((blog) => ({
            blogId: blog.blogId,
            title: blog.title,
            content: blog.content,
            authorId: blog.authorId,
            authorName: blog.authorName || "Unknown",
            categoryName: categoryData.categoryName || blog.categoryName,
            categoryId: childCategoryId,
            imageBlog: blog.imageBlog,
            status: blog.status,
            tags: blog.tags,
            createdAt: blog.createdAt,
            updatedAt: blog.updatedAt,
          }));
        }
      }

      console.log("Processed blogs data (Child):", blogsData);

      if (blogsData.length === 0) {
        setError("No approved blogs found in this category");
      }

      setBlogs(blogsData);
    } catch (error) {
      console.error("Error fetching blogs from child category:", error);
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
                        Read more
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
                  Previous
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
