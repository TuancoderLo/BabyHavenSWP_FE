import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./VerifyEmail.css"; // Sử dụng file CSS riêng
import api from "../../../config/axios";

const VerifyEmail = () => {
  const [step, setStep] = useState(1); // 1: Nhập OTP, 2: Hoàn thành
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [remainingTime, setRemainingTime] = useState(60); // Giảm xuống 1 phút (60 giây)
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

  // Đếm ngược thời gian OTP - giảm xuống còn 1 phút
  useEffect(() => {
    if (step === 1 && remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(remainingTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (step === 1 && remainingTime <= 0) {
      // Khi thời gian OTP hết hạn (đạt 0), đợi 2 giây và chuyển hướng
      const redirectTimer = setTimeout(() => {
        // Hiển thị thông báo
        setError(
          "Thời gian nhập OTP đã hết. Hệ thống sẽ chuyển hướng về trang đăng ký."
        );

        // Đợi 2 giây trước khi chuyển hướng
        setTimeout(() => {
          // Xóa dữ liệu đăng ký tạm thời
          localStorage.removeItem("registration_data");
          localStorage.removeItem("pending_email");
          // Chuyển hướng về trang đăng ký
          navigate("/register");
        }, 2000);
      }, 500);

      return () => clearTimeout(redirectTimer);
    }
  }, [remainingTime, step, navigate]);

  // Format thời gian đếm ngược
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Kiểm tra nếu thời gian sắp hết
  const isTimeExpiring = remainingTime <= 20; // 20 giây cuối cho thời gian 1 phút

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

      // Cấu trúc lại dữ liệu theo đúng định dạng mà API yêu cầu
      const verifyData = {
        email: userData.email,
        username: userData.username,
        phoneNumber: userData.phoneNumber,
        name: userData.name,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        address: userData.address,
        password: userData.password,
        otp: otp,
      };

      console.log("Sending verification data:", verifyData);

      // Gọi API để xác thực OTP và hoàn tất đăng ký
      const response = await api.post(
        `Authentication/VerifyRegistrationOtp?otp=${otp}`,
        verifyData
      );

      console.log("Verification response:", response.data);

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

        // Nếu nhập sai OTP và còn ít thời gian (dưới 10 giây), tự động chuyển về trang đăng ký
        if (remainingTime <= 10) {
          setTimeout(() => {
            setError(
              "Thời gian xác thực đã gần hết. Hệ thống sẽ chuyển hướng về trang đăng ký."
            );

            setTimeout(() => {
              localStorage.removeItem("registration_data");
              localStorage.removeItem("pending_email");
              navigate("/register");
            }, 2000);
          }, 500);
        }
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

  // Gửi lại OTP
  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      const userData = JSON.parse(localStorage.getItem("registration_data"));

      // Gọi API để gửi lại OTP
      const response = await api.post("Authentication/ResendOtp", {
        email: userData.email,
      });

      if (response.data.status === 1) {
        setRemainingTime(60); // Reset thời gian thành 1 phút
        setError(""); // Xóa thông báo lỗi (nếu có)
      } else {
        setError(
          response.data.message ||
            "Không thể gửi lại OTP. Vui lòng thử lại sau."
        );
      }
    } catch (error) {
      console.error("Lỗi khi gửi lại OTP:", error);
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

  // Xử lý khi người dùng nhập OTP
  const handleOtpChange = (e) => {
    // Nếu OTP đã hết hạn, không cho phép nhập
    if (remainingTime <= 0) {
      setError(
        "Thời gian nhập OTP đã hết. Vui lòng đợi hệ thống chuyển hướng về trang đăng ký."
      );
      return;
    }

    setOtp(e.target.value);
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <h2 className="verify-email-title">
          {step === 1 && "Xác thực email"}
          {step === 2 && "Hoàn tất"}
        </h2>

        {error && <div className="error-message">{error}</div>}

        {/* Bước 1: Nhập OTP */}
        {step === 1 && (
          <form onSubmit={handleOtpSubmit}>
            <p className="instruction-text">
              Vui lòng nhập mã xác thực gồm 6 chữ số đã được gửi đến email{" "}
              <strong>{email}</strong> của bạn để hoàn tất việc đăng ký tài
              khoản. Bạn có <strong>1 phút</strong> để nhập mã xác thực.
              {remainingTime <= 20 && (
                <span className="warning-text">
                  <br />
                  Thời gian nhập mã sắp hết! Vui lòng nhập nhanh.
                </span>
              )}
            </p>
            <div className="form-group">
              <label htmlFor="otp">Mã xác thực</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Nhập mã OTP 6 chữ số"
                maxLength={6}
                required
                className="otp-input"
                autoComplete="off"
                disabled={remainingTime <= 0}
              />
            </div>

            <p className={`time-remaining ${isTimeExpiring ? "expiring" : ""}`}>
              Thời gian còn lại: {formatTime(remainingTime)}
            </p>

            {remainingTime <= 0 ? (
              <p className="expired-message">
                Thời gian nhập mã đã hết. Đang chuyển hướng về trang đăng ký...
              </p>
            ) : remainingTime <= 20 ? (
              <p className="resend-link urgent">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="resend-button urgent"
                  disabled={isLoading}
                >
                  Gửi lại mã ngay
                </button>
              </p>
            ) : (
              <p className="resend-link">
                Không nhận được mã?
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="resend-button"
                  disabled={isLoading}
                >
                  Gửi lại mã
                </button>
              </p>
            )}

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
                disabled={isLoading || remainingTime <= 0}
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
              Chúc mừng! Bạn đã đăng ký tài khoản thành công. Giờ đây bạn có thể
              đăng nhập để sử dụng các dịch vụ của chúng tôi.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={handleReturnToLogin}
            >
              Đăng nhập ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
