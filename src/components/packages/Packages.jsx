import React, { useState, useEffect } from "react";
import packages from "../../assets/packages.png";
import "./Packages.css";
import { useNavigate } from "react-router-dom";
import membershipApi from "../../services/memberShipApi";



function Packages() {
    const [open, setOpen] = useState(false);
    const [packagesData, setPackagesData] = useState([]);
    const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Hàm hỗ trợ hiển thị nút bấm cho từng gói
  const getButtonLabel = (packagesName) => {
    if (packagesName === "Free") return "Try Now";
    if (packagesName === "Standard") return "Go Standard";
    if (packagesName === "Premium") return "Go Premium";
    return "Buy Now";
  };
  
    // Gọi API khi component mount
    useEffect(() => {
      membershipApi
        .getAllPackages()
        .then((res) => {
          console.log("API Response:", res.data);
          if (res.data?.data) {
            // Lọc các gói active
            const activePackages = res.data.data.filter(
              (pkg) => pkg.status.toLowerCase() === "active"
            );
            console.log("Active Packages:", activePackages);
            setPackagesData(activePackages);
          }
        })
        .catch((err) => console.error("Fetch error:", err));
    }, []);
      
  
    // Mở modal
    const handleOpen = () => {
      setOpen(true);
      setCurrentStep(1);
    };
  
    // Đóng modal
    const handleClose = () => {
      setOpen(false);
      setSelectedPackage(null)
    };

  // Xử lý khi bấm vào nút mua
  const handleBuyPackage = (packageName) => {
    // // if (!isAuthenticated) {
    // //   console.log("User not logged in, redirecting to login...");
    // //   navigate("/login"); // Điều hướng về trang đăng nhập nếu chưa đăng nhập
    // //   return;
    // }

    console.log(`User clicked: ${packageName}`);
    setSelectedPackage(packageName);

    // Nếu là Standard hoặc Premium => chuyển sang step 2 (màn hình thanh toán)
    if (packageName === "Standard" || packageName === "Premium") {
      setCurrentStep(2);
    } else {
      // Trường hợp Free hay gói khác => tuỳ bạn xử lý
      console.log("Handle other packages logic...");
    }
  };

  
  return (
    <>
      <div className="floating-icon" onClick={handleOpen}>
        <img src={packages} alt="Packages Icon" />
      </div>

      {open && (
        <div className="packages-overlay" onClick={handleClose}>
          <div className="packages-modal" onClick={(e) => e.stopPropagation()}>
            {/* <button className="close-btn" onClick={handleClose}>
              &times;
            </button> */}

            {currentStep === 1 && (
              <>
                <h2 className="modal-title">Explore the different</h2>
                <p className="modal-subtitle">
                  Lorem ipsum dolor sit amet...
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
                      const isPremium = packageName === "Premium";
                      const buttonLabel = getButtonLabel(packageName);

                      return (
                        <div
                          key={index}
                          className={`package-card ${isPremium ? "premium" : ""}`}
                        >
                          {isPremium && (
                            <img
                              src={packages}
                              alt="Premium badge"
                              className="premium-badge"
                            />
                          )}

                          <h3>{packageName}</h3>
                          {/* Dùng class thay inline */}
                          <p className="package-description">
                            {description}
                          </p>

                          <div className="package-price">
                            <span className="price-amount">
                              {price.toLocaleString()} {currency}
                            </span>
                            <span className="price-duration">
                              {" "}
                              / {durationMonths} months
                            </span>
                          </div>

                          <div className="max-children-info">
                            Max children: {maxChildrenAllowed}
                          </div>

                          <button
                            className="package-btn"
                            onClick={() => handleBuyPackage(packageName)}
                          >
                            {buttonLabel}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="no-packages">No available packages</p>
                  )}
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div className="step2-center">
                <h2 className="step2-heading">CHOOSE HOW TO PAY</h2>
                <p className="step2-subtitle">
                  Secure for peace of mind.
                  <br />
                  Cancel easily online.
                </p>

                <p className="step2-note">
                  You selected: <b>{selectedPackage}</b> Package
                </p>

                <div className="credit-card-option">
                  <span>Credit or Debit Card</span>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.png"
                    alt="Visa"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c5/Mastercard-logo.png"
                    alt="MasterCard"
                  />
                </div>

                <div className="step-buttons step-buttons-centered">
                  <button
                    className="previous-btn"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </button>

                  <div className="button-cofirm">
                    <button type="button" onClick={handleClose}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Packages;