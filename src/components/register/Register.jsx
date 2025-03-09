import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../config/firebase";
import api from "../../config/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    name: "",
    gender: "Male",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });

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

      toast.success("Đăng nhập Google thành công!");
      navigate("/login"); // hoặc trang bạn muốn chuyển đến
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
      toast.error("Đăng nhập Google thất bại: " + error.message);
    }
  };

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Tạo object mới không bao gồm confirmPassword
      const submitData = {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        name: formData.name,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        password: formData.password,
      };

      const response = await api.post("register", submitData);
      toast.success("Đăng ký thành công!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại!");
    }

    // Kiểm tra form trống
    const {
      username,
      email,
      phoneNumber,
      name,
      dateOfBirth,
      password,
      confirmPassword,
    } = formData;
    if (
      !username ||
      !email ||
      !phoneNumber ||
      !name ||
      !dateOfBirth ||
      !password ||
      !confirmPassword
    ) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ!");
      return;
    }

    // Kiểm tra định dạng số điện thoại
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Số điện thoại không hợp lệ!");
      return;
    }

    // Kiểm tra mật khẩu
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Kiểm tra username đã tồn tại
    const userExists = users.find((u) => u.username === username);
    if (userExists) {
      setError("Tên đăng nhập đã tồn tại!");
      return;
    }

    // Thêm user mới
    const newUser = {
      id: users.length + 1,
      username,
      password,
      email,
      phone: phoneNumber,
      firstName: name.split(" ")[0],
      lastName: name.split(" ")[1],
      role: "user",
    };
    users.push(newUser);

    // Chuyển đến trang đăng nhập
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-image">
          <img
            src={
              "https://cafefcdn.com/203337114487263232/2022/1/22/shutterstock1486364633-small-1024x683-16428607564401603370314.jpg"
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
            <h1>Create Account</h1>
            <p className="header-subtitle">
              Join us to discover amazing experiences
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
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

            <div className="form-group">
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn">
              Sign Up
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="social-btn"
              onClick={handleGoogleRedirect}
            >
              <i className="fab fa-google"></i>
              <span>Continue with Google</span>
            </button>

            <div className="toggle-form">
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
