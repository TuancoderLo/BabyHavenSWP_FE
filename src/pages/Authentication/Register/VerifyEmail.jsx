import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./VerifyEmail.css"; // Using separate CSS file
import api from "../../../config/axios";
import { clearTemporaryData } from "../../../utils/authUtils";

const VerifyEmail = () => {
  const [step, setStep] = useState(1); // 1: Enter OTP, 2: Completed
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [icons, setIcons] = useState([]);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  // Email from registration process
  const email = localStorage.getItem("pending_email") || "";

  useEffect(() => {
    // Get registration data from localStorage
    const storedData = localStorage.getItem("registration_data");
    if (storedData) {
      setRegistrationData(JSON.parse(storedData));
    } else {
      // If no data, redirect to registration page
      navigate("/register");
    }
  }, [navigate]);

  // Handle OTP form submission
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6 || isNaN(Number(otp))) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      setIsLoading(true);

      const email = localStorage.getItem("pending_email");
      const userData = JSON.parse(localStorage.getItem("registration_data"));

      if (!userData || !email) {
        setError("Registration information not found!");
        setIsLoading(false);
        return;
      }

      const verifyData = {
        email: userData.email || email,
        username: userData.username || "",
        phoneNumber: userData.phoneNumber || "",
        name: userData.name || "",
        gender: userData.gender || "",
        dateOfBirth: userData.dateOfBirth || "",
        address: userData.address || "",
        password: userData.password || "",
      };

      // Bước 1: Verify OTP
      const verifyResponse = await api.post(
        `Authentication/VerifyRegistrationOtp?otp=${otp}`,
        verifyData
      );

      // Kiểm tra response và lấy userId
      if (verifyResponse.data.userId) {
        // Bước 2: Tạo member mới với userId
        const memberResponse = await api.post("Members", {
          userId: verifyResponse.data.userId,
        });

        if (memberResponse.data.status === 1) {
          setIsSuccess(true);
          localStorage.removeItem("registration_data");
          localStorage.removeItem("pending_email");
        } else {
          setError("Failed to create member profile. Please try again.");
        }
      } else {
        setError("Invalid verification response. Please try again.");
      }
    } catch (error) {
      console.error("Error in registration process:", error);

      if (error.response?.status === 400) {
        setError("Invalid verification data. Please check your information.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          error.response?.data?.message ||
            "An error occurred. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      setResendDisabled(true);
      setCountdown(60);

      // Get email from localStorage
      const email = localStorage.getItem("pending_email");

      if (!email) {
        setError("Email information not found!");
        setIsLoading(false);
        setResendDisabled(false);
        return;
      }

      // THAY ĐỔI: Gọi đúng API chỉ với email để yêu cầu OTP mới
      const response = await api.post("Authentication/Register", {
        email: email,
      });

      if (response.data.status === 1) {
        setError(""); // Clear error message (if any)
      } else {
        setError(
          response.data.message || "Cannot resend OTP. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setError(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown timer for resend button
  useEffect(() => {
    let intervalId;

    if (countdown > 0) {
      intervalId = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            setResendDisabled(false);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [countdown]);

  // Return to login page
  const handleReturnToLogin = () => {
    clearTemporaryData(["registration", "verification"], navigate, "/login");
  };

  // Handle OTP input
  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  // Generate floating icons when component mounts
  useEffect(() => {
    if (containerRef.current) {
      generateFloatingIcons();
    }
    // Cleanup on unmount
    return () => {
      setIcons([]);
    };
  }, []);

  // Function to generate snow flakes
  const generateFloatingIcons = () => {
    const numberOfSnowflakes = 50; // Nhiều bông tuyết hơn
    const newIcons = [];

    for (let i = 0; i < numberOfSnowflakes; i++) {
      newIcons.push({
        id: `snowflake-${i}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${5 + Math.random() * 15}px`, // Kích thước đa dạng
        fallDuration: `${7 + Math.random() * 15}s`, // Thời gian rơi
        shakeDuration: `${2 + Math.random() * 4}s`, // Thời gian lắc lư
        windShift: `${-50 + Math.random() * 100}px`, // Dịch chuyển ngang do gió
        shakeDistance: `${2 + Math.random() * 6}px`, // Khoảng cách lắc
        delay: `${Math.random() * 10}s`, // Thời gian delay
        opacity: 0.2 + Math.random() * 0.8, // Độ trong suốt
      });
    }

    setIcons(newIcons);
  };

  return (
    <div className="verify-email-container" ref={containerRef}>
      {/* Add floating icons */}
      <div className="floating-icons">
        {icons.map((icon) => (
          <div
            key={icon.id}
            className="floating-email-icon"
            style={{
              left: icon.left,
              top: icon.top,
              width: icon.size,
              height: icon.size,
              "--fall-duration": icon.fallDuration,
              "--shake-duration": icon.shakeDuration,
              "--wind-shift": icon.windShift,
              "--shake-distance": icon.shakeDistance,
              "--delay": icon.delay,
              "--opacity": icon.opacity,
              "--size": icon.size,
              animationDelay: icon.delay,
            }}
          />
        ))}
      </div>

      <div className="verify-email-card">
        <h2 className="verify-email-title">
          {isSuccess ? "Completed" : "Email Verification"}
        </h2>

        {error && !isSuccess && (
          <div className="verify-email-error-message">{error}</div>
        )}

        {/* Nếu thành công, hiển thị thông báo thành công */}
        {isSuccess ? (
          <div className="verify-email-success-container">
            <div className="verify-email-success-icon">✓</div>
            <p className="verify-email-success-message">
              Congratulations! Your account has been successfully registered.
              You can login now to use our services.
            </p>
            <button
              type="button"
              className="verify-email-primary-button"
              onClick={handleReturnToLogin}
            >
              Login Now
            </button>
          </div>
        ) : (
          /* Step 1: Enter OTP */
          <form onSubmit={handleOtpSubmit}>
            <p className="verify-email-instruction-text">
              Please enter the 6-digit verification code sent to your email{" "}
              <strong>{email}</strong> to complete your account registration.
            </p>
            <div className="verify-email-form-group">
              <label htmlFor="otp">Verification Code</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
                className="verify-email-otp-input"
                autoComplete="off"
              />
            </div>

            <p className="verify-email-resend-link">
              Didn't receive the code?
              <button
                type="button"
                onClick={handleResendOtp}
                className="verify-email-resend-button"
                disabled={isLoading || resendDisabled}
              >
                {resendDisabled ? `Resend code (${countdown}s)` : "Resend code"}
              </button>
            </p>

            <div className="verify-email-button-group">
              <button
                type="button"
                className="verify-email-secondary-button"
                onClick={handleReturnToLogin}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="verify-email-primary-button"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
