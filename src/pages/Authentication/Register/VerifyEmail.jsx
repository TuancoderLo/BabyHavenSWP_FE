import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Login/ForgetPassword.css"; // Sửa lại đường dẫn chính xác
import api from "../../../config/axios";

const VerifyEmail = () => {
  const [step, setStep] = useState(1); // 1: Nhập OTP, 2: Hoàn thành
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const navigate = useNavigate();

  // Email từ quá trình đăng ký
  const email = localStorage.getItem("pending_email") || "";

  useEffect(() => {
    // Lấy dữ liệu đăng ký từ localStorage
    const storedData = localStorage.getItem("registration_data");
    if (storedData) {
      setRegistrationData(JSON.parse(storedData));
    } else {
      // Nếu không có dữ liệu, chuyển hướng về trang đăng ký
      navigate("/register");
    }
  }, [navigate]);

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

      // Lấy email và dữ liệu đăng ký từ localStorage
      const email = localStorage.getItem("pending_email");
      const userData = JSON.parse(localStorage.getItem("registration_data"));

      if (!userData || !email) {
        setError("Không tìm thấy thông tin đăng ký!");
        setIsLoading(false);
        return;
      }

      // Gọi API để xác thực OTP và hoàn tất đăng ký
      const verifyData = {
        email: email,
        otp: otp,
        username: userData.username,
        phoneNumber: userData.phoneNumber,
        name: userData.name,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        address: userData.address || "",
        password: userData.password,
      };

      const response = await api.post(
        "Authentication/VerifyRegistrationOtp",
        verifyData
      );

      if (response.data.status === 1) {
        // Xác thực thành công, tài khoản đã được tạo
        // Xóa dữ liệu đăng ký tạm thời
        localStorage.removeItem("registration_data");
        localStorage.removeItem("pending_email");

        setStep(2); // Chuyển tới bước hoàn thành
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
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Xác nhận"}
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
