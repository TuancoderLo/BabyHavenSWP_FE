import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { users } from "../../data/users";
import "./Login.css";

function Login({ onLoginSuccess }) {
  console.log("Login component rendered");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Xử lý login username/password
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra form trống
    if (!formData.username || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Tìm user trong data
    const user = users.find(
      (u) =>
        u.username === formData.username && u.password === formData.password
    );

    if (user) {
      // Lưu thông tin đăng nhập
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("role", user.role);
      localStorage.setItem("username", user.username);
      localStorage.setItem("userId", user.id);

      // Cập nhật state trong App
      onLoginSuccess();

      // Chuyển hướng dựa vào role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/homepage");
      }
    } else {
      setError("Tên đăng nhập hoặc mật khẩu không đúng!");
    }
  };

  // ----- Xử lý “Redirect flow” Google OAuth -----
  // Chỉ cần 1 nút, khi bấm sẽ redirect sang BE
  const handleGoogleRedirect = () => {
    // Sửa URL cho đúng domain + port của BE
    window.location.href = "https://localhost:7279/api/GoogleAuth/signin-google";
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-image">
          <img
            src={
              "https://www.vietjack.com/tai-lieu-mon-tieng-anh/images/tu-vung-tieng-anh-ve-cac-kieu-gia-dinh-trong-tieng-anh-3461.jpeg"
            }
            alt="Family enjoying time together"
          />
        </div>
      </div>

      <div className="auth-right">
        <div className="home-link" onClick={() => navigate("/guest")}>
          <i className="fas fa-home"></i>
        </div>
        <div className="auth-box">
          <div className="auth-header">
            <h1>{"Welcome Back"}</h1>
            <p className="header-subtitle">
              {"Enter your email address to log in to your BabyHaven account"}
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              {"Log in"}
            </button>

            <div className="divider">
              <span>Or</span>
            </div>
            {/* Nút Google - Redirect sang BE */}
            <button
              type="button"
              className="social-btn google"
              onClick={handleGoogleRedirect}
            >
              <i className="fab fa-google"></i>
              <span style={{ marginLeft: "8px" }}>Login with Google</span>
            </button>

            <div className="toggle-form">
              {"First time visit?"}
              <span onClick={() => navigate("/register")}>{"Sign up"}</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
