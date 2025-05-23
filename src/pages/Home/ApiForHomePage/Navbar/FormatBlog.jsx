import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../../layouts/Home/Navbar/Header";
import HeaderGuest from "../../../../layouts/Home/Navbar/HeaderGuest";
import Footer from "../../../../layouts/Home/Footer";
import api from "../../../../config/axios";
import "./FormatBlog.css";
import blogApi from "../../../../services/blogApi";
import doctorApi from "../../../../services/DoctorApi";
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
      setError("ID not found");
      setLoading(false);
    }
  }, [blogId]);

  const fetchBlogDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching blog with ID: ${id}`);
      const response = await blogApi.getById(id);
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
      setError("Error fetching blog details");
    } finally {
      setLoading(false);
    }
  };

  // Hàm mới để lấy thông tin Doctor
  const fetchDoctorInfo = async (authorEmail) => {
    try {
      console.log("Fetching doctor information for email:", authorEmail);
      const response = await doctorApi.getDoctorsFromEndpoint();
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
      const response = await blogApi.getAll();
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
      let matchedBlogs = allBlogs.filter((blog) => {
        // Bỏ qua bài viết hiện tại
        if (
          blog.blogId === parseInt(currentBlogId) ||
          blog.blogId === currentBlogId
        ) {
          return false;
        }

        // Chỉ lấy các bài viết có status là "Approved"
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

      // Sắp xếp theo thời gian tạo mới nhất
      matchedBlogs = matchedBlogs.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.createdDate || 0);
        const dateB = new Date(b.createdAt || b.createdDate || 0);
        return dateB - dateA; // Sắp xếp giảm dần (mới nhất trước)
      });

      console.log("Matched blogs by tags (sorted by date):", matchedBlogs);

      // Giới hạn số lượng bài viết liên quan
      const limitedMatchedBlogs = matchedBlogs.slice(0, 8);

      // Nếu không đủ 8 bài viết liên quan, có thể bổ sung thêm bài viết từ cùng danh mục
      if (limitedMatchedBlogs.length < 8 && blog?.categoryId) {
        console.log(
          "Not enough related blogs by tags, fetching more from same category"
        );
        try {
          const categoryResponse = await blogApi.getByCategoryId(
            blog.categoryId
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
          // Và chỉ lấy các bài viết có status "Approved"
          let additionalBlogs = categoryBlogs.filter((catBlog) => {
            // Bỏ qua bài viết hiện tại
            if (
              catBlog.blogId === parseInt(currentBlogId) ||
              catBlog.blogId === currentBlogId
            ) {
              return false;
            }

            // Chỉ lấy các bài viết có status là "Approved"
            if (catBlog.status !== "Approved") {
              return false;
            }

            // Bỏ qua các bài viết đã có trong limitedMatchedBlogs
            return !limitedMatchedBlogs.some(
              (matchedBlog) => matchedBlog.blogId === catBlog.blogId
            );
          });

          // Sắp xếp theo thời gian tạo mới nhất
          additionalBlogs = additionalBlogs.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.createdDate || 0);
            const dateB = new Date(b.createdAt || b.createdDate || 0);
            return dateB - dateA; // Sắp xếp giảm dần (mới nhất trước)
          });

          // Thêm các bài viết từ cùng danh mục vào danh sách bài viết liên quan
          const remainingSlots = 8 - limitedMatchedBlogs.length;
          const additionalBlogsToAdd = additionalBlogs.slice(0, remainingSlots);

          console.log(
            "Additional blogs from same category (sorted by date):",
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
    return date.toLocaleDateString("en-US", {
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
    const authorName = blog.name || blog.authorName || "Unknown Author";

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
      <div className="FormatBlog-blog-author-card">
        <div className="FormatBlog-author-image">
          <img
            src={authorImage}
            alt={authorName}
            onError={(e) => {
              console.log("Using default image for author");
              e.target.onerror = null;
              e.target.src = DEFAULT_AVATAR;
            }}
          />
        </div>
        <h3 className="FormatBlog-author-name">{authorName}</h3>

        {/* Luôn hiển thị phần degree, nhưng có thể trống */}
        <div className="FormatBlog-author-degree">{authorDegree}</div>

        {/* Luôn hiển thị phần biography, nhưng có thể trống */}
        <p className="FormatBlog-author-bio">{authorBio}</p>
      </div>
    );
  };

  return (
    <div className="FormatBlog-blog-page">
      {isLoggedIn ? <Header /> : <HeaderGuest />}

      <div className="FormatBlog-blog-navigation">
        <div className="FormatBlog-blog-navigation-container">
          <button onClick={handleGoBack} className="FormatBlog-back-button">
            &larr; Back
          </button>
          <div className="FormatBlog-breadcrumbs">
            <span>Home</span> &gt;
            <span>{blog?.categoryName || "Category"}</span> &gt;
            <span className="FormatBlog-current-page">
              {blog?.title || "Blog"}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="FormatBlog-loading-container">
          <div className="FormatBlog-loading">Loading blogs...</div>
        </div>
      ) : error ? (
        <div className="FormatBlog-error-container">
          <div className="FormatBlog-error">{error}</div>
        </div>
      ) : blog ? (
        <main className="FormatBlog-blog-content-container">
          <div className="FormatBlog-blog-grid-layout">
            {/* Nội dung bài viết chính */}
            <div className="FormatBlog-blog-main-content">
              <h1 className="FormatBlog-blog-title">{blog.title}</h1>

              <div className="FormatBlog-blog-metadata">
                <span className="FormatBlog-blog-date">
                  {formatDate(blog.createdAt || blog.createdDate)}
                </span>
                <span className="FormatBlog-blog-category">
                  {blog.categoryName}
                </span>
              </div>

              <div className="FormatBlog-blog-tags">
                {renderTags(blog.tags)?.map((tag, index) => (
                  <span key={index} className="FormatBlog-tag">
                    #{tag}
                  </span>
                ))}
              </div>

              {blog.imageBlog && (
                <div className="FormatBlog-blog-featured-image">
                  <img
                    src={blog.imageBlog}
                    alt={blog.title}
                    onError={(e) => {
                      console.log("Using default image for blog post");
                      e.target.onerror = null;
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />
                </div>
              )}

              <div className="FormatBlog-blog-content">
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              </div>
            </div>

            {/* Thông tin tác giả - luôn hiển thị bên phải */}
            <div className="FormatBlog-blog-author-sidebar">
              {renderAuthorInfo()}
            </div>

            {/* Các bài viết liên quan - chiếm toàn bộ chiều rộng */}
            {relatedBlogs.length > 0 ? (
              <div className="FormatBlog-related-blogs-section">
                <h2 className="FormatBlog-related-blogs-title">
                  Related Articles
                </h2>
                <div className="FormatBlog-related-blogs-grid">
                  {relatedBlogs.map((relatedBlog, index) => (
                    <div
                      key={relatedBlog.blogId || relatedBlog.id || index}
                      className="FormatBlog-related-blog-card"
                      onClick={() => handleReadMore(relatedBlog)}
                    >
                      <div className="FormatBlog-related-blog-image">
                        <img
                          src={relatedBlog.imageBlog || DEFAULT_IMAGE}
                          alt={relatedBlog.title}
                          onError={(e) => {
                            console.log("Using default image for related blog");
                            e.target.onerror = null;
                            e.target.src = DEFAULT_IMAGE;
                          }}
                        />
                      </div>
                      <div className="FormatBlog-related-blog-content">
                        <h3 className="FormatBlog-related-blog-title">
                          {relatedBlog.title}
                        </h3>
                        <div className="FormatBlog-related-blog-info">
                          <p className="FormatBlog-related-blog-author">
                            {relatedBlog.name ||
                              relatedBlog.authorName ||
                              "Unknown"}
                          </p>
                          <p className="FormatBlog-related-blog-date">
                            {formatDate(
                              relatedBlog.createdAt || relatedBlog.createdDate
                            )}
                          </p>
                        </div>
                        {relatedBlog.tags && (
                          <div className="FormatBlog-related-blog-tags">
                            {renderTags(relatedBlog.tags)
                              .slice(0, 2)
                              .map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="FormatBlog-related-tag"
                                >
                                  #{tag}
                                </span>
                              ))}
                          </div>
                        )}
                        <button className="FormatBlog-read-more-btn">
                          Read More
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="FormatBlog-no-related-blogs">
                <p>No related articles</p>
              </div>
            )}
          </div>
        </main>
      ) : (
        <div className="FormatBlog-error-container">
          <div className="FormatBlog-error">Blog not found</div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default FormatBlog;

<div className="FormatBlog-error">Blog not found</div>;
