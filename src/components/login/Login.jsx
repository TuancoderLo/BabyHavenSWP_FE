import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import api from "../../config/axios";
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
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email and Password is required");
      return false;
    }

    if (formData.email.trim().length < 3) {
      setError("Email must be at least 3 characters long!");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long!");
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
      const response = await api.post("Authentication/Login", formData);
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

          // Lưu role từ http://schemas.microsoft.com/ws/2008/06/identity/claims/role
          const user = {
            roleId:
              tokenPayload[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ],
            email:
              tokenPayload[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
              ],
            name: tokenPayload[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            ],
            userId:
              tokenPayload[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
              ],
          };

          if (user.roleId === "1") {
            //Nếu là role member thì lưu memberId vào localStorage
            try {
              const member = await api.get("Members/member/" + user.userId);
              localStorage.setItem("memberId", member.data.data.memberId);
            } catch (error) {
              console.error("Error fetching member:", error);
            }
          }

          localStorage.setItem("role", user.roleId);

          // Lưu thông tin từ token payload
          localStorage.setItem("email", user.email);
          localStorage.setItem("userId", user.userId);
          localStorage.setItem("name", user.name);

          // const request = await api.get(`Member/${user.userId}`);
          // const member = request.data;
          // localStorage.setItem("memberId", member.id);

          onLoginSuccess();

          // Chuyển hướng dựa vào role
          switch (user.roleId) {
            case "3":
              navigate("/admin");
              break;
            case "2":
              navigate("/doctor");
              break;
            case "1":
              navigate("/homepage");
              break;
          }
        } catch (tokenError) {
          console.error("Token decode error:", tokenError);
          setError("Token decode error. Please try again later.");
        }
      } else {
        setError(
          response.data.message || "Login failed. Please try again later."
        );
      }
    } catch (error) {
      console.log("Error Details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      if (error.response) {
        const errorMessage =
          error.response.data.message ||
          "Login failed. Please try again later.";
        setError(errorMessage);
      } else if (error.request) {
        const errorMessage = "Login failed. Please try again later.";
        setError(errorMessage);
      } else {
        const errorMessage = "Login error";
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRedirect = async () => {
    setIsLoading(true);

    try {
      // Gửi yêu cầu đến backend để lấy URL Google login
      // Redirect người dùng đến Google login
      window.location.href =
        "https://localhost:7279/api/GoogleAuth/signin-google";
    } catch (error) {
      // Xử lý lỗi nếu có
      if (error.response) {
        setError(error.response.data.message || "Error while Signing In");
      } else {
        setError("Sign in with Google failed. Please try again later.");
      }
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
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                <i
                  className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </span>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Loading..." : "Sign in"}
            </button>

            <div className="divider">
              <span>Or</span>
            </div>

            <button
              className="social-btn google"
              onClick={handleGoogleRedirect}
              disabled={isLoading}
            >
              <i className="fab fa-google"></i>
              <span style={{ marginLeft: "8px" }}>
                {isLoading ? "Loading..." : "Sign in with Google"}
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
