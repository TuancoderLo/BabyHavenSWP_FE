import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import api from "../../../config/axios";
import { sendRegistrationOTP } from "../../../services/VerifyOPT";

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
    setIsLoading(true);

    try {
      // Gửi yêu cầu đến backend để lấy URL Google login
      // Redirect người dùng đến Google login
      window.location.href =
        "https://babyhaven-swp-a3f2frh5g4gtf4ee.southeastasia-01.azurewebsites.net/api/GoogleAuth/signin-google";
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special check for phoneNumber field
    if (name === "phoneNumber" && !/^\d*$/.test(value)) {
      return; // Don't update state if non-numeric characters
    }

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

    if (!/^\d{10,11}$/.test(formData.phoneNumber)) {
      setError("Phone number must be 10 or 11 digits");
      return false;
    }

    // Check age (must be 18+)
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      setError("You must be at least 18 years old to register");
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
      // Format date to yyyy/MM/dd
      const date = new Date(formData.dateOfBirth);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}/${month}/${day}`;

      // Create registration data for storage
      const registrationData = {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        name: formData.name,
        gender: formData.gender,
        dateOfBirth: formattedDate,
        address: formData.address,
        password: formData.password,
      };

      // Send email to Register API to receive OTP
      const response = await api.post("Authentication/Register", {
        email: formData.email,
      });

      console.log("API Response:", response.data);

      // Save registration info to localStorage
      localStorage.setItem("pending_email", formData.email);
      localStorage.setItem(
        "registration_data",
        JSON.stringify(registrationData)
      );

      if (
        response.data.status === 1 ||
        response.data.status === 200 ||
        response.status === 200
      ) {
        navigate("/verify-email");
      } else {
        setError(
          response.data.message || "Cannot send OTP. Please try again later."
        );
      }
    } catch (error) {
      console.error("Registration request error:", error);

      if (
        error.response &&
        (error.response.status === 200 ||
          (error.response.data &&
            error.response.data.message &&
            error.response.data.message.includes("OTP")))
      ) {
        localStorage.setItem("pending_email", formData.email);
        setError("OTP sent. Please verify your email.");
        setTimeout(() => {
          navigate("/verify-email");
        }, 1000);
        return;
      }

      if (error.response) {
        setError(
          error.response.data.message ||
            "Registration failed. Please try again later."
        );
      } else if (error.request) {
        setError("Registration failed. Please try again later.");
      } else {
        setError("Registration Error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Register-auth-container">
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

        {error && error.includes("OTP sent") && (
          <div style={{ marginBottom: "15px", textAlign: "center" }}>
            <button
              type="button"
              className="primary-button"
              onClick={() => navigate("/verify-email")}
            >
              Continue to email verification
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="Register-form-container">
            <div className="Register-form-group half-width">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="Register-form-group half-width">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="Register-form-group half-width">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="Register-form-group half-width">
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength="11"
                required
              />
            </div>

            <div className="Register-form-group half-width">
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

            <div className="Register-form-group half-width">
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                max={(() => {
                  const date = new Date();
                  date.setFullYear(date.getFullYear() - 18);
                  return date.toISOString().split("T")[0];
                })()}
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

            <div className="Register-form-group half-width">
              <div className="Register-password-group">
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
                    className={`fas ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </span>
              </div>
            </div>

            <div className="Register-form-group half-width">
              <div className="Register-password-group">
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
            </div>
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
  );
}

export default Register;
