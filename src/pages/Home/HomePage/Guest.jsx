import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Guest.css";
import Packages from "../../../components/packages/Packages";
import blogCategoryApi from "../../../services/blogCategoryApi";
import blogApi from "../../../services/blogApi";
import BlogSection from "../ApiForHomePage/content/BlogSection";
import HeaderGuest from "../../../layouts/Home/Navbar/HeaderGuest";
import doctorApi from "../../../services/DoctorApi";
import TrackConfident from "../../../assets/Monthly_users_resized.svg";
import Medical from "../../../assets/ic_med-advisers_dm_rejv.svg";
import Alert from "../../../assets/Expert_articles_resized.svg";
import GrowthTrack from "../../../assets/GrowthTracker-nov-2023.svg";
import Milestone from "../../../assets/ChildHeightPredictor.svg";
import {
  checkAndClearSessionData,
  clearAuthData,
  clearTemporaryData,
  cleanupExpiredTemporaryData,
} from "../../../utils/authUtils";
import icon1 from "../../../assets/icon/1.png";
import icon2 from "../../../assets/icon/2.png";
import icon3 from "../../../assets/icon/3.png";
import icon4 from "../../../assets/icon/4.png";
import icon5 from "../../../assets/icon/5.png";
import icon6 from "../../../assets/icon/6.png";
import icon7 from "../../../assets/icon/7.png";
import icon8 from "../../../assets/icon/8.png";

