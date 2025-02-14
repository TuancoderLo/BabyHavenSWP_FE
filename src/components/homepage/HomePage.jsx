import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Định nghĩa dữ liệu carousel
  const carouselImages = [
    {
      url: "https://example.com/slide1.jpg",
      title: "Welcome to BabyHaven",
      description: "Your trusted partner in parenting journey",
      buttonText: "Learn More",
    },
    {
      url: "https://example.com/slide2.jpg",
      title: "Expert Guidance",
      description: "Get advice from experienced professionals",
      buttonText: "Meet Our Experts",
    },
    {
      url: "https://example.com/slide3.jpg",
      title: "Track Development",
      description: "Monitor your child's growth milestones",
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
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="homepage">
      {/* Navigation */}
      <header className="homepage-header">
        <nav>
          <div className="logo">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWoGKcB9SMvUmAFc9v3yH6f_wt5iZrJM8Lpg&s"
              alt="BabyHaven Logo"
            />
            <span>BabyHaven</span>
          </div>
          <div className="nav-links">
            <div className="dropdown">
              <a href="#getting-pregnant">Getting Pregnant</a>
              <div className="dropdown-content">
                <a href="#fertility">Fertility</a>
                <a href="#ovulation">Ovulation</a>
                <a href="#preparation">Preparation</a>
              </div>
            </div>
            <div className="dropdown">
              <a href="#pregnancy">Pregnancy</a>
              <div className="dropdown-content">
                <a href="#first-trimester">First Trimester</a>
                <a href="#second-trimester">Second Trimester</a>
                <a href="#third-trimester">Third Trimester</a>
              </div>
            </div>
            <div className="dropdown">
              <a href="#baby">Baby</a>
              <div className="dropdown-content">
                <a href="#newborn">Newborn</a>
                <a href="#development">Development</a>
                <a href="#care">Baby Care</a>
              </div>
            </div>
            <div className="dropdown">
              <a href="#toddler">Toddler</a>
              <div className="dropdown-content">
                <a href="#development">Development</a>
                <a href="#nutrition">Nutrition</a>
                <a href="#activities">Activities</a>
              </div>
            </div>
            <div className="dropdown">
              <a href="#child">Child</a>
              <div className="dropdown-content">
                <a href="#education">Education</a>
                <a href="#health">Health</a>
                <a href="#activities">Activities</a>
              </div>
            </div>
            <a href="#community">Community</a>
            <a href="#features">Features</a>
          </div>
          <div className="user-actions">
            <button className="logout-btn" onClick={() => navigate("/guest")}>
              <i className="fas fa-sign-in-alt"></i>
              Logout
            </button>
          </div>
          {/* <div className="avatar-container">
            <img
              src="/images/avatar.png"
              // alt="Avatar Logo"
              // className="avatar-logo"
            />
          </div> */}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Join now to follow your baby's every tiny steps.</h1>
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
          <h2>Danh mục nổi bật</h2>
          <div className="categories-grid">
            <div className="category-card">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVc6sfu1l5-UgwaPFdDVDvwLkRhpIl70AIQw&s"
                alt="Product 1"
              />
              <div className="category-content">
                <h3>2 Genius TikTok Organizing Products, Approved by Moms</h3>
                <div className="category-meta">
                  <span className="author">Author: Miles</span>
                  <span className="tag">#Nutrition</span>
                </div>
              </div>
            </div>
            <div className="category-card">
              <img src="https://example.com/product2.jpg" alt="Product 2" />
              <div className="category-content">
                <h3>2 Genius TikTok Organizing Products, Approved by Moms</h3>
                <div className="category-meta">
                  <span className="author">Author: Miles</span>
                  <span className="tag">#Nutrition</span>
                </div>
              </div>
            </div>
            <div className="category-card">
              <img src="https://example.com/pregnancy.jpg" alt="Mang thai" />
              <div className="category-content">
                <h3>2 Genius TikTok Organizing Products, Approved by Moms</h3>
                <div className="category-meta">
                  <span className="author">Author: Miles</span>
                  <span className="tag">#Nutrition</span>
                </div>
              </div>
            </div>
            <div className="category-card">
              <img src="https://example.com/nutrition.jpg" alt="Dinh dưỡng" />
              <div className="category-content">
                <h3>2 Genius TikTok Organizing Products, Approved by Moms</h3>
                <div className="category-meta">
                  <span className="author">Author: Miles</span>
                  <span className="tag">#Nutrition</span>
                </div>
              </div>
            </div>
            <div className="category-card">
              <img src="https://example.com/development.jpg" alt="Phát triển" />
              <div className="category-content">
                <h3>2 Genius TikTok Organizing Products, Approved by Moms</h3>
                <div className="category-meta">
                  <span className="author">Author: Miles</span>
                  <span className="tag">#Nutrition</span>
                </div>
              </div>
            </div>
            <div className="category-card">
              <img src="https://example.com/health.jpg" alt="Sức khỏe" />
              <div className="category-content">
                <h3>2 Genius TikTok Organizing Products, Approved by Moms</h3>
                <div className="category-meta">
                  <span className="author">Author: Miles</span>
                  <span className="tag">#Nutrition</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Highlight Section */}
        <section className="features-highlight">
          <div className="features-highlight-content">
            <div className="feature-intro">
              <h2>BabyHaven is your parenting partner</h2>
            </div>

            <div className="feature-cards">
              <div className="feature-highlight-card">
                <h3>Comprehensive Growth Tracking for Your Child</h3>
                <p>
                  Measure and track metrics based on international standards.
                </p>
              </div>

              <div className="feature-highlight-card">
                <h3>Expert Advice from Experienced Doctors</h3>
                <p>Quick connect with reliable medical professionals.</p>
              </div>

              <div className="feature-highlight-card">
                <h3>Personalized Alerts and Recommendations</h3>
                <p>
                  Detect anomalies and receive tailored advice for your child's
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
                Our mission is to make parents feel confident when taking the
                biggest leap in their lives: having a baby
              </p>

              <div className="support-buttons">
                <h3>How can we support you?</h3>
                <div className="button-grid">
                  <button className="support-btn">I am pregnant</button>
                  <button className="support-btn">I have a baby</button>
                  <button className="support-btn">I have a toddle</button>
                  <button className="support-btn">I have a child</button>
                </div>
              </div>
            </div>

            <div className="support-right">
              <h2>Tools & Features</h2>
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
          <h2>Popular Topics</h2>

          {/* Pregnancy Section */}
          <div className="topic-section">
            <h3>Pregnancy</h3>
            <div className="topic-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">Nutrition & Wellness</button>
              <button className="filter-btn">Exercise & Fitness</button>
              <button className="filter-btn">Prenatal Care</button>
              <button className="filter-btn">Preparing for Birth</button>
              <button className="filter-btn">Emotional Well-being</button>
            </div>

            <div className="topic-grid">
              {[
                {
                  image:
                    "https://top3.vn/uploads/source/BaoNgoc/hinh-anh-me-va-be.jpg",
                  title:
                    "2 Genius TikTok Organizing Products, Approved by Moms",
                  author: "John Smith",
                  tags: ["#Nutrition", "#Wellness", "#Tips"],
                },
                {
                  image:
                    "https://thuthuatnhanh.com/wp-content/uploads/2022/06/Anh-me-va-be.jpg",
                  title: "Essential Pregnancy Exercises for a Healthy Journey",
                  author: "Emma Davis",
                  tags: ["#Exercise", "#Fitness", "#Health"],
                },
                {
                  image:
                    "https://img5.thuthuatphanmem.vn/uploads/2021/12/16/hinh-anh-me-va-be-gai-cute_094356707.jpg",
                  title: "Complete Guide to Prenatal Care: What to Expect",
                  author: "Dr. Sarah Wilson",
                  tags: ["#PrenatalCare", "#Health", "#Guide"],
                },
                {
                  image:
                    "https://studiovietnam.com/wp-content/uploads/2020/10/chup-anh-nghe-thuat-cho-me-va-be-7.jpg",
                  title: "Nutrition Tips for a Healthy Pregnancy Diet",
                  author: "Maria Rodriguez",
                  tags: ["#Nutrition", "#Diet", "#Health"],
                },
              ].map((item, index) => (
                <div key={index} className="topic-card">
                  <div className="topic-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="topic-content">
                    <h4>{item.title}</h4>
                    <div className="topic-meta">
                      <span className="author">{item.author}</span>
                      <div className="topic-tags">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Baby Section */}
          <div className="topic-section">
            <h3>Baby</h3>
            <div className="topic-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">Feeding Essentials</button>
              <button className="filter-btn">Sleep Training Tips</button>
              <button className="filter-btn">Developmental Milestones</button>
              <button className="filter-btn">Health & Immunization</button>
              <button className="filter-btn">Bonding Activities</button>
            </div>

            <div className="topic-grid">
              {[
                {
                  image:
                    "https://images.pexels.com/photos/235127/pexels-photo-235127.jpeg",
                  title: "Essential Guide to Baby Feeding Schedules",
                  author: "Dr. Emily Chen",
                  tags: ["#Feeding", "#Schedule", "#Tips"],
                },
                {
                  image:
                    "https://images.squarespace-cdn.com/content/v1/5a943503b40b9d58b1938792/1525104916603-YSPWOIJ3SE5SEOOJYEE4/Look+no+further+for+the+quickest+method+to+get+the+sleep+results+you+seek.+With+Extinction%2C+you+allow+your+child+the+opportunity+to+fall+asleep+completely+on+his+own.",
                  title:
                    "Sleep Training Methods: Finding What Works for Your Baby",
                  author: "Lisa Thompson",
                  tags: ["#Sleep", "#Training", "#Development"],
                },
                {
                  image:
                    "https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg",
                  title: "Understanding Your Baby's Growth Milestones",
                  author: "Dr. Michael Brown",
                  tags: ["#Growth", "#Milestones", "#Development"],
                },
                {
                  image:
                    "https://images.pexels.com/photos/3875089/pexels-photo-3875089.jpeg",
                  title: "Fun and Educational Activities for Baby Bonding",
                  author: "Sarah Parker",
                  tags: ["#Bonding", "#Activities", "#Learning"],
                },
              ].map((item, index) => (
                <div key={index} className="topic-card">
                  <div className="topic-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="topic-content">
                    <h4>{item.title}</h4>
                    <div className="topic-meta">
                      <span className="author">{item.author}</span>
                      <div className="topic-tags">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Toddle Section */}
          <div className="topic-section">
            <h3>Toddle</h3>
            <div className="topic-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">Discipline & Behavior</button>
              <button className="filter-btn">Early Learning Tools</button>
              <button className="filter-btn">Potty Training</button>
              <button className="filter-btn">Healthy Meals & Snacks</button>
              <button className="filter-btn">Social Skills Development</button>
            </div>

            <div className="topic-grid">
              {[
                {
                  image:
                    "https://todaysparent.mblycdn.com/uploads/tp/2016/03/29-toddler-discipline-tactics-that-work.jpg",
                  title: "Effective Discipline Strategies for Toddlers",
                  author: "Dr. Rachel Green",
                  tags: ["#Discipline", "#Behavior", "#Parenting"],
                },
                {
                  image:
                    "https://keeptoddlersbusy.com/wp-content/uploads/2020/09/Preschool-Learning-Activity-Counting-clothespin-wheel-1140x933.jpg",
                  title: "Fun Learning Activities for Toddler Development",
                  author: "Jessica Williams",
                  tags: ["#Learning", "#Development", "#Activities"],
                },
                {
                  image:
                    "https://assets.babycenter.com/ims/2022/10/toddler-potty-training-10-oct-2022_4x3.jpg",
                  title: "Complete Guide to Successful Potty Training",
                  author: "Dr. James Anderson",
                  tags: ["#PottyTraining", "#Tips", "#Guide"],
                },
                {
                  image:
                    "https://onceuponafarmorganics.com/cdn/shop/articles/2160px_f6ae9da3-be10-4471-a933-d6d0cecf3b4e.jpg?v=1683323853",
                  title: "Healthy and Easy Toddler Meal Ideas",
                  author: "Chef Maria Garcia",
                  tags: ["#Nutrition", "#Meals", "#HealthyEating"],
                },
              ].map((item, index) => (
                <div key={index} className="topic-card">
                  <div className="topic-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="topic-content">
                    <h4>{item.title}</h4>
                    <div className="topic-meta">
                      <span className="author">{item.author}</span>
                      <div className="topic-tags">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Child Section */}
          <div className="topic-section">
            <h3>Child</h3>
            <div className="topic-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">Academic Growth</button>
              <button className="filter-btn">Extracurricular Activities</button>
              <button className="filter-btn">Emotional Intelligence</button>
              <button className="filter-btn">Technology Use</button>
              <button className="filter-btn">Physical Fitness</button>
            </div>

            <div className="topic-grid">
              {[
                {
                  image:
                    "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg",
                  title:
                    "Boosting Your Child's Academic Performance: Expert Tips",
                  author: "Dr. Robert Miller",
                  tags: ["#Education", "#Learning", "#Academic"],
                },
                {
                  image:
                    "https://images.pexels.com/photos/8612900/pexels-photo-8612900.jpeg",
                  title:
                    "Best After-School Activities for Well-Rounded Development",
                  author: "Jennifer Adams",
                  tags: ["#Activities", "#Development", "#Skills"],
                },
                {
                  image:
                    "https://images.pexels.com/photos/8613315/pexels-photo-8613315.jpeg",
                  title: "Building Emotional Intelligence in Children",
                  author: "Dr. Amanda Lee",
                  tags: ["#Emotional", "#Growth", "#Development"],
                },
                {
                  image:
                    "https://images.pexels.com/photos/8612977/pexels-photo-8612977.jpeg",
                  title: "Balancing Screen Time and Physical Activities",
                  author: "Coach David Wilson",
                  tags: ["#Technology", "#Health", "#Balance"],
                },
              ].map((item, index) => (
                <div key={index} className="topic-card">
                  <div className="topic-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="topic-content">
                    <h4>{item.title}</h4>
                    <div className="topic-meta">
                      <span className="author">{item.author}</span>
                      <div className="topic-tags">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Medical Advisory Board Section */}
        <section className="medical-board">
          <div className="board-content">
            <h2>Our Medical Advisory Board</h2>
            <p className="board-description">
              Meet our medical advisors - highly respected experts who ensure
              our content is complete and accurate.
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
                  specialty: "Pediatric Nutrition Expert",
                },
                {
                  image:
                    "https://img.freepik.com/free-photo/doctor-standing-with-folder-stethoscope_1291-16.jpg",
                  name: "Dr. Lisa Thompson",
                  specialty: "Child Psychology Expert",
                },
                {
                  image:
                    "https://img.freepik.com/free-photo/medium-shot-doctor-with-crossed-arms_23-2148868314.jpg",
                  name: "Dr. James Anderson",
                  specialty: "Pediatric Immunology",
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
                <h3>Timely</h3>
                <p>Updated regularly to reflect the latest information</p>
              </div>
            </div>

            <div className="trust-footer">
              <p>
                Read our policy and licenses. <a href="#">Read more</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Về BabyHaven</h3>
            <p>
              Chúng tôi cung cấp các sản phẩm chất lượng cao cho bé yêu của bạn
            </p>
          </div>
          <div className="footer-section">
            <h3>Liên kết nhanh</h3>
            <ul>
              <li>
                <a href="#about">Về chúng tôi</a>
              </li>
              <li>
                <a href="#products">Sản phẩm</a>
              </li>
              <li>
                <a href="#contact">Liên hệ</a>
              </li>
              <li>
                <a href="#policy">Chính sách</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Liên hệ</h3>
            <ul>
              <li>
                <i className="fas fa-phone"></i> 1900 1234
              </li>
              <li>
                <i className="fas fa-envelope"></i> info@babyhaven.com
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i> Hà Nội, Việt Nam
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Theo dõi chúng tôi</h3>
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
          <p>&copy; 2024 BabyHaven. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
