import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Guest.css";
import Logo from "../../assets/Logo.png";
import Name from "../../assets/Name.png";
import PregnancySection from "../topics/PregnancySection";
import BabySection from "../topics/BabySection";
import ToddleSection from "../topics/ToddleSection";
import ChildSection from "../topics/ChildSection";
import Packages from "../packages/Packages";

function Guest() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

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
    localStorage.clear();
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

  return (
    <div className="homepage">
      {/* Navigation */}
      <header className="homepage-header">
        <nav>
          <div className="logo">
            <img src={Logo} />
            <img src={Name} />
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
            <a href="#!" onClick={handleScrollToFeatures}>
              Features
            </a>
          </div>
          <div className="user-actions">
            <div className="join-btn" onClick={() => navigate("/register")}>
              Join
            </div>
            <button className="logout-btn" onClick={() => navigate("/login")}>
              {/* <i className="fas fa-sign-in-alt"></i> */}
              Sign Up
            </button>
          </div>
        </nav>
      </header>

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
            {/* Card 1 */}
            <a
              href="https://merinokids.co.uk/blogs/merino/the-importance-of-temperature-regulation-in-babies"
              target="_blank"
              rel="noopener noreferrer"
              className="category-card"
            >
              <img
                src="https://res.cloudinary.com/djpfqveyz/image/upload/merino-kids-all-in-one-button-through-bodysuit-misty-rose-bodysuits-misty-rose-0-3m-9420056108900-2_74b489b8-3301-46cc-a1c3-1599c2230e73_yn7j19.jpg"
                alt="Product 1"
              />
              <div className="category-content">
                <h3>The importance of temperature regulation in babies</h3>
                <div className="category-meta">
                  <span className="author">Author: Merinokids</span>
                  <span className="tag">#Health</span>
                </div>
              </div>
            </a>

            {/* Card 2 */}
            <a
              href="https://thoughtfulparent.com/what-is-positive-parenting.html"
              target="_blank"
              rel="noopener noreferrer"
              className="category-card"
            >
              <img
                src="https://res.cloudinary.com/djpfqveyz/image/upload/Copy-of-October-2020-33-1_slcseu.png"
                alt="Product 2"
              />
              <div className="category-content">
                <h3>
                  Why is Positive Parenting Important and How Does it Help My
                  Child?
                </h3>
                <div className="category-meta">
                  <span className="author">Author: thoughtfulparent</span>
                  <span className="tag">#Knowledge</span>
                </div>
              </div>
            </a>

            {/* Card 3 */}
            <a
              href="https://www.science-sparks.com/making-a-bottle-rocket/"
              target="_blank"
              rel="noopener noreferrer"
              className="category-card"
            >
              <img
                src="https://res.cloudinary.com/djpfqveyz/image/upload/Child-with-water-bottle-rocket-899x1024_oe5cal.jpg"
                alt="Breastfeeding"
              />
              <div className="category-content">
                <h3>How to make a Bottle Rocket?</h3>
                <div className="category-meta">
                  <span className="author">Author: Emma Vanstone</span>
                  <span className="tag">#Play</span>
                </div>
              </div>
            </a>

            {/* Card 4 */}
            <a
              href="https://babymori.com/blogs/baby-stories/how-to-use-a-baby-sleeping-bag"
              target="_blank"
              rel="noopener noreferrer"
              className="category-card"
            >
              <img
                src="https://res.cloudinary.com/djpfqveyz/image/upload/merino-kids-cocooi-sleeping-bag-dark-slate-sleeping-bags-dark-slate-0-3m-9420056108788-2_9873a0c6-8ba1-49b0-b17d-39d2164326d8_480x480_sdn2y2.webp"
                alt="Baby Care"
              />
              <div className="category-content">
                <h3>How to use a baby sleeping bag?</h3>
                <div className="category-meta">
                  <span className="author">Author: babymori</span>
                  <span className="tag">#Knowledge</span>
                </div>
              </div>
            </a>

            {/* Card 5 */}
            <a
              href="https://childdevelopmentinfo.com/child-psychology/"
              target="_blank"
              rel="noopener noreferrer"
              className="category-card"
            >
              <img
                src="https://res.cloudinary.com/djpfqveyz/image/upload/Depositphotos_73212229_L-1_cjcuju.jpg"
                alt="Growing Toddlers"
              />
              <div className="category-content">
                <h3>How to understand child psychology</h3>
                <div className="category-meta">
                  <span className="author">Author: Childdevelopmentinfo</span>
                  <span className="tag">#Parenting</span>
                </div>
              </div>
            </a>

            {/* Card 6 */}
            <a
              href="https://www.betterhealth.vic.gov.au/health/healthyliving/pregnancy-week-by-week"
              target="_blank"
              rel="noopener noreferrer"
              className="category-card"
            >
              <img
                src="https://res.cloudinary.com/djpfqveyz/image/upload/pregnancy_675x386_o7wbpl.jpg"
                alt="Pregnancy"
              />
              <div className="category-content">
                <h3>Pregnancy - week by week</h3>
                <div className="category-meta">
                  <span className="author">Author: Betterhealth</span>
                  <span className="tag">#Knowledge</span>
                </div>
              </div>
            </a>
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
                <h3>Track Your Child’s Growth with Confidence</h3>
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
                  alerts to address your child’s unique health and developmental
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
                  <button className="support-btn">I’m expecting</button>
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
          <PregnancySection />
          <BabySection />
          <ToddleSection />
          <ChildSection />
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
                <i className="fas fa-map-marker-alt"></i> Block E2a-7, D1 Street Saigon Hi-tech Park, Long Thanh My Ward, District 9, Ho Chi Minh City, Vietnam
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