function Guest() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Thêm useEffect để xóa dữ liệu đăng ký tạm thời
  useEffect(() => {
    // Kiểm tra phiên mới và xóa dữ liệu đăng nhập
    checkAndClearSessionData();

    // Xóa dữ liệu đăng ký tạm thời bất kể là phiên mới hay cũ
    clearTemporaryData(["registration", "verification"]);

    // Dọn dẹp bất kỳ dữ liệu tạm thời nào đã hết hạn
    cleanupExpiredTemporaryData();

    // Xóa dữ liệu đăng ký tạm thời khi tải trang Guest
    const registrationKeys = [
      "registration_data",
      "pending_email",
      "verification_step",
      "verification_token",
    ];

    registrationKeys.forEach((key) => {
      if (localStorage.getItem(key)) {
        console.log(`Đã phát hiện và xóa dữ liệu đăng ký tạm thời: ${key}`);
        localStorage.removeItem(key);
      }
    });
  }, []);

  // Fetch tất cả category cha (parentCategoryId = null)
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const response = await blogCategoryApi.getAll();
        console.log("API Response:", response);
        if (response?.data?.status === 1) {
          // Lọc ra các category cha (parentCategoryId = null)
          const parentCats = response.data.data.filter(
            (category) => category.parentCategoryId === null
          );
          console.log("Parent Categories:", parentCats);
          setParentCategories(parentCats);
        }
      } catch (error) {
        console.error("Error fetching parent categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParentCategories();
  }, []);

  // Định nghĩa dữ liệu carousel
  const carouselImages = [
    {
      url: "https://www.brighthorizons.com/resources/-/media/bh-new/enews-images/widen-5imzbkuni06_519-babys-first-year.ashx?as=1",
      title: "Welcome to BabyHaven",
      description:
        "We're here to support you every step of your parenting journey.",
      buttonText: "Discover More",
    },
    {
      url: "https://images.squarespace-cdn.com/content/v1/5b9343ce4611a05bc46ea084/ebfb128d-2704-458b-b68a-b1f22f72768f/baby+mom+blocks.jpeg",
      title: "Friendly Expert Guidance",
      description:
        "Connect with caring professionals ready to help you navigate parenthood.",
      buttonText: "Meet Our Experts",
    },
    {
      url: "https://www.watchmegrowprogram.com/wp-content/uploads/2023/07/baby-milestones.jpg",
      title: "Track Your Baby's Development",
      description:
        "Watch as your little one grows and reaches exciting new milestones.",
      buttonText: "Start Tracking",
    },
  ];

  // Xử lý chuyển slide
  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === carouselImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    // Sử dụng clearAuthData từ authUtils
    clearAuthData();

    // Xóa dấu hiệu phiên làm việc
    sessionStorage.removeItem("session_started");

    console.log("Đã đăng xuất và xóa dữ liệu đăng nhập thành công");
    navigate("/login");
  };

  const handleScrollToFeatures = () => {
    const element = document.getElementById("tools-features");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start", // Cuộn để h2 nằm sát đỉnh màn hình
      });
    }
  };

  // Hàm xử lý tags
  const renderTags = (tags) => {
    if (!tags) return null;
    return tags.split(",").map((tag) => tag.trim());
  };

  // Thêm useEffect để lấy bài viết mới nhất
  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        console.log("Fetching blogs..."); // Kiểm tra hàm có chạy không
        const response = await blogApi.getOrderBy("CreatedAt", "desc");
        console.log("API response:", response.data); // Kiểm tra dữ liệu trả về

        setLatestBlogs(response.data.slice(0, 6));
      } catch (error) {
        console.error("Error fetching latest blogs:", error);
      }
    };

    fetchLatestBlogs();
  }, []);

  // Thêm useEffect để lấy dữ liệu bác sĩ
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorApi.getAllDoctors();
        if (response?.status === 1) {
          setDoctors(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bác sĩ:", error);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="homepage">
      {/* Navigation */}
      <HeaderGuest />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <NavLink className="journey" to={"/login"}>
            Join now and follow every tiny step of your baby's journey.
          </NavLink>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="carousel-section">
        <div className="carousel-container">
          <button className="carousel-button prev" onClick={prevSlide}>
            <i className="fas fa-chevron-left"></i>
          </button>

          <div className="carousel-content">
            {carouselImages.map((slide, index) => (
              <div
                key={index}
                className={`carousel-slide ${
                  index === currentSlide ? "active" : ""
                }`}
              >
                <div className="slide-caption">
                  <h3>{slide.title}</h3>
                  <p>{slide.description}</p>
                  <button className="slide-button">{slide.buttonText}</button>
                </div>
                <img src={slide.url} alt={slide.title} />
              </div>
            ))}
          </div>

          <button className="carousel-button next" onClick={nextSlide}>
            <i className="fas fa-chevron-right"></i>
          </button>

          <div className="carousel-dots">
            {carouselImages.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentSlide ? "active" : ""}`}
                onClick={() => setCurrentSlide(index)}
              ></span>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="homepage-main">
        {/* Categories Section */}
        <section className="categories-section">
          <h2>Popular Blogs</h2>
          <div className="categories-grid">
            {latestBlogs.map((blog, index) => (
              <a
                key={index}
                href={blog.url}
                target="_blank"
                rel="noopener noreferrer"
                className="category-card"
              >
                <img src={blog.imageBlog} alt={blog.title} />
                <div className="category-content">
                  <h3>{blog.title}</h3>
                  <div className="category-meta">
                    <span className="author">Author: {blog.authorName}</span>
                    <div className="blog-tags-homepage">
                      {renderTags(blog.tags)?.map((tag, index) => (
                        <span key={index} className="tag">
                          #
                          {tag
                            ? tag.replace(/<[^>]*>/g, "").substring(0, 8) +
                              "..."
                            : "..."}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Features Highlight Section */}
        <section className="features-highlight">
          <div className="features-highlight-content">
            <div className="feature-intro">
              <h2>BabyHaven - Your Trusted Parenting Companion</h2>
            </div>

            <div className="feature-cards">
              <div className="feature-highlight-card">
                <img src={TrackConfident} alt="track your child" />
                <div>
                  <h3>Track Your Child's Growth with Confidence</h3>
                  <p>
                    Monitor and analyze your child's development using
                    internationally recognized standards
                  </p>
                </div>
              </div>

              <div className="feature-highlight-card">
                <img src={Medical} alt="medical from expert" />
                <div>
                  <h3>Access Trusted Advice from Pediatric Experts</h3>
                  <p>
                    Instantly connect with experienced doctors and child care
                    specialists for expert guidance whenever you need it.
                  </p>
                </div>
              </div>

              <div className="feature-highlight-card">
                <img src={Alert} alt="smart alerts" />
                <div>
                  <h3>Personalized Insights & Smart Alerts</h3>
                  <p>
                    Stay informed with customized recommendations and real-time
                    alerts to address your child's unique health and
                    developmental needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="support-section homeGuest-support-section">
          <div className="support-content homeGuest-support-content">
            <div className="support-left homeGuest-support-left">
              <h2>
                <span className="highlight homeGuest-highlight">BabyHaven</span>{" "}
                helps you and your little one
              </h2>
              <p>
                Parenthood is a journey full of joys and challenges. Our mission
                is to empower and support you with the guidance and resources
                you need at every stage.
              </p>

              <div className="support-buttons homeGuest-support-buttons">
                <h3>How can we support you?</h3>
                <div className="button-grid homeGuest-button-grid">
                  <button className="support-btn homeGuest-support-btn">
                    I'm expecting
                  </button>
                  <button className="support-btn homeGuest-support-btn">
                    I have a baby
                  </button>
                  <button className="support-btn homeGuest-support-btn">
                    I have a toddler
                  </button>
                  <button className="support-btn homeGuest-support-btn">
                    I have a child
                  </button>
                </div>
              </div>
            </div>

            <div className="support-right homeGuest-support-right">
              <h2 id="tools-features">Services</h2>
              <div className="tools-grid homeGuest-tools-grid">
                {[
                  {
                    image: icon1,
                    title: "Update Growth Records",
                  },
                  {
                    image: icon2,
                    title: "Manage/Track Multiple Children",
                  },
                  {
                    image: icon3,
                    title: "View Basic Growth Charts",
                  },
                  {
                    image: icon4,
                    title: "View Advanced Growth Charts",
                  },
                  {
                    image: icon5,
                    title: "Nutrition and Development Alerts",
                  },
                  {
                    image: icon6,
                    title: "Request Doctor Consultation",
                  },
                  {
                    image: icon7,
                    title: "Share Health Data with Doctor",
                  },
                  {
                    image: icon8,
                    title: "View Blogs",
                  },
                ].map((tool, index) => (
                  <a
                    key={index}
                    href="#"
                    className="tool-card homeGuest-tool-card"
                  >
                    <div className="tool-image-homepage homeGuest-tool-image">
                      <img src={tool.image} alt={tool.title} />
                    </div>
                    <span className="tool-title homeGuest-tool-title">
                      {tool.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Popular Topics Section */}
        <section className="popular-topics">
          <h2>Blogs</h2>
          {loading ? (
            <div>Loading categories...</div>
          ) : (
            parentCategories.map((category) => (
              <BlogSection
                key={category.categoryId}
                parentCategoryId={category.categoryId}
              />
            ))
          )}
        </section>

        {/* Medical Advisory Board Section */}
        <section className="medical-board">
          <div className="board-content">
            <h2>Our Medical Advisory Board</h2>
            <p className="board-description">
              Our board consists of leading pediatricians, child development
              experts, and medical specialists dedicated to ensuring the
              accuracy and reliability of the information we provide.
            </p>

            <div className="doctors-grid">
              {doctors && doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <div key={doctor.doctorId} className="doctor-card">
                    <div className="doctor-image">
                      <img
                        src={
                          doctor.user?.profilePicture ||
                          "https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg"
                        }
                        alt={doctor.name}
                      />
                    </div>
                    <div className="doctor-info">
                      <h3>{doctor.name}</h3>
                      <p>{doctor.degree}</p>
                      <span>{doctor.hospitalName}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>Đang tải thông tin bác sĩ...</p>
              )}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="trust-section">
          <div className="trust-content">
            <h2>
              Why You Can Trust{" "}
              <span className="trust-highlight">BabyHaven</span>
            </h2>

            <div className="trust-grid">
              <div className="trust-card">
                <h3>Accurate</h3>
                <p>Fact-checked with the latest science-backed research</p>
              </div>

              <div className="trust-card">
                <h3>Trustworthy</h3>
                <p>
                  Edited and reviewed by doctors and parenting professionals
                </p>
              </div>

              <div className="trust-card">
                <h3>Always Up-to-Date</h3>
                <p>Updated regularly to reflect the latest information</p>
              </div>
            </div>

            <div className="trust-footer">
              <p>
                Learn more about our commitment to quality and accuracy.{" "}
                <a href="#">Read more</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About BabyHaven</h3>
            <p>
              We are committed to providing high-quality, research-backed
              products and resources to support your parenting journey.
            </p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="#about">About Us</a>
              </li>
              <li>
                <a href="#products">Our Products</a>
              </li>
              <li>
                <a href="#contact">Contact Us</a>
              </li>
              <li>
                <a href="#policy">Privacy Policy</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Contact</h3>
            <ul>
              <li>
                <i className="fas fa-phone"></i> +84 832909890
              </li>
              <li>
                <i className="fas fa-envelope"></i> support@babyhaven.com
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i> Block E2a-7, D1 Street
                Saigon Hi-tech Park, Long Thanh My Ward, District 9, Ho Chi Minh
                City, Vietnam
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Follow Us</h3>
            <div className="social-links">
              <a href="#">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 BabyHaven. All rights reserved.</p>
        </div>
      </footer>
      {/* Packages (icon + bảng gói) */}
      <Packages />
    </div>
  );
}

export default Guest;
