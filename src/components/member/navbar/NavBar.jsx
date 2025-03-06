import { React, useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import "./NavBar.css";
import avatar_LOGO from "../../../assets/avatar_LOGO.jpg";
import NotificationDropdown from "../notifications/NotificationDropdown";
function NavBar() {
  // Tạo state cho userName
  const [userData, setUserData] = useState(null);
  // Lấy dữ liệu từ localStorage khi HomePage mount
  useEffect(() => {
    const nameFromLocal = localStorage.getItem("name"); 
    if (nameFromLocal) {
      // Giả sử ta chỉ lưu name dạng string, ta set userData = { name: ... }
      setUserData({ name: nameFromLocal });
    }
  }, []);

  return (
    <header className="member-topbar">
      <div className="member-search-container">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Hinted search text" />
        </div>
      </div>
 <div className="member-info">
      <span className="member-name">{userData ? userData.name : "Name"}</span>
      <div className="avatar-member">
        <img src={userData?.profilePicture || avatar_LOGO} alt="User Avatar" />
      </div>
    </div>
    <div className="navbar-right">
  <NotificationDropdown />
  {/* Các thông tin khác như tên, avatar... */}
</div>
    </header>
  );
}

export default NavBar;
