import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Logo.png";
import Name from "../../assets/Name.png";
import avatar_LOGO from "../../assets/avatar_LOGO.jpg";
import api from "../../config/axios";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [parentCategories, setParentCategories] = useState([]);
  const [childCategories, setChildCategories] = useState({});

  useEffect(() => {
    const nameFromLocal = localStorage.getItem("name");
    if (nameFromLocal) {
      setUserData({ name: nameFromLocal });
    }
    fetchParentCategories();
  }, []);

  const fetchParentCategories = async () => {
    try {
      const response = await api.get("BlogCategories");
      console.log("=== API Response Full Data ===", response);
      console.log("=== Response Data Type ===", typeof response.data);
      console.log(
        "=== Response Data Structure ===",
        JSON.stringify(response.data, null, 2)
      );

      // Đảm bảo response.data là một mảng
      const allCategories = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      console.log("=== All Categories Structure ===");
      allCategories.forEach((cat) => {
        console.log({
          id: cat.categoryId,
          name: cat.name,
          categoryName: cat.categoryName, // Kiểm tra xem có phải là categoryName thay vì name
          parentId: cat.parentCategoryId,
          fullObject: cat, // In ra toàn bộ object để xem cấu trúc
        });
      });

      // Lọc ra các category cha
      const parentCats = allCategories.filter(
        (cat) =>
          !cat.parentCategoryId ||
          cat.parentCategoryId === "" ||
          cat.parentCategoryId === null
      );

      console.log("=== Parent Categories Detail ===");
      parentCats.forEach((cat) => {
        console.log({
          id: cat.categoryId,
          name: cat.name,
          categoryName: cat.categoryName,
          allProps: Object.keys(cat), // Liệt kê tất cả properties của object
        });
      });

      setParentCategories(parentCats);

      // Tìm các category con
      const childCatsMap = {};
      parentCats.forEach((parent) => {
        const childCats = allCategories.filter(
          (cat) => cat.parentCategoryId === parent.categoryId
        );
        console.log(`=== Child Categories for Parent ${parent.categoryId} ===`);
        childCats.forEach((child) => {
          console.log({
            childId: child.categoryId,
            childName: child.name,
            childCategoryName: child.categoryName,
            parentId: child.parentCategoryId,
          });
        });
        childCatsMap[parent.categoryId] = childCats;
      });

      setChildCategories(childCatsMap);
    } catch (error) {
      console.error("=== Error Details ===");
      console.error("Error Message:", error.message);
      console.error("Error Response:", error.response?.data);
      console.error("Full Error:", error);
    }
  };

  const handleCategoryClick = async (categoryId) => {
    try {
      // Chuyển hướng đến trang category
      navigate(`/category/${categoryId}`);
    } catch (error) {
      console.error("Error handling category click:", error);
    }
  };

  const handleMouseEnter = () => {
    setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="homepage-header">
      <nav>
        <div className="logo">
          <img src={Logo} alt="Logo" />
          <img src={Name} alt="Name" />
        </div>

        <div className="nav-links">
          {parentCategories.map((category) => {
            console.log("=== Rendering Category ===", {
              id: category.categoryId,
              name: category.name,
              categoryName: category.categoryName,
              allProps: Object.keys(category),
            });
            return (
              <div key={category.categoryId} className="dropdown">
                <a
                  href={`/category/${category.categoryId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCategoryClick(category.categoryId);
                  }}
                  style={{ color: "#666" }}
                >
                  {category.categoryName || category.name || "Unnamed Category"}
                </a>
                {childCategories[category.categoryId]?.length > 0 && (
                  <div className="dropdown-content">
                    {childCategories[category.categoryId].map((child) => {
                      console.log("=== Rendering Child ===", {
                        id: child.categoryId,
                        name: child.name,
                        categoryName: child.categoryName,
                      });
                      return (
                        <a
                          key={child.categoryId}
                          href={`/category/${child.categoryId}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryClick(child.categoryId);
                          }}
                          style={{ color: "#666" }}
                        >
                          {child.categoryName ||
                            child.name ||
                            "Unnamed Category"}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <a href="#community" style={{ color: "#666" }}>
            Community
          </a>
          <a href="#tools-features" style={{ color: "#666" }}>
            Features
          </a>
        </div>

        <div
          className="avatar-sidebar-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="avatar-chip-img">
            <img
              src={userData?.profilePicture || avatar_LOGO}
              alt="User Avatar"
            />
          </div>
          <span className="avatar-chip-text">
            {userData ? userData.name : "Name"}
          </span>
          {menuOpen && (
            <div className="overlay" onClick={() => setMenuOpen(false)}></div>
          )}
          <div className={`sidebar-menu ${menuOpen ? "open" : ""}`}>
            <div className="sidebar-header">
              <i className="fas fa-user-circle"></i>
              <span>{userData ? userData.name : "User"}</span>
            </div>
            <hr />
            <div className="sidebar-section">
              <h4>Activity</h4>
              <p>Growth tracker</p>
              <p>Doctor consultation</p>
              <p>Health Analysis</p>
            </div>
            <hr />
            <div className="sidebar-section">
              <h4>Profile</h4>
              <p onClick={() => navigate("/member/children")}>My children</p>
              <p>My children's milestones</p>
              <p>My membership plans</p>
              <p>My requests</p>
            </div>
            <hr />
            <div className="sidebar-section">
              <h4>Setting</h4>
              <p>Profile setting</p>
              <p onClick={handleLogout}>Log out</p>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
