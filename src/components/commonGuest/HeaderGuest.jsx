import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import Logo from "../../assets/Logo.png";
import Name from "../../assets/Name.png";
import api from "../../config/axios";
import "./HeaderGuest.css";

function HeaderGuest() {
  const navigate = useNavigate();
  const [parentCategories, setParentCategories] = useState([]);
  const [childCategories, setChildCategories] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchParentCategories();
  }, []);

  const fetchParentCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("BlogCategories");
      console.log("API Response:", response);

      const allCategories = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      // Lọc ra các category cha
      const parentCats = allCategories.filter(
        (cat) =>
          !cat.parentCategoryId ||
          cat.parentCategoryId === "" ||
          cat.parentCategoryId === null
      );

      // Giới hạn chỉ lấy 5 category cha đầu tiên
      const limitedParentCats = parentCats.slice(0, 5);
      console.log("Parent Categories (Limited to 5):", limitedParentCats);

      setParentCategories(limitedParentCats);

      // Xử lý category con cho 5 category cha được chọn
      const childCatsMap = {};
      limitedParentCats.forEach((parent) => {
        const childCats = allCategories.filter(
          (cat) => cat.parentCategoryId === parent.categoryId
        );
        console.log(`Child Categories for ${parent.categoryName}:`, childCats);
        childCatsMap[parent.categoryId] = childCats;
      });

      setChildCategories(childCatsMap);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = async (categoryId) => {
    try {
      setIsLoading(true);
      // Chuyển hướng đến trang category với categoryId
      navigate(`/category/${categoryId}`);
    } catch (error) {
      console.error("Error navigating to category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="homepage-header">
      <nav>
        <div className="logo">
          <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <img src={Logo} alt="Logo" />
            <img src={Name} alt="Name" />
          </div>
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

        <div className="auth-buttons">
          <NavLink className="join-btn" to={"/register"}>
            Join
          </NavLink>
          <button className="logout-btn" onClick={() => navigate("/login")}>
            Sign Up
          </button>
        </div>
      </nav>
    </header>
  );
}

export default HeaderGuest;
