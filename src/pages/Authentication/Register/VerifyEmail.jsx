import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./VerifyEmail.css"; // Using separate CSS file
import api from "../../../config/axios";

const VerifyEmail = () => {
  const [step, setStep] = useState(1); // 1: Enter OTP, 2: Completed
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [remainingTime, setRemainingTime] = useState(60); // Reduced to 1 minute (60 seconds)
  const navigate = useNavigate();

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

  // OTP countdown timer - reduced to 1 minute
  useEffect(() => {
    if (step === 1 && remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(remainingTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (step === 1 && remainingTime <= 0) {
      // When OTP time expires (reaches 0), wait 2 seconds and redirect
      const redirectTimer = setTimeout(() => {
        // Display notification
        setError(
          "OTP entry time has expired. The system will redirect you to the registration page."
        );

        // Wait 2 seconds before redirecting
        setTimeout(() => {
          // Remove temporary registration data
          localStorage.removeItem("registration_data");
          localStorage.removeItem("pending_email");
          // Redirect to registration page
          navigate("/register");
        }, 2000);
      }, 500);

      return () => clearTimeout(redirectTimer);
    }
  }, [remainingTime, step, navigate]);

  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Check if time is about to expire
  const isTimeExpiring = remainingTime <= 20; // Last 20 seconds for 1 minute time

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

      // Get email and registration data from localStorage
      const email = localStorage.getItem("pending_email");
      const userData = JSON.parse(localStorage.getItem("registration_data"));

      if (!userData || !email) {
        setError("Registration information not found!");
        setIsLoading(false);
        return;
      }

      // Restructure data according to API requirements
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

      // Call API to verify OTP and complete registration
      const response = await api.post(
        `Authentication/VerifyRegistrationOtp?otp=${otp}`,
        verifyData
      );

      console.log("Verification response:", response.data);

      if (response.data.status === 1) {
        // Verification successful, account has been created
        // Remove temporary registration data
        localStorage.removeItem("registration_data");
        localStorage.removeItem("pending_email");

        setStep(2); // Move to completion step
      } else {
        setError(response.data.message || "Invalid OTP. Please try again.");

        // If OTP is incorrect and little time remains (under 10 seconds), automatically redirect to registration page
        if (remainingTime <= 10) {
          setTimeout(() => {
            setError(
              "Verification time is almost up. The system will redirect you to the registration page."
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
      console.error("Error verifying OTP:", error);
      setError(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      // Reset the timer immediately when clicking the resend button
      setRemainingTime(60);

      // Get email from localStorage
      const email = localStorage.getItem("pending_email");

      if (!email) {
        setError("Email information not found!");
        setIsLoading(false);
        return;
      }

      // Call API to resend OTP - use Register endpoint
      const response = await api.post("Authentication/Register", {
        email: email,
      });

      if (response.data.status === 1) {
        // Time has already been reset above
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

  // Return to login page
  const handleReturnToLogin = () => {
    navigate("/login");
  };

  // Handle OTP input
  const handleOtpChange = (e) => {
    // If OTP has expired, do not allow input
    if (remainingTime <= 0) {
      setError(
        "OTP entry time has expired. Please wait for the system to redirect to the registration page."
      );
      return;
    }

    setOtp(e.target.value);
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <h2 className="verify-email-title">
          {step === 1 && "Email Verification"}
          {step === 2 && "Completed"}
        </h2>

        {error && <div className="verify-email-error-message">{error}</div>}

        {/* Step 1: Enter OTP */}
        {step === 1 && (
          <form onSubmit={handleOtpSubmit}>
            <p className="verify-email-instruction-text">
              Please enter the 6-digit verification code sent to your email{" "}
              <strong>{email}</strong> to complete your account registration.
              You have <strong>1 minute</strong> to enter the verification code.
              {remainingTime <= 20 && (
                <span className="verify-email-warning-text">
                  <br />
                  Time is running out! Please enter quickly.
                </span>
              )}
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
                disabled={remainingTime <= 0}
              />
            </div>

            <p
              className={`verify-email-time-remaining ${
                isTimeExpiring ? "expiring" : ""
              }`}
            >
              Time remaining: {formatTime(remainingTime)}
            </p>

            {remainingTime <= 0 ? (
              <p className="verify-email-expired-message">
                Code entry time has expired. Redirecting to registration page...
              </p>
            ) : remainingTime <= 20 ? (
              <p className="verify-email-resend-link urgent">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="verify-email-resend-button urgent"
                  disabled={isLoading}
                >
                  Resend code now
                </button>
              </p>
            ) : (
              <p className="verify-email-resend-link">
                Didn't receive the code?
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="verify-email-resend-button"
                  disabled={isLoading}
                >
                  Resend code
                </button>
              </p>
            )}

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
                disabled={isLoading || remainingTime <= 0}
              >
                {isLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Complete */}
        {step === 2 && (
          <div className="verify-email-success-container">
            <div className="verify-email-success-icon">✓</div>
            <p className="verify-email-success-message">
              Congratulations! You have successfully registered your account.
              You can now log in to use our services.
            </p>
            <button
              type="button"
              className="verify-email-primary-button"
              onClick={handleReturnToLogin}
            >
              Log in now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
