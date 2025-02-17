import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { users } from "../../data/users";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleGoogleRedirect = () => {
    // Sửa URL cho đúng domain + port của BE
    window.location.href = "https://localhost:7279/api/GoogleAuth/signin-google";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra form trống
    const {
      firstName,
      lastName,
      email,
      phone,
      username,
      password,
      confirmPassword,
    } = formData;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !username ||
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
    if (!phoneRegex.test(phone)) {
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
      phone,
      firstName,
      lastName,
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
            <h1>{"Start your journey here"}</h1>
            <p className="header-subtitle">
              {"Come and discovering new adventures with your little one"}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {
              <div className="name-group">
                <div className="form-group">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            }

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder={"Enter your email"}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {
              <div className="form-group phone-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <span className="country-code">+84</span>
              </div>
            }

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

            {
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            }

            {
              <div className="form-options">
                <a href="#" className="forgot-password">
                  Forgot password?
                </a>
              </div>
            }

            <button type="submit" className="submit-btn">
              {"Sign up"}
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
              {"Already a member?"}
              <span onClick={() => navigate("/login")}>{"Log in"}</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
