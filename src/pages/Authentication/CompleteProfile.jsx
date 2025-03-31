import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CompleteProfile.css";

function CompleteProfile() {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    name: "",
    gender: "Male",
    dateOfBirth: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Thêm kiểm tra đặc biệt cho trường phoneNumber
    if (name === "phoneNumber" && !/^\d*$/.test(value)) {
      return; // Không cập nhật state nếu có ký tự không phải số
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.phoneNumber.trim() ||
      !formData.name.trim() ||
      !formData.dateOfBirth.trim() ||
      !formData.address.trim()
    ) {
      setError("All fields are required");
      return false;
    }

    if (!/^\d{10,11}$/.test(formData.phoneNumber)) {
      setError("Phone number must be 10 or 11 digits");
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
      // Định dạng lại ngày tháng năm thành yyyy/MM/dd
      const date = new Date(formData.dateOfBirth);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}/${month}/${day}`;

      // Mô phỏng đã hoàn thành hồ sơ và chuyển hướng ngay lập tức
      // Bỏ setTimeout vì nó gây trễ và có thể làm người dùng nghĩ là nút không hoạt động
      navigate("/profile");
    } catch (error) {
      setError("Không thể hoàn thành hồ sơ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="CompleteProfile-auth-container">
      <div
        className="CompleteProfile-home-link"
        onClick={() => navigate("/guest")}
      >
        <i className="fas fa-home"></i>
      </div>

      <div className="CompleteProfile-auth-box">
        <div className="CompleteProfile-auth-header">
          <h1>Complete Your Profile</h1>
          <p className="CompleteProfile-header-subtitle">
            Please provide your information to continue
          </p>
        </div>

        {error && <div className="CompleteProfile-error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="CompleteProfile-form-container">
            <div className="CompleteProfile-form-group half-width">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="CompleteProfile-form-group half-width">
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

            <div className="CompleteProfile-form-group half-width">
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

            <div className="CompleteProfile-form-group half-width">
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="CompleteProfile-form-group">
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="CompleteProfile-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Complete Profile"}
          </button>

          <div className="CompleteProfile-toggle-form">
            Want to update later?
            <span onClick={() => navigate("/profile")}>Skip for now</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfile;
