import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="homepage-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About BabyHaven</h3>
          <p>
            We are committed to providing high-quality, research-backed products
            and resources to support your parenting journey.
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
  );
}

export default Footer;
