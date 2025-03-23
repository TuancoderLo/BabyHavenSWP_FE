import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../../layouts/Home/Navbar/Header";
import Footer from "../../../layouts/Home/Footer";
import "./HomePage.css";

import Packages from "../../../components/packages/PackageHome";
import blogCategoryApi from "../../../services/blogCategoryApi";
import blogApi from "../../../services/blogApi"; // Add this import
import BlogSection from "../ApiForHomePage/content/BlogSection";
import TrackConfident from "../../../assets/Monthly_users_resized.svg";
import Medical from "../../../assets/ic_med-advisers_dm_rejv.svg";
import Alert from "../../../assets/Expert_articles_resized.svg";
import GrowthTrack from "../../../assets/GrowthTracker-nov-2023.svg";
import Milestone from "../../../assets/ChildHeightPredictor.svg";
import doctorApi from "../../../services/DoctorApi"; // Thêm import này

function HomePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestBlogs, setLatestBlogs] = useState([]); // Add this state

  // Tạo state cho userName
  const [userData, setUserData] = useState(null);

  // Hàm xử lý tags
  const renderTags = (tags) => {
    if (!tags) return null;
    return tags.split(",").map((tag) => tag.trim());
  };

  // Lấy dữ liệu từ localStorage khi HomePage mount
  useEffect(() => {
    const nameFromLocal = localStorage.getItem("name"); // "Thao" chẳng hạn
    if (nameFromLocal) {
      // Giả sử ta chỉ lưu name dạng string, ta set userData = { name: ... }
      setUserData({ name: nameFromLocal });
    }
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

  // State quản lý menu đóng/mở
  const [menuOpen, setMenuOpen] = useState(false);

  // // Toggle sidebar khi click avatar
  // const handleAvatarClick = () => {
  //   setMenuOpen(!menuOpen);
  // };

  // Bật/tắt sidebar khi hover
  const handleMouseEnter = () => {
    setMenuOpen(true);
  };
  const handleMouseLeave = () => {
    setMenuOpen(false);
  };

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
    localStorage.clear();
    navigate("/");
  };

  // const handleMember = () => {
  //   navigate("/member/");
  // }

  // Fetch tất cả category cha (parentCategoryId = null)
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const response = await blogCategoryApi.getAll();
        if (response?.data?.status === 1) {
          // Lọc ra các category cha (parentCategoryId = null)
          const parentCats = response.data.data.filter(
            (category) => category.parentCategoryId === null
          );
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

  // Fetch latest blogs
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

  const [doctors, setDoctors] = useState([]); // Thêm state lưu trữ danh sách bác sĩ

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
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Join now and follow every tiny step of your baby's journey.</h1>
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
        <section className="support-section">
          <div className="support-content">
            <div className="support-left">
              <h2>
                <span className="highlight">BabyHaven</span> helps you and your
                little one
              </h2>
              <p>
                Parenthood is a journey full of joys and challenges. Our mission
                is to empower and support you with the guidance and resources
                you need at every stage.
              </p>

              <div className="support-buttons">
                <h3>How can we support you?</h3>
                <div className="button-grid">
                  <button className="support-btn">I'm expecting</button>
                  <button className="support-btn">I have a baby</button>
                  <button className="support-btn">I have a toddler</button>
                  <button className="support-btn">I have a child</button>
                </div>
              </div>
            </div>

            <div className="support-right">
              <h2 id="tools-features">Services</h2>
              <div className="tools-grid">
                {[
                  {
                    image: GrowthTrack,
                    title: "Growth Tracker",
                  },
                  {
                    image: Medical,
                    title: "Consultation with Experts",
                  },
                  {
                    image: Milestone,
                    title: "Milestone Records",
                  },
                ].map((tool, index) => (
                  <a key={index} href="#" className="tool-card">
                    <div className="tool-image-homepage">
                      <img src={tool.image} alt={tool.title} />
                    </div>
                    <span className="tool-title">{tool.title}</span>
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
                <a href="">Read more</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Packages />
    </div>
  );
}

export default HomePage;
