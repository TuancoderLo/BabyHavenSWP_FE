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
  const [doctorInfo, setDoctorInfo] = useState(null);

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

        // Nếu có email của tác giả, kiểm tra xem có phải là Doctor không
        if (blogData.email) {
          fetchDoctorInfo(blogData.email);
        }

        // Lấy các bài viết liên quan dựa trên tags thay vì categoryId
        fetchRelatedBlogs(id, blogData.tags);
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

  // Hàm mới để lấy thông tin Doctor
  const fetchDoctorInfo = async (authorEmail) => {
    try {
      console.log("Fetching doctor information for email:", authorEmail);
      const response = await api.get("https://localhost:7279/api/Doctors");
      console.log("Doctors API response:", response);

      // Kiểm tra cấu trúc dữ liệu trả về
      console.log("Response data type:", typeof response.data);
      console.log("Response data structure:", response.data);

      let doctorsData = [];

      // Xử lý nhiều trường hợp cấu trúc dữ liệu khác nhau
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Nếu response.data là một mảng
          doctorsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Nếu response.data.data là một mảng
          doctorsData = response.data.data;
        } else if (typeof response.data === "object") {
          // Nếu response.data là một object (có thể là một doctor duy nhất)
          // hoặc là một object chứa danh sách doctors

          // Kiểm tra xem có phải là một doctor duy nhất không
          if (response.data.email) {
            doctorsData = [response.data];
          } else {
            // Có thể là object chứa danh sách doctors
            // Thử chuyển các thuộc tính của object thành mảng
            const possibleDoctors = Object.values(response.data).filter(
              (item) => item && typeof item === "object" && item.email
            );

            if (possibleDoctors.length > 0) {
              doctorsData = possibleDoctors;
            }
          }
        }
      }

      console.log("Processed doctors data:", doctorsData);

      // Log tất cả email của doctors để debug
      if (doctorsData.length > 0) {
        console.log(
          "Available doctor emails:",
          doctorsData.map((doc) => doc.email)
        );
      } else {
        console.log("No doctors data found in the response");
      }

      // Tìm doctor có email trùng với email của tác giả (không phân biệt chữ hoa/chữ thường)
      const matchedDoctor = doctorsData.find(
        (doctor) =>
          doctor &&
          doctor.email &&
          doctor.email.toLowerCase() === authorEmail.toLowerCase()
      );

      console.log("Matched doctor:", matchedDoctor);

      if (matchedDoctor) {
        console.log("Found matching doctor with email:", matchedDoctor.email);
        console.log("Doctor degree:", matchedDoctor.degree);
        console.log("Doctor biography:", matchedDoctor.biography);
        setDoctorInfo(matchedDoctor);
      } else {
        console.log("No matching doctor found with email:", authorEmail);

        // Thử tìm theo tên
        const nameMatchedDoctor = doctorsData.find(
          (doctor) =>
            doctor &&
            doctor.name &&
            blog.name &&
            (doctor.name.toLowerCase().includes(blog.name.toLowerCase()) ||
              blog.name.toLowerCase().includes(doctor.name.toLowerCase()))
        );

        if (nameMatchedDoctor) {
          console.log("Found doctor by name match:", nameMatchedDoctor.name);
          setDoctorInfo(nameMatchedDoctor);
        } else {
          console.log("No matching doctor found by name either");
        }
      }
    } catch (error) {
      console.error("Error fetching doctor information:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
      });
    }
  };

  // Lấy các bài viết liên quan dựa trên tags
  const fetchRelatedBlogs = async (currentBlogId, currentBlogTags) => {
    try {
      console.log("Current blog tags:", currentBlogTags);

      // Nếu không có tags, không cần tìm kiếm bài viết liên quan
      if (!currentBlogTags) {
        console.log(
          "No tags found for current blog, skipping related blogs fetch"
        );
        setRelatedBlogs([]);
        return;
      }

      // Tách tags thành mảng và loại bỏ khoảng trắng thừa
      const tagsArray = currentBlogTags
        .split(",")
        .map((tag) => tag.trim().toLowerCase());
      console.log("Current blog tags array:", tagsArray);

      // Gọi API để lấy tất cả các bài viết
      console.log("Fetching all blogs for tag comparison");
      const response = await api.get("https://localhost:7279/api/Blog");
      console.log("All blogs API response:", response);

      // Xử lý dữ liệu trả về
      let allBlogs = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          allBlogs = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          allBlogs = response.data.data;
        } else if (typeof response.data === "object") {
          // Có thể là object chứa danh sách blogs
          const possibleBlogs = Object.values(response.data).filter(
            (item) => item && typeof item === "object" && item.blogId
          );

          if (possibleBlogs.length > 0) {
            allBlogs = possibleBlogs;
          }
        }
      }

      console.log("All blogs count:", allBlogs.length);

      // Lọc các bài viết có tags trùng với bài viết hiện tại
      const matchedBlogs = allBlogs.filter((blog) => {
        // Bỏ qua bài viết hiện tại
        if (
          blog.blogId === parseInt(currentBlogId) ||
          blog.blogId === currentBlogId
        ) {
          return false;
        }

        // Bỏ qua các bài viết không được phê duyệt
        if (blog.status !== "Approved") {
          return false;
        }

        // Nếu blog không có tags, bỏ qua
        if (!blog.tags) {
          return false;
        }

        // Tách tags của blog này thành mảng
        const blogTags = blog.tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase());

        // Kiểm tra xem có tag nào trùng với tags của bài viết hiện tại không
        return tagsArray.some((currentTag) =>
          blogTags.some(
            (blogTag) =>
              blogTag.includes(currentTag) || currentTag.includes(blogTag)
          )
        );
      });

      console.log("Matched blogs by tags:", matchedBlogs);

      // Giới hạn số lượng bài viết liên quan
      const limitedMatchedBlogs = matchedBlogs.slice(0, 8);

      // Nếu không đủ 8 bài viết liên quan, có thể bổ sung thêm bài viết từ cùng danh mục
      if (limitedMatchedBlogs.length < 8 && blog?.categoryId) {
        console.log(
          "Not enough related blogs by tags, fetching more from same category"
        );
        try {
          const categoryResponse = await api.get(
            `Blog/blogs/${blog.categoryId}`
          );
          let categoryBlogs = [];

          if (categoryResponse.data) {
            if (categoryResponse.data.data) {
              categoryBlogs = Array.isArray(categoryResponse.data.data)
                ? categoryResponse.data.data
                : [];
            } else {
              categoryBlogs = Array.isArray(categoryResponse.data)
                ? categoryResponse.data
                : [];
            }
          }

          // Lọc bỏ các bài viết đã có trong limitedMatchedBlogs và bài viết hiện tại
          const additionalBlogs = categoryBlogs.filter((catBlog) => {
            // Bỏ qua bài viết hiện tại
            if (
              catBlog.blogId === parseInt(currentBlogId) ||
              catBlog.blogId === currentBlogId
            ) {
              return false;
            }

            // Bỏ qua các bài viết không được phê duyệt
            if (catBlog.status !== "Approved") {
              return false;
            }

            // Bỏ qua các bài viết đã có trong limitedMatchedBlogs
            return !limitedMatchedBlogs.some(
              (matchedBlog) => matchedBlog.blogId === catBlog.blogId
            );
          });

          // Thêm các bài viết từ cùng danh mục vào danh sách bài viết liên quan
          const remainingSlots = 8 - limitedMatchedBlogs.length;
          const additionalBlogsToAdd = additionalBlogs.slice(0, remainingSlots);

          console.log(
            "Additional blogs from same category:",
            additionalBlogsToAdd
          );

          // Kết hợp hai danh sách
          const combinedBlogs = [
            ...limitedMatchedBlogs,
            ...additionalBlogsToAdd,
          ];
          setRelatedBlogs(combinedBlogs);
        } catch (error) {
          console.error(
            "Error fetching additional blogs from category:",
            error
          );
          // Nếu có lỗi, vẫn sử dụng các bài viết đã tìm được từ tags
          setRelatedBlogs(limitedMatchedBlogs);
        }
      } else {
        // Nếu đã đủ 8 bài viết hoặc không có categoryId
        setRelatedBlogs(limitedMatchedBlogs);
      }
    } catch (error) {
      console.error("Error fetching related blogs by tags:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
      });
      setRelatedBlogs([]);
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

  // Hàm render thông tin tác giả
  const renderAuthorInfo = () => {
    if (!blog) return null;

    // Kiểm tra URL ảnh trước khi hiển thị
    const authorImageUrl = blog.authorImage || blog.imageProfile;
    const isValidUrl =
      authorImageUrl &&
      (authorImageUrl.startsWith("http://") ||
        authorImageUrl.startsWith("https://"));

    const authorImage = isValidUrl ? authorImageUrl : DEFAULT_AVATAR;
    const authorName = blog.name || blog.authorName || "Tác giả ẩn danh";

    // Kiểm tra xem có phải là Doctor không (dựa vào doctorInfo)
    const isDoctorAuthor = doctorInfo !== null;

    // Xác định thông tin hiển thị dựa vào loại tác giả
    let authorDegree, authorBio;

    if (isDoctorAuthor) {
      // Nếu là Doctor, lấy thông tin từ doctorInfo
      authorDegree = doctorInfo.degree || "";
      authorBio = doctorInfo.biography || "";
    } else {
      // Nếu là Admin, để trống cả degree và biography
      authorDegree = "";
      authorBio = "";
    }

    return (
      <div className="blog-author-card">
        <div className="author-image">
          <img
            src={authorImage}
            alt={authorName}
            onError={(e) => {
              console.log("Sử dụng ảnh mặc định cho tác giả");
              e.target.onerror = null;
              e.target.src = DEFAULT_AVATAR;
            }}
          />
        </div>
        <h3 className="author-name">{authorName}</h3>

        {/* Luôn hiển thị phần degree, nhưng có thể trống */}
        <div className="author-degree">{authorDegree}</div>

        {/* Luôn hiển thị phần biography, nhưng có thể trống */}
        <p className="author-bio">{authorBio}</p>
      </div>
    );
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

              <div className="blog-tags">
                {renderTags(blog.tags)?.map((tag, index) => (
                  <span key={index} className="tag">
                    #{tag}
                  </span>
                ))}
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
            </div>

            {/* Thông tin tác giả - div7 */}
            {renderAuthorInfo()}

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
                      {relatedBlog.name ||
                        relatedBlog.authorName ||
                        "Tác giả ẩn danh"}
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
