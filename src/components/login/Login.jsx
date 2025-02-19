import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { users } from "../../data/users";
import "./Login.css";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../config/firebase";
import api from "../../config/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";

function Login({ onLoginSuccess }) {
  console.log("Login component rendered");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return false;
    }

    if (formData.email.trim().length < 3) {
      setError("Tên đăng nhập/Email phải có ít nhất 3 ký tự!");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("Login", formData);
      console.log("Response:", response.data);

      if (response.data.status === 1) {
        // Debug để xem cấu trúc data
        console.log("JWT Token:", response.data.data);
        console.log("JWT Token type:", typeof response.data.data);

        // Lấy JWT token từ response và đảm bảo là string
        const jwtToken = response.data.data.toString();

        // Lưu JWT token
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("isAuthenticated", "true");

        try {
          // Decode token với xử lý lỗi
          const tokenPayload = jwtDecode(jwtToken);
          console.log("Token Payload:", tokenPayload);

          // Lưu thông tin từ token payload
          localStorage.setItem("email", tokenPayload.email);
          localStorage.setItem("role", tokenPayload.roleId);
          localStorage.setItem("userId", tokenPayload.userId);

          // Cập nhật state trong App
          onLoginSuccess();

          // Thông báo thành công
          toast.success("Đăng nhập thành công!");

          // Chuyển hướng dựa vào role
          switch (tokenPayload.roleId) {
            case "3":
              navigate("/admin");
              break;
            case "2":
              navigate("/doctor");
              break;
            case "1":
            default:
              navigate("/homepage");
              break;
          }
        } catch (tokenError) {
          console.error("Token decode error:", tokenError);
          setError("Lỗi xử lý token. Vui lòng thử lại!");
          toast.error("Lỗi xử lý token. Vui lòng thử lại!");
        }
      } else {
        setError(response.data.message || "Đăng nhập thất bại!");
        toast.error(response.data.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.log("Error Details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      if (error.response) {
        const errorMessage =
          error.response.data.message || "Đăng nhập thất bại!";
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (error.request) {
        const errorMessage =
          "Không thể kết nối đến server. Vui lòng thử lại sau!";
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        const errorMessage = "Có lỗi xảy ra khi đăng nhập!";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRedirect = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const googleToken = result.user.accessToken;
      const response = await api.post("auth/google", {
        token: googleToken,
        email: result.user.email,
        displayName: result.user.displayName,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("role", user.role);
      localStorage.setItem("username", user.username);
      localStorage.setItem("userId", user.id);

      onLoginSuccess();
      navigate("/homepage");
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "Đăng nhập Google thất bại!");
      } else {
        setError("Đăng nhập bằng Google thất bại. Vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
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
                name="email"
                placeholder="Enter your email or username"
                value={formData.email}
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

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="divider">
              <span>Hoặc</span>
            </div>

            <button
              type="button"
              className="social-btn google"
              onClick={handleGoogleRedirect}
              disabled={isLoading}
            >
              <i className="fab fa-google"></i>
              <span style={{ marginLeft: "8px" }}>
                {isLoading ? "Đang xử lý..." : "Đăng nhập với Google"}
              </span>
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
