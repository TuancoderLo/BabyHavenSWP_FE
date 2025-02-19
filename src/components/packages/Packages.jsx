import React, { useState, useEffect } from "react";
import packages from "../../assets/packages.png";
import "./Packages.css";
import { useNavigate } from "react-router-dom";


function Packages() {
    const [open, setOpen] = useState(false);
    const [packagesData, setPackagesData] = useState([]);
    const navigate = useNavigate();
 // Hàm hỗ trợ hiển thị nút bấm cho từng gói
    const getButtonLabel = (packagesName) => {
      if (packagesName === "Free") return "Try Now";
      if (packagesName === "Standard") return "Try Standard";
      if (packagesName === "Premium") return "Try Premium";
      return "Buy Now";
    };
  
    // Gọi API khi component mount
    useEffect(() => {
        fetch("https://localhost:7279/api/MembershipPackages")
          .then((res) => res.json())
          .then((data) => {
            console.log("API Response:", data); //  Kiểm tra phản hồi API
            if (data?.data) {
              const activePackages = data.data.filter((pkg) => pkg.status.toLowerCase() === "active");
              console.log("Active Packages:", activePackages); // Kiểm tra dữ liệu lọc được
              setPackagesData(activePackages);
            }
          })
          .catch((err) => console.error("Fetch error:", err));
      }, []);
      
  
    // Mở modal
    const handleOpen = () => {
      setOpen(true);
    };
  
    // Đóng modal
    const handleClose = () => {
      setOpen(false);
    };

  // Xử lý khi bấm vào nút mua
  const handleBuyPackage = (packageName) => {
    if (!isAuthenticated) {
      console.log("User not logged in, redirecting to login...");
      navigate("/login"); // Điều hướng về trang đăng nhập nếu chưa đăng nhập
      return;
    }

    console.log(`User bought package: ${packageName}`);
    navigate("/packages"); // Điều hướng đến trang Packages
};

  
    return (
        <>
          {/* Icon Packages nổi ở góc */}
          <div className="floating-icon" onClick={handleOpen}>
            <img src={packages} alt="Packages Icon" />
          </div>
    
          {/* Nếu open = true => hiển thị overlay + modal */}
          {open && (
            <div className="packages-overlay" onClick={handleClose}>
              <div className="packages-modal" onClick={(e) => e.stopPropagation()}>
                {/* Nút đóng (X) */}
                <button className="close-btn" onClick={handleClose}>
                  &times;
                </button>
    
                <h2 className="modal-title">Explore the different</h2>
                <p className="modal-subtitle">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
    
                <div className="packages-row">
                  {packagesData.length > 0 ? (
                    packagesData.map((pkg, index) => {
                      const {
                        packageName,
                        description,
                        price,
                        currency,
                        durationMonths,
                        maxChildrenAllowed,
                      } = pkg;
    
                      // Kiểm tra gói Premium
                      const isPremium = packageName === "Premium";
                      // Tạo label nút bấm
                      const buttonLabel = getButtonLabel(packageName);
    
                      return (
                        <div
                          key={index}
                          className={`package-card ${isPremium ? "premium" : ""}`}
                        >
                          {/* Nếu là Premium => gắn icon */}
                          {isPremium && (
                            <img
                              src={packages}
                              alt="Premium badge"
                              className="premium-badge"
                            />
                          )}
    
                          <h3>{packageName}</h3>
    
                          {/* Mô tả gói */}
                          <p style={{ minHeight: "40px", color: "#666" }}>
                            {description}
                          </p>
    
                          {/* Khu vực giá */}
                          <div className="package-price">
                            <span className="price-amount">
                              {price.toLocaleString()} {currency}
                            </span>
                            <span className="price-duration">
                              {" "}
                              / {durationMonths} months
                            </span>
                          </div>
    
                          {/* Hiển thị số lượng con tối đa */}
                          <div
                            style={{
                              marginBottom: "1rem",
                              fontSize: "0.85rem",
                              color: "#666",
                            }}
                          >
                            Max children: {maxChildrenAllowed}
                          </div>
    
                          {/* Nút mua */}
                    <button className="package-btn" onClick={() => handleBuyPackage(packageName)}>
                      {buttonLabel}
                    </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="no-packages">No available packages</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      );
    }
 
    export default Packages;