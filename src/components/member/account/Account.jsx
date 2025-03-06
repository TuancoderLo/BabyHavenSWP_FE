import React, { useState, useEffect } from "react";
import userAccountsApi from "../../../services/userAccountsApi";
import "./Account.css"; // File CSS cho style

const Account = () => {
  // Các state để lưu trữ dữ liệu form
  const [avatar, setAvatar] = useState(null); // Avatar được chọn từ danh sách có sẵn
  const [uploadedAvatar, setUploadedAvatar] = useState(null); // Avatar tải lên từ máy
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isGoogleUser, setIsGoogleUser] = useState(false); // Nếu đăng ký qua Google thì không cho chỉnh sửa email
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Giả sử ta load thông tin người dùng từ API hoặc localStorage
  useEffect(() => {
    // Ví dụ: load thông tin từ localStorage
    const storedFullName = localStorage.getItem("name") || "";
    const storedEmail = localStorage.getItem("email") || "";
    setFullName(storedFullName);
    setEmail(storedEmail);
    // Nếu người dùng đăng nhập bằng Google, email sẽ không chỉnh sửa được
    const googleUser = localStorage.getItem("googleAuth") === "true";
    setIsGoogleUser(googleUser);
    // Load thêm avatar nếu có
    const storedAvatar = localStorage.getItem("profilePicture");
    if (storedAvatar) {
      setAvatar(storedAvatar);
    }
  }, []);

  // Xử lý tải ảnh lên cho avatar
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

  // Chọn avatar có sẵn
  const handleSelectAvatar = (url) => {
    setAvatar(url);
    setUploadedAvatar(null); // Nếu chọn avatar có sẵn, xóa avatar tải lên
  };

  // Xử lý lưu thay đổi
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    // Kiểm tra nếu có thay đổi mật khẩu thì validate 3 trường nhập
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

    // Tạo dữ liệu để update (có thể thêm avatar nếu cần)
    const updatedData = {
      name: fullName,
      email: email,
      phoneNumber: phone,
      // Các trường khác có thể bổ sung
    };

    // Gọi API cập nhật tài khoản (bạn có thể sửa đổi theo API của bạn)
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

  // Xử lý xóa tài khoản (sau khi xác nhận trong modal)
  const handleDeleteAccount = async () => {
    try {
      const response = await userAccountsApi.delete(
        localStorage.getItem("userId")
      );
      if (response.data.status === 1) {
        alert("Account has been deleted.");
        // Thực hiện các xử lý cần thiết sau khi xóa, vd: chuyển hướng về trang đăng nhập
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
      <h1>Account Settings</h1>
      <form onSubmit={handleSaveChanges} className="account-form">
        {/* Phần Avatar */}
        <section className="avatar-section">
          <h2>Avatar</h2>
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
          <h2>Change Password</h2>
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

        {/* Xóa tài khoản */}
        <section className="delete-account">
          <h2>Delete Account</h2>
          <p>
            Warning: Deleting your account will permanently remove all your data.
          </p>
          <button
            type="button"
            className="delete-btn"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </button>
        </section>

        {/* Nút Save Changes cố định ở dưới cùng */}
        <button type="submit" className="save-btn">
           Save Changes
        </button>
      </form>

      {/* Modal xác nhận xóa tài khoản */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Account Deletion</h3>
            <p>
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
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
