import React, { useState } from "react";
import "./ForgetPassword.css";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  // States để quản lý các bước trong quá trình đặt lại mật khẩu
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP, 3: Đặt mật khẩu mới, 4: Hoàn thành
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Xử lý khi submit form nhập email
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra định dạng email đơn giản
    if (!email.includes("@") || !email.includes(".")) {
      setError("Email không hợp lệ");
      return;
    }

    // Trong tương lai, ở đây sẽ gọi API để kiểm tra email
    // Giả sử email hợp lệ và chuyển sang bước tiếp theo
    setStep(2);
  };

  // Xử lý khi submit form nhập OTP
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra OTP đơn giản
    if (otp.length !== 6 || isNaN(Number(otp))) {
      setError("OTP phải có 6 chữ số");
      return;
    }

    // Trong tương lai, ở đây sẽ gọi API để xác thực OTP
    // Giả sử OTP hợp lệ
    setStep(3); // Người dùng quên mật khẩu cần đặt mật khẩu mới
  };

  // Xử lý khi submit form đặt mật khẩu mới
  const handlePasswordSubmit = (e) => {
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

    // Trong tương lai, ở đây sẽ gọi API để đặt mật khẩu mới
    // Giả sử đặt mật khẩu thành công
    setStep(4);
  };

  // Quay lại bước trước đó
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
    }
  };

  // Quay về trang đăng nhập
  const handleReturnToLogin = () => {
    navigate("/login");
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

        {error && <div className="error-message">{error}</div>}

        {/* Bước 1: Nhập email */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
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
              >
                Hủy
              </button>
              <button type="submit" className="primary-button">
                Tiếp tục
              </button>
            </div>
          </form>
        )}

        {/* Bước 2: Nhập OTP */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit}>
            <p className="instruction-text">
              Mã OTP đã được gửi đến email của bạn để đặt lại mật khẩu.
            </p>
            <div className="form-group">
              <label htmlFor="otp">Mã OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã OTP 6 chữ số"
                maxLength={6}
                required
              />
            </div>
            <div className="button-group">
              <button
                type="button"
                className="secondary-button"
                onClick={handleBack}
              >
                Quay lại
              </button>
              <button type="submit" className="primary-button">
                Xác nhận
              </button>
            </div>
          </form>
        )}

        {/* Bước 3: Đặt mật khẩu mới */}
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>
            <div className="button-group">
              <button
                type="button"
                className="secondary-button"
                onClick={handleBack}
              >
                Quay lại
              </button>
              <button type="submit" className="primary-button">
                Xác nhận
              </button>
            </div>
          </form>
        )}

        {/* Bước 4: Hoàn tất */}
        {step === 4 && (
          <div className="success-container">
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
