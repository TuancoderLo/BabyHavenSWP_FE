import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MemberShipPage.css";
import membershipApi from "../../../../services/memberShipApi";

function MemberShipPage() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [packages, setPackages] = useState([]);


  const navigate = useNavigate();

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
        const activePackages = all.filter(
          (pkg) => pkg.status.toLowerCase() === "active"
        );
        setPackages(activePackages);
      })
      .catch((err) => {
        console.error("Error fetching packages:", err);
        setPackages([]);
      });
  }, []);

  // Lọc ra các gói chưa được currentPlan sử dụng
  const availablePackages = currentPlan
    ? packages.filter((pkg) => pkg.packageName !== currentPlan.packageName)
    : packages;

  return (
    <div className="membership-page">
      <div className="membership-main-content">
        <h2 className="membership-page-title">Membership Management</h2>
        <div className="membership-row">
          {/* Available Plans */}
          <div className="membership-column packages-list">
            <h3 className="column-title">Available Plans</h3>
            <div className="packages-row">
              {availablePackages.map((pkg) => (
                <div
                  key={pkg.packageName}
                  className={`package-card-member ${pkg.packageName === "Premium" ? "premium" : ""}`}
                >
                  <h4>{pkg.packageName}</h4>
                  <p className="package-description">{pkg.description}</p>
                  {pkg.packageName !== "Free" ? (
                    <>
                      <div className="package-price">
                        <span className="price-amount">
                          {pkg.price.toLocaleString()} {pkg.currency}
                        </span>
                        <span className="price-duration">
                          / {pkg.durationMonths} months
                        </span>
                      </div>
                      <p className="max-children-info">
                        Max children: {pkg.maxChildrenAllowed}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="max-children-info">
                        Max children: {pkg.maxChildrenAllowed}
                      </p>
                    </>
                  )}
                </div>
              ))}

              {availablePackages.length === 0 && (
                <p className="no-packages">No other packages available</p>
              )}
            </div>
          </div>
          {/* Current Plan */}
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
                  {currentPlan.packageName !== "Free" && (
                    <>
                      <p>
                        <strong>Start Date:</strong>{" "}
                        {currentPlan.startDate ? currentPlan.startDate.slice(0, 10) : "--"}
                      </p>
                      <p>
                        <strong>End Date:</strong>{" "}
                        {currentPlan.endDate ? currentPlan.endDate.slice(0, 10) : "--"}
                      </p>
                    </>
                  )}
                </>
              ) : (
                <p>No active membership found.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberShipPage;
