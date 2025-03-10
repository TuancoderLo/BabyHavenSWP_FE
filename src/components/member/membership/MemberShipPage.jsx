import React, { useState, useEffect } from "react";
import "./MemberShipPage.css";
import membershipApi from "../../../services/memberShipApi"; 

function MemberShipPage() {
  const [currentPlan, setCurrentPlan] = useState(null); 
  const [packages, setPackages] = useState([]);         

  useEffect(() => {
    const memberId = localStorage.getItem("memberId");
    if (!memberId) {
      console.error("No memberId found in localStorage");
      return;
    }

    // Lấy current plan
    membershipApi
      .getMemberMembership(memberId)
      .then((res) => {
        const data = res.data?.data;
        if (data && data.isActive === true) {
          setCurrentPlan(data);
        } else {
          setCurrentPlan(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching current plan:", err);
        setCurrentPlan(null);
      });

    // Lấy danh sách gói membership
    membershipApi
      .getAllPackages()
      .then((res) => {
        const all = res.data?.data || [];
        // Lọc chỉ lấy gói status = "Active"
        const activePackages = all.filter((pkg) => pkg.status === "Active");
        setPackages(activePackages);
      })
      .catch((err) => {
        console.error("Error fetching packages:", err);
        setPackages([]);
      });
  }, []);

  // Ví dụ hàm xử lý khi chọn gói
  const handleChoosePackage = (pkgName) => {
    console.log("User clicked on package:", pkgName);
    // Tùy logic: mở trang thanh toán, v.v.
  };

  return (
    <div className="membership-page">
      <div className="membership-main-content">
        <h2 className="membership-page-title">Membership Management</h2>

        <div className="membership-row">
          {/* Cột trái: Danh sách gói membership */}
          <div className="membership-column packages-list">
            <h3 className="column-title">Available Plans</h3>
            <div className="packages-row">
              {/* 
                Lọc: Nếu currentPlan != null, bỏ gói có cùng packageName.
                Nếu currentPlan = null, hiển thị tất cả 
              */}
              {packages
                .filter(
                  (pkg) =>
                    !currentPlan ||
                    pkg.packageName !== currentPlan.packageName
                )
                .map((pkg) => {
                  const isPremium = pkg.packageName === "Premium";
                  return (
                    <div
                      key={pkg.packageName}
                      className={`package-card-member ${
                        isPremium ? "premium" : ""
                      }`}
                    >
                      <h4>{pkg.packageName}</h4>
                      <p className="package-description">{pkg.description}</p>
                      <div className="package-price">
                        <span className="price-amount">
                          {pkg.price.toLocaleString()} {pkg.currency}
                        </span>
                        <span className="price-duration">
                          {" "}
                          / {pkg.durationMonths} months
                        </span>
                      </div>
                      <p className="max-children-info">
                        Max children: {pkg.maxChildrenAllowed}
                      </p>
                      <button
                        className="package-btn"
                        onClick={() => handleChoosePackage(pkg.packageName)}
                      >
                        {pkg.packageName === "Free" ? "Try Now" : "Choose Plan"}
                      </button>
                    </div>
                  );
                })}

              {/* Nếu mảng trống sau khi filter => thông báo */}
              {packages.filter(
                (pkg) =>
                  !currentPlan ||
                  pkg.packageName !== currentPlan.packageName
              ).length === 0 && (
                <p className="no-packages">No other packages available</p>
              )}
            </div>
          </div>

          {/* Cột phải: Current plan */}
          <div className="membership-column current-plan">
            <h3 className="column-title">Your current plan</h3>
            <div className="card membership-plan-card">
              {currentPlan ? (
                <>
                  <p>
                    <strong>Member Name:</strong> {currentPlan.memberName}
                  </p>
                  <p>
                    <strong>Package Name:</strong> {currentPlan.packageName}
                  </p>
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {currentPlan.startDate
                      ? currentPlan.startDate.slice(0, 10)
                      : "--"}
                  </p>
                  <p>
                    <strong>End Date:</strong>{" "}
                    {currentPlan.endDate
                      ? currentPlan.endDate.slice(0, 10)
                      : "--"}
                  </p>
                  <button className="membership-button standard">
                    {currentPlan.packageName || "STANDARD"}
                  </button>
                </>
              ) : (
                <p>No active membership found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Upgrade Section */}
        <div className="membership-upgrade">
          <p>
            Update to <span className="premium-text">Premium</span> to unlock
            more powerful features
          </p>
          <button className="membership-button premium">TRY NOW</button>
        </div>
      </div>
    </div>
  );
}

export default MemberShipPage;
