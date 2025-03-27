import React, { useState } from "react";
import "./ForgetPassword.css";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axios";

const ForgetPassword = () => {
  // States để quản lý các bước trong quá trình đặt lại mật khẩu
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP, 3: Đặt mật khẩu mới, 4: Hoàn thành
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState(""); // Thêm state để lưu trữ resetToken
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Hiển thị chỉ báo tiến trình (bước)
  const renderStepsIndicator = () => {
    return (
      <div className="steps-indicator">
        <div
          className={`step-dot ${step >= 1 ? "active" : ""} ${
            step > 1 ? "completed" : ""
          }`}
          title="Nhập email"
        ></div>
        <div
          className={`step-dot ${step >= 2 ? "active" : ""} ${
            step > 2 ? "completed" : ""
          }`}
          title="Xác thực OTP"
        ></div>
        <div
          className={`step-dot ${step >= 3 ? "active" : ""} ${
            step > 3 ? "completed" : ""
          }`}
          title="Đặt mật khẩu mới"
        ></div>
        <div
          className={`step-dot ${step >= 4 ? "active" : ""}`}
          title="Hoàn tất"
        ></div>
      </div>
    );
  };

  // Xử lý khi submit form nhập email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra định dạng email đơn giản
    if (!email.includes("@") || !email.includes(".")) {
      setError("Email không hợp lệ");
      return;
    }

    try {
      setIsLoading(true);
      // Gọi API để yêu cầu OTP đặt lại mật khẩu
      const response = await api.post("Authentication/ForgetPassword", {
        email,
      });

      // Log response để xem cấu trúc
      console.log("API Response:", response.data);

      // Điều chỉnh điều kiện dựa trên cấu trúc phản hồi thực tế
      if (response.data) {
        // Lưu email để sử dụng ở các bước sau
        localStorage.setItem("reset_password_email", email);
        setStep(2); // Chuyển sang bước nhập OTP
      } else {
        setError(
          response.data.message || "Không thể gửi OTP. Vui lòng thử lại sau."
        );
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu OTP:", error);
      setError(
        error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý khi submit form nhập OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra OTP đơn giản
    if (otp.length !== 6 || isNaN(Number(otp))) {
      setError("OTP phải có 6 chữ số");
      return;
    }

    try {
      setIsLoading(true);
      // Lấy email đã lưu từ bước trước
      const storedEmail = localStorage.getItem("reset_password_email");

      // Gọi API để xác thực OTP
      const response = await api.post("Authentication/VerifyResetPasswordOtp", {
        email: storedEmail,
        otp: otp,
      });

      if (response.data.message === "OTP verified successfully.") {
        // Lưu resetToken để sử dụng trong bước đặt lại mật khẩu
        setResetToken(response.data.resetToken);
        setStep(3); // Chuyển sang bước đặt mật khẩu mới
      } else {
        setError(
          response.data.message || "Mã OTP không hợp lệ. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("Lỗi khi xác thực OTP:", error);
      setError(
        error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý khi submit form đặt mật khẩu mới
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra mật khẩu
    if (newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setIsLoading(true);

      // Gọi API để đặt lại mật khẩu sử dụng resetToken
      const response = await api.post("Authentication/ResetPassword", {
        resetToken: resetToken,
        newPassword: newPassword,
      });

      if (
        response.data.status === 1 ||
        response.data.message === "Password reset successfully."
      ) {
        // Xóa email đã lưu vì không cần nữa
        localStorage.removeItem("reset_password_email");
        setStep(4); // Chuyển sang bước hoàn thành
      } else {
        setError(
          response.data.message ||
            "Không thể đặt lại mật khẩu. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("Lỗi khi đặt lại mật khẩu:", error);
      setError(
        error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Quay lại bước trước đó
  const handleBack = () => {
    // Xử lý logic quay lại khác nhau tùy theo bước hiện tại
    if (step === 3) {
      // Từ bước 3 (đặt mật khẩu) quay thẳng về bước 1 (nhập email)
      setStep(1);
      // Xóa tất cả dữ liệu từ localStorage
      localStorage.removeItem("reset_password_email");
      // Reset các state liên quan
      setOtp("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
    } else if (step === 2) {
      // Từ bước 2 (nhập OTP) quay về bước 1 (nhập email)
      setStep(1);
      // Xóa dữ liệu từ localStorage
      localStorage.removeItem("reset_password_email");
      setOtp("");
    }

    // Reset thông báo lỗi
    setError("");
  };

  // Quay về trang đăng nhập
  const handleReturnToLogin = () => {
    // Xóa tất cả dữ liệu từ localStorage trước khi chuyển hướng
    localStorage.removeItem("reset_password_email");
    navigate("/login");
  };

  // Hàm toggle hiển thị mật khẩu
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Hàm toggle hiển thị mật khẩu xác nhận
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="forget-password-container">
      <div className="forget-password-card">
        <h2 className="forget-password-title">
          {step === 1 && "Quên mật khẩu"}
          {step === 2 && "Xác thực OTP"}
          {step === 3 && "Đặt lại mật khẩu"}
          {step === 4 && "Hoàn tất"}
        </h2>

        {step < 4 && renderStepsIndicator()}

        {error && <div className="error-message">{error}</div>}

        {/* Bước 1: Nhập email */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="form-transition">
            <p className="instruction-text">
              Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
            </p>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
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
                Hủy
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>
                    Đang xử lý <span className="loading-dots">...</span>
                  </span>
                ) : (
                  "Tiếp tục"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Bước 2: Nhập OTP */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="form-transition">
            <p className="instruction-text">
              Mã OTP đã được gửi đến email <strong>{email}</strong>. <br />
              Vui lòng kiểm tra hộp thư đến và nhập mã xác thực.
            </p>
            <div className="form-group">
              <label htmlFor="otp">Mã OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Nhập mã 6 chữ số"
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
                Quay lại
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>
                    Đang xử lý <span className="loading-dots">...</span>
                  </span>
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Bước 3: Đặt mật khẩu mới */}
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="form-transition">
            <p className="instruction-text">
              Tạo mật khẩu mới cho tài khoản của bạn.
            </p>
            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  required
                />
                <span
                  className="password-toggle-icon"
                  onClick={togglePasswordVisibility}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
                <span
                  className="password-toggle-icon"
                  onClick={toggleConfirmPasswordVisibility}
                  title={
                    showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
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
                Quay lại
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>
                    Đang xử lý <span className="loading-dots">...</span>
                  </span>
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Bước 4: Hoàn tất */}
        {step === 4 && (
          <div className="success-container form-transition">
            <div className="success-icon">✓</div>
            <p className="success-message">
              Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu
              mới.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={handleReturnToLogin}
            >
              Quay lại đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
