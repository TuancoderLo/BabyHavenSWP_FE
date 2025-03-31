import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import userAccountsApi from "../../services/userAccountsApi"; // Import the userAccountsApi
import { createMember } from "../../services/member"; // Import the createMember function
import "./CompleteProfile.css";

function CompleteProfile() {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
    gender: "Male",
    dateOfBirth: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId"); // Get userId from localStorage

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
      !formData.password.trim() ||
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

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
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
      const formattedDate = `${year}-${month}-${day}`;

      // Step 1: Create a new member with only userId
      const memberData = {
        userId: userId,
      };

      await createMember(memberData);
      
      // Step 2: Prepare the data for updating the user account
      const updateData = {
        userId: userId,
        username: null, // Not provided in the form
        email: null, // Not provided in the form
        phoneNumber: formData.phoneNumber.trim(),
        name: null, // Not provided in the form
        gender: formData.gender,
        dateOfBirth: formattedDate,
        address: formData.address.trim(),
        status: 1, // Default status as per API
        roleId: 1, // Default roleId for Member as per API
        profilePicture: null, // Not provided in the form
        password: formData.password, // Include the password
        isVerified: true, // Set isVerified to true
      };

      // Call the API to update the user's profile
      const response = await userAccountsApi.updateMemberAccount(userId, updateData);

      try {
        const member = await api.get("Members/member/" + user.userId);
        localStorage.setItem("memberId", member.data.data.memberId);
      } catch (error) {
        console.error("Error fetching member:", error);
      }

      const memberId = localStorage.getItem("memberId");

      // Update localStorage to reflect the verification status
      if (response.data.status === 1 && memberId !== null) {
        localStorage.setItem("isVerified", "true");
        navigate("/homepage");
      } else {
        setError(`Error updating profile: ${response.data.message}`);
      }
    } catch (error) {
      setError("Error updating profile.");
      console.error("Error updating profile:", error);
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
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
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
        </form>
      </div>
    </div>
  );
}

export default CompleteProfile;