import React, { useState, useEffect } from "react";
import "./ForgetPassword.css";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axios";

const ForgetPassword = () => {
  // States to manage the steps in the password reset process
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: Set new password, 4: Complete
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState(""); // State to store resetToken
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Display progress indicator (steps)
  const renderStepsIndicator = () => {
    return (
      <div className="steps-indicator">
        <div
          className={`step-dot ${step >= 1 ? "active" : ""} ${
            step > 1 ? "completed" : ""
          }`}
          title="Enter email"
        ></div>
        <div
          className={`step-dot ${step >= 2 ? "active" : ""} ${
            step > 2 ? "completed" : ""
          }`}
          title="Verify OTP"
        ></div>
        <div
          className={`step-dot ${step >= 3 ? "active" : ""} ${
            step > 3 ? "completed" : ""
          }`}
          title="Set new password"
        ></div>
        <div
          className={`step-dot ${step >= 4 ? "active" : ""}`}
          title="Complete"
        ></div>
      </div>
    );
  };

  // Handle email form submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Simple email format validation
    if (!email.includes("@") || !email.includes(".")) {
      setError("Invalid email format");
      return;
    }

    try {
      setIsLoading(true);
      // Call API to request password reset OTP
      const response = await api.post("Authentication/ForgetPassword", {
        email,
      });

      // Log response to see structure
      console.log("API Response:", response.data);

      // Adjust condition based on actual response structure
      if (response.data) {
        // Save email for use in later steps
        localStorage.setItem("reset_password_email", email);
        setStep(2); // Move to OTP entry step
      } else {
        setError(
          response.data.message || "Could not send OTP. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error sending OTP request:", error);
      setError(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP form submission
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Simple OTP validation
    if (otp.length !== 6 || isNaN(Number(otp))) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      setIsLoading(true);
      // Get email saved from previous step
      const storedEmail = localStorage.getItem("reset_password_email");

      // Call API to verify OTP
      const response = await api.post("Authentication/VerifyResetPasswordOtp", {
        email: storedEmail,
        otp: otp,
      });

      if (response.data.message === "OTP verified successfully.") {
        // Save resetToken for use in password reset step
        setResetToken(response.data.resetToken);
        setStep(3); // Move to new password step
      } else {
        setError(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Password validation
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      setIsLoading(true);

      // Call API to reset password using resetToken
      const response = await api.post("Authentication/ResetPassword", {
        resetToken: resetToken,
        newPassword: newPassword,
      });

      if (
        response.data.status === 1 ||
        response.data.message === "Password reset successfully."
      ) {
        // Clear saved email as it's no longer needed
        localStorage.removeItem("reset_password_email");
        setStep(4); // Move to completion step
      } else {
        setError(
          response.data.message || "Could not reset password. Please try again."
        );
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setError(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to previous step
  const handleBack = () => {
    // Handle different back logic depending on current step
    if (step === 3) {
      // From step 3 (set password) go back to step 1 (enter email)
      setStep(1);
      // Clear all data from localStorage
      localStorage.removeItem("reset_password_email");
      // Reset related states
      setOtp("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
    } else if (step === 2) {
      // From step 2 (enter OTP) go back to step 1 (enter email)
      setStep(1);
      // Clear data from localStorage
      localStorage.removeItem("reset_password_email");
      setOtp("");
    }

    // Reset error message
    setError("");
  };

  // Return to login page
  const handleReturnToLogin = () => {
    // Clear all data from localStorage before redirecting
    localStorage.removeItem("reset_password_email");
    navigate("/login");
  };

  // Toggle password visibility function
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility function
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Loại bỏ hiệu ứng tilt 3D, thay bằng hiệu ứng đơn giản hơn
  useEffect(() => {
    const card = document.querySelector(".forget-password-card");

    if (card) {
      // Loại bỏ class tilt-effect nếu có
      card.classList.remove("tilt-effect");

      // Đảm bảo các transform được reset
      card.style.transform = "none";

      // Thêm hiệu ứng hover đơn giản thông qua CSS
      card.style.transition = "box-shadow 0.3s ease";

      const handleMouseEnter = () => {
        card.style.boxShadow = "0 15px 30px rgba(0, 0, 0, 0.35)";
      };

      const handleMouseLeave = () => {
        card.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.3)";
      };

      // Thêm event listeners
      card.addEventListener("mouseenter", handleMouseEnter);
      card.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        // Cleanup event listeners
        card.removeEventListener("mouseenter", handleMouseEnter);
        card.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [step]);

  // Thay thế hiệu ứng particles bằng hiệu ứng du hành vũ trụ đơn giản hơn
  useEffect(() => {
    // Xóa particles cũ
    const particlesContainer = document.querySelector(".particles-background");
    if (!particlesContainer) return;
    particlesContainer.innerHTML = "";

    // Thêm hiệu ứng tinh vân
    const nebula = document.createElement("div");
    nebula.classList.add("nebula");
    particlesContainer.appendChild(nebula);

    // Tạo sao tĩnh - giữ lại phần này vì không phải sao băng
    const starsCount = 150; // Tăng số lượng sao để bù đắp việc không có sao băng
    for (let i = 0; i < starsCount; i++) {
      const star = document.createElement("div");

      // Kích thước ngẫu nhiên
      const size = Math.random() * 2 + 1;

      // Vị trí ngẫu nhiên
      const left = Math.random() * 100;
      const top = Math.random() * 100;

      // Độ sáng ngẫu nhiên
      const opacity = Math.random() * 0.8 + 0.2;

      // Animation delay
      const delay = Math.random() * 5;

      star.style.position = "absolute";
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.borderRadius = "50%";
      star.style.left = `${left}%`;
      star.style.top = `${top}%`;
      star.style.backgroundColor = "white";
      star.style.opacity = opacity;
      star.style.animation = `twinkle 5s ease-in-out ${delay}s infinite alternate`;

      particlesContainer.appendChild(star);
    }

    // Bỏ phần tạo sao băng
    // createShootingStars();
    // const interval = setInterval(createShootingStars, 10000);

    return () => {
      // clearInterval(interval); // Không cần nữa vì đã bỏ interval
    };
  }, []);

  // Thêm hiệu ứng ripple cho các nút
  useEffect(() => {
    const buttons = document.querySelectorAll(
      ".primary-button, .secondary-button"
    );

    const handleClick = (e) => {
      const button = e.currentTarget;

      // Tạo hiệu ứng sóng nước khi nhấn
      const ripple = document.createElement("span");
      ripple.style.position = "absolute";
      ripple.style.top = `${e.clientY - button.getBoundingClientRect().top}px`;
      ripple.style.left = `${
        e.clientX - button.getBoundingClientRect().left
      }px`;
      ripple.style.width = "0";
      ripple.style.height = "0";
      ripple.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
      ripple.style.borderRadius = "50%";
      ripple.style.transform = "translate(-50%, -50%)";
      ripple.style.animation = "ripple 0.8s linear";

      // Thêm animation
      const keyframes = `
        @keyframes ripple {
          to {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }
      `;

      const style = document.createElement("style");
      style.innerHTML = keyframes;
      document.head.appendChild(style);

      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
        style.remove();
      }, 800);
    };

    buttons.forEach((button) => {
      button.addEventListener("click", handleClick);
    });

    return () => {
      buttons.forEach((button) => {
        button.removeEventListener("click", handleClick);
      });
    };
  }, [step]);

  return (
    <div className="forget-password-container">
      {/* Thay đổi nền để phù hợp với Register.jsx */}
      <div className="forget-password-card">
        <h2 className="forget-password-title">
          {step === 1 && "Forgot Password"}
          {step === 2 && "Verify OTP"}
          {step === 3 && "Reset Password"}
          {step === 4 && "Complete"}
        </h2>

        {step < 4 && renderStepsIndicator()}

        {error && <div className="error-message">{error}</div>}

        {/* Step 1: Enter email */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="form-transition">
            <p className="instruction-text">
              Enter your email to receive an OTP for password reset.
            </p>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="button-group">
              <button
                type="button"
                className="secondary-button"
                onClick={handleReturnToLogin}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>
                    Processing <span className="loading-dots">...</span>
                  </span>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="form-transition">
            <p className="instruction-text">
              OTP has been sent to <strong>{email}</strong>. <br />
              Please check your inbox and enter the verification code.
            </p>
            <div className="form-group">
              <label htmlFor="otp">OTP Code</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                autoComplete="off"
              />
            </div>
            <div className="button-group">
              <button
                type="button"
                className="secondary-button"
                onClick={handleBack}
                disabled={isLoading}
              >
                Back
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>
                    Processing <span className="loading-dots">...</span>
                  </span>
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Set new password */}
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="form-transition">
            <p className="instruction-text">
              Create a new password for your account.
            </p>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                />
                <span
                  className="password-toggle-icon"
                  onClick={togglePasswordVisibility}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
                <span
                  className="password-toggle-icon"
                  onClick={toggleConfirmPasswordVisibility}
                  title={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </span>
              </div>
            </div>
            <div className="button-group">
              <button
                type="button"
                className="secondary-button"
                onClick={handleBack}
                disabled={isLoading}
              >
                Back
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>
                    Processing <span className="loading-dots">...</span>
                  </span>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Completion */}
        {step === 4 && (
          <div className="success-container form-transition">
            <div className="success-icon">✓</div>
            <p className="success-message">
              Password reset successful! You can now log in with your new
              password.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={handleReturnToLogin}
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
