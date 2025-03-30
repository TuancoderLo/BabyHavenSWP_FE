import React, { useState, useEffect } from "react";
import userAccountsApi from "../../../../services/userAccountsApi";
import "./Account.css"; // Import file CSS mới

const Account = () => {
  // State cho thông tin tài khoản
  const [avatar, setAvatar] = useState(null);
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");

  // State cho thay đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // State cho modal thông báo thành công
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        const response = await userAccountsApi.getById(userId);
        // Giả sử dữ liệu được trả về trong response.data.data
        const data = response.data.data;
        setFullName(data.name || "");
        setUserName(data.username || "");
        setEmail(data.email || "");
        setPhone(data.phoneNumber || "");
        setGender(data.gender || "");
        setDateOfBirth(data.dateOfBirth || "");
        setAddress(data.address || "");
        if (data.profilePicture) {
          setAvatar(data.profilePicture);
        }
      } catch (error) {
        console.error("Error fetching account data", error);
      }
    };
    fetchAccountData();

    // Kiểm tra nếu người dùng đăng nhập qua Google
    const googleUser = localStorage.getItem("googleAuth") === "true";
    setIsGoogleUser(googleUser);
  }, []);

  // Xử lý lưu thay đổi
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    // Nếu có thay đổi mật khẩu, kiểm tra hợp lệ:
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        alert("Please enter your current password!");
        return;
      }
      if (newPassword !== confirmPassword) {
        alert("New password and confirmation do not match!");
        return;
      }
    }

    // Tạo payload chỉ gồm các trường được phép update
    const updatedData = {
      name: fullName,
      username: userName,
      email: email,
      phoneNumber: phone,
      gender: gender,
      dateOfBirth: dateOfBirth,
      address: address,
      password: newPassword || "",
    };

    try {
      const response = await userAccountsApi.updateMemberAccount(
        localStorage.getItem("userId"),
        updatedData
      );
      if (response.data.status === 1) {
        // Thay vì alert, hiển thị modal thành công
        setShowSuccessModal(true);
      } else {
        alert("Update failed, please try again.");
      }
    } catch (error) {
      console.error("Error updating account:", error);
      alert("An error occurred while updating your information.");
    }
  };

  return (
    <div className="account-page">
      <form onSubmit={handleSaveChanges} className="account-form">
        {/* Thông tin tài khoản */}
        <section className="account-info">
          <h2 className="section-title">Account Information</h2>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="form-group">
            <label>User Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter user name"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
              disabled={isGoogleUser}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <input
              type="text"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              placeholder="Enter gender"
            />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
            />
          </div>
        </section>

        {/* Thay đổi mật khẩu */}
        <section className="change-password">
          <h2 className="section-title">Change Password</h2>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
        </section>

        {/* Nút Save Changes */}
        <button type="submit" className="save-btn">
          Save Changes
        </button>
      </form>

      {/* Modal thông báo thành công */}
      {showSuccessModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="success-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="success-modal-header">
              <h3>Success!</h3>
              <button
                className="modal-close"
                onClick={() => setShowSuccessModal(false)}
              >
                ×
              </button>
            </div>
            <div className="success-modal-body">
              <p>Update successful!</p>
            </div>
            <div className="success-modal-footer">
              <button
                className="success-modal-button"
                onClick={() => setShowSuccessModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
