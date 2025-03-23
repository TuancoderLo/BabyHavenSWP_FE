import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../login/ForgetPassword.css"; // Có thể sử dụng chung CSS

const VerifyEmail = () => {
  const [step, setStep] = useState(1); // 1: Nhập OTP, 2: Hoàn thành
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Email từ quá trình đăng ký (có thể nhận qua props hoặc localStorage)
  const email = localStorage.getItem("pending_email") || "";

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
    setStep(2); // Chuyển tới bước hoàn thành
  };

  // Quay về trang đăng nhập
  const handleReturnToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="forget-password-container">
      <div className="forget-password-card">
        <h2 className="forget-password-title">
          {step === 1 && "Xác thực email"}
          {step === 2 && "Hoàn tất"}
        </h2>

        {error && <div className="error-message">{error}</div>}

        {/* Bước 1: Nhập OTP */}
        {step === 1 && (
          <form onSubmit={handleOtpSubmit}>
            <p className="instruction-text">
              Mã OTP đã được gửi đến email {email} của bạn để xác thực tài
              khoản.
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
                onClick={handleReturnToLogin}
              >
                Hủy
              </button>
              <button type="submit" className="primary-button">
                Xác nhận
              </button>
            </div>
          </form>
        )}

        {/* Bước 2: Hoàn tất */}
        {step === 2 && (
          <div className="success-container">
            <div className="success-icon">✓</div>
            <p className="success-message">
              Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={handleReturnToLogin}
            >
              Đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
