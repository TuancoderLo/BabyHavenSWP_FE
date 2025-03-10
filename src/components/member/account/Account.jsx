import React, { useState, useEffect } from "react";
import userAccountsApi from "../../../services/userAccountsApi";
import "./Account.css"; // Import file CSS mới

const Account = () => {
  const [avatar, setAvatar] = useState(null);
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Lấy dữ liệu từ localStorage (hoặc API)
    const storedFullName = localStorage.getItem("name") || "";
    const storedEmail = localStorage.getItem("email") || "";
    setFullName(storedFullName);
    setEmail(storedEmail);

    const googleUser = localStorage.getItem("googleAuth") === "true";
    setIsGoogleUser(googleUser);

    const storedAvatar = localStorage.getItem("profilePicture");
    if (storedAvatar) {
      setAvatar(storedAvatar);
    }
  }, []);

  // Xử lý upload avatar
  const handleAvatarUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý lưu thay đổi
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    // Kiểm tra password nếu có thay đổi
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

    const updatedData = {
      name: fullName,
      email: email,
      phoneNumber: phone,
    };

    try {
      const response = await userAccountsApi.update(
        localStorage.getItem("userId"),
        updatedData
      );
      if (response.data.status === 1) {
        alert("Update successful!");
      } else {
        alert("Update failed, please try again.");
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("An error occurred while updating your information.");
    }
  };

  // Xử lý xóa tài khoản
  const handleDeleteAccount = async () => {
    try {
      const response = await userAccountsApi.delete(
        localStorage.getItem("userId")
      );
      if (response.data.status === 1) {
        alert("Account has been deleted.");
      } else {
        alert("Failed to delete account, please try again.");
      }
    } catch (error) {
      console.error("Lỗi xóa tài khoản:", error);
      alert("An error occurred while deleting the account.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="account-page">
      <form onSubmit={handleSaveChanges} className="account-form">
        {/* Phần Avatar */}
        <section className="avatar-section">
          <h2 className="section-title">Avatar</h2>
          <div className="avatar-preview">
            {uploadedAvatar ? (
              <img src={uploadedAvatar} alt="Uploaded Avatar" />
            ) : avatar ? (
              <img src={avatar} alt="Preset Avatar" />
            ) : (
              <div className="avatar-placeholder">No avatar</div>
            )}
          </div>
          <div className="avatar-actions">
            <label htmlFor="avatarUpload" className="upload-btn">
              Upload Avatar
            </label>
            <input
              type="file"
              id="avatarUpload"
              onChange={handleAvatarUpload}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>
        </section>

        {/* Thông tin tài khoản */}
        <section className="account-info">
          <h2 className="section-title">Account Information</h2>
          <div className="form-group">
            <label>User Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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

        {/* Xóa tài khoản (nếu muốn hiển thị) */}
        {/* 
        <section className="delete-account">
          <h2 className="section-title delete-title">Delete Account</h2>
          <p>Warning: Deleting your account will permanently remove all your data.</p>
          <button
            type="button"
            className="delete-btn"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </button>
        </section> 
        */}

        <button type="submit" className="save-btn">
          Save Changes
        </button>
      </form>

      {/* Modal xác nhận xóa tài khoản */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Account Deletion</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button onClick={handleDeleteAccount}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
