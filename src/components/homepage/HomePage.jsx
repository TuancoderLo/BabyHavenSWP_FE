import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HomePage.css";
import Header from "../common/Header";
import Footer from "../common/Footer";

import Packages from "../packages/Packages";
import blogCategoryApi from "../../services/blogCategoryApi";
import blogApi from "../../services/blogApi"; // Add this import
import BlogSection from "../topics/BlogSection";

function HomePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestBlogs, setLatestBlogs] = useState([]); // Add this state

  // Tạo state cho userName
  const [userData, setUserData] = useState(null);

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
                    <span className="tag">#{blog.tags}</span>
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
                <h3>Track Your Child's Growth with Confidence</h3>
                <p>
                  Monitor and analyze your child's development using
                  internationally recognized standards, ensuring they are on the
                  right path.
                </p>
              </div>

              <div className="feature-highlight-card">
                <h3>Access Trusted Advice from Pediatric Experts</h3>
                <p>
                  Instantly connect with experienced doctors and child care
                  specialists for expert guidance whenever you need it.
                </p>
              </div>

              <div className="feature-highlight-card">
                <h3>Personalized Insights & Smart Alerts</h3>
                <p>
                  Stay informed with customized recommendations and real-time
                  alerts to address your child's unique health and developmental
                  needs.
                </p>
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
                    image:
                      "https://img.freepik.com/free-photo/mother-measuring-temperature-sick-daughter_23-2148867372.jpg",
                    title: "Health Tracker",
                  },
                  {
                    image:
                      "https://img.freepik.com/free-photo/mother-feeding-her-baby_23-2148867369.jpg",
                    title: "Feeding Guide",
                  },
                  {
                    image:
                      "https://img.freepik.com/free-photo/baby-sleeping-his-crib_23-2148867367.jpg",
                    title: "Sleep Tracker",
                  },
                  {
                    image:
                      "https://img.freepik.com/free-photo/mother-playing-with-her-baby_23-2148867374.jpg",
                    title: "Development",
                  },
                  {
                    image:
                      "https://img.freepik.com/free-photo/mother-taking-care-her-baby_23-2148867373.jpg",
                    title: "Care Guide",
                  },
                  {
                    image:
                      "https://img.freepik.com/free-photo/mother-measuring-baby-growth_23-2148867371.jpg",
                    title: "Growth Tracker",
                  },
                  {
                    image:
                      "https://img.freepik.com/free-photo/mother-doctor-examining-baby_23-2148867370.jpg",
                    title: "Health Records",
                  },
                  {
                    image:
                      "https://img.freepik.com/free-photo/mother-consulting-doctor-about-her-baby_23-2148867368.jpg",
                    title: "Expert Advice",
                  },
                ].map((tool, index) => (
                  <a key={index} href="#" className="tool-card">
                    <div className="tool-image">
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
              {[
                {
                  image:
                    "https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg",
                  name: "Dr. Sarah Johnson",
                  specialty: "Pediatric Specialist",
                },
                {
                  image:
                    "https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg",
                  name: "Dr. Michael Chen",
                  specialty: "Child Development Expert",
                },
                {
                  image:
                    "https://img.freepik.com/free-photo/portrait-smiling-male-doctor_171337-1532.jpg",
                  name: "Dr. Emily Rodriguez",
                  specialty: "Neonatal Care Specialist",
                },
                {
                  image:
                    "https://img.freepik.com/free-photo/female-doctor-hospital-with-stethoscope_23-2148827775.jpg",
                  name: "Dr. David Wilson",
                  specialty: "Pediatric Nutrition Specialist",
                },
                {
                  image:
                    "https://img.freepik.com/free-photo/doctor-standing-with-folder-stethoscope_1291-16.jpg",
                  name: "Dr. Lisa Thompson",
                  specialty: "Child Psychology & Mental Health",
                },
                {
                  image:
                    "https://img.freepik.com/free-photo/medium-shot-doctor-with-crossed-arms_23-2148868314.jpg",
                  name: "Dr. James Anderson",
                  specialty: "Pediatric Immunology & Allergies",
                },
              ].map((doctor, index) => (
                <div key={index} className="doctor-card">
                  <div className="doctor-image">
                    <img src={doctor.image} alt={doctor.name} />
                  </div>
                  <div className="doctor-info">
                    <h3>{doctor.name}</h3>
                    <p>{doctor.specialty}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="see-more-btn">See more</button>
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

      <Footer />
      <Packages />
    </div>
  );
}

export default HomePage;
