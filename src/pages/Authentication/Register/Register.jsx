import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../config/firebase";
import api from "../../../config/axios";
import { sendRegistrationOTP } from "../../../services/VerifyOPT";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    name: "",
    gender: "Male",
    dateOfBirth: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleGoogleRedirect = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Thêm các tham số để tối ưu hóa popup
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);

      // Xử lý kết quả đăng nhập thành công
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      // Gọi API backend của bạn với thông tin user
      const response = await api.post("google-auth", {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
      });

      navigate("/login"); // hoặc trang bạn muốn chuyển đến
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
    }
  };

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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    if (
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.name.trim() ||
      !formData.dateOfBirth.trim() ||
      !formData.address.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      setError("All fields are required");
      return false;
    }

    if (formData.username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.phoneNumber.length !== 10) {
      setError("Phone number must be exactly 10 digits");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
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
      // Định dạng lại ngày tháng năm thành yyyy/MM/dd
      const date = new Date(formData.dateOfBirth);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}/${month}/${day}`;

      // Tạo dữ liệu đăng ký để lưu trữ
      const registrationData = {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        name: formData.name,
        gender: formData.gender,
        dateOfBirth: formattedDate, // Sử dụng định dạng năm/tháng/ngày
        address: formData.address,
        password: formData.password,
      };

      // Gửi email đến API Register để nhận OTP
      const response = await api.post("Authentication/Register", {
        email: formData.email,
      });

      console.log("API Response:", response.data);

      // Lưu thông tin đăng ký vào localStorage (bất kể kết quả API)
      localStorage.setItem("pending_email", formData.email);
      localStorage.setItem(
        "registration_data",
        JSON.stringify(registrationData)
      );

      // Kiểm tra phản hồi từ API
      if (
        response.data.status === 1 ||
        response.data.status === 200 ||
        response.status === 200
      ) {
        // Chuyển đến trang xác thực email
        navigate("/verify-email");
      } else {
        setError(
          response.data.message || "Không thể gửi OTP. Vui lòng thử lại sau."
        );
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu đăng ký:", error);

      // Kiểm tra nếu phản hồi có status 200 hoặc thông báo OTP
      if (
        error.response &&
        (error.response.status === 200 ||
          (error.response.data &&
            error.response.data.message &&
            error.response.data.message.includes("OTP")))
      ) {
        // Lưu email và chuyển trang
        localStorage.setItem("pending_email", formData.email);

        // Hiển thị thông báo OTP đã được gửi
        setError("OTP sent. Please verify your email.");

        // Thêm nút để chuyển trang
        setTimeout(() => {
          navigate("/verify-email");
        }, 1000);

        return;
      }

      if (error.response) {
        setError(
          error.response.data.message ||
            "Đăng ký thất bại. Vui lòng thử lại sau."
        );
      } else if (error.request) {
        setError("Đăng ký thất bại. Vui lòng thử lại sau.");
      } else {
        setError("Lỗi đăng ký");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Register-auth-container">
      <div className="Register-auth-left">
        <div className="Register-auth-image">
          <img
            src={
              "https://cafefcdn.com/203337114487263232/2022/1/22/shutterstock1486364633-small-1024x683-16428607564401603370314.jpg"
            }
            alt="Family enjoying time together"
          />
        </div>
      </div>

      <div className="Register-auth-right">
        <div className="Register-home-link" onClick={() => navigate("/guest")}>
          <i className="fas fa-home"></i>
        </div>
        <div className="Register-auth-box">
          <div className="Register-auth-header">
            <h1>Create Account</h1>
            <p className="Register-header-subtitle">
              Join us to discover amazing experiences
            </p>
          </div>

          {error && <div className="Register-error-message">{error}</div>}

          {/* Hiển thị nút khi đã nhận được OTP */}
          {error && error.includes("OTP sent") && (
            <div style={{ marginBottom: "15px", textAlign: "center" }}>
              <button
                type="button"
                className="primary-button"
                onClick={() => navigate("/verify-email")}
              >
                Tiếp tục xác thực email
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="Register-form-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="Register-form-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="Register-form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="Register-form-group">
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="Register-form-group">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="Register-form-group">
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="Register-form-group">
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="Register-form-group Register-password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                className="Register-password-toggle"
                onClick={togglePasswordVisibility}
              >
                <i
                  className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </span>
            </div>

            <div className="Register-form-group Register-password-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <span
                className="Register-password-toggle"
                onClick={toggleConfirmPasswordVisibility}
              >
                <i
                  className={`fas ${
                    showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                  }`}
                ></i>
              </span>
            </div>

            <button
              type="submit"
              className="Register-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>

            <div className="Register-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="Register-social-btn"
              onClick={handleGoogleRedirect}
            >
              <i className="fab fa-google"></i>
              <span>Continue with Google</span>
            </button>

            <div className="Register-toggle-form">
              Already have an account?
              <span onClick={() => navigate("/login")}>Sign in</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
