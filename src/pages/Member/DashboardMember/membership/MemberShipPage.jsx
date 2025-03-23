import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MemberShipPage.css";
import membershipApi from "../../../../services/memberShipApi";
import transactionsApi from "../../../../services/transactionsApi";

// Import assets (giống file Packages.jsx)
import packagesIcon from "../../../../assets/packages.png";
import momo from "../../../../assets/momo.png";
import vnpay from "../../../../assets/vnpay.jpg";
import visa from "../../../../assets/visa.jpg";
import logo from "../../../../assets/Logo.png";
import name from "../../../../assets/Name.png";

function MemberShipPage() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [packages, setPackages] = useState([]);

  // Các state cho overlay thanh toán
  const [showOverlay, setShowOverlay] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: list, 1: chọn payment, 2: payment info, 3: congratulation
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const discount = promoCode === "ABC" ? 280000 : 0;

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

  // Khi bấm chọn gói
  const handleChoosePackage = (pkg) => {
    if (pkg.packageName === "Free") {
      alert("You have chosen the Free plan.");
      return;
    }
    setSelectedPackage(pkg);
    localStorage.setItem("selectedPackage", JSON.stringify(pkg));
    setCurrentStep(1);
    setShowOverlay(true);
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
    setSelectedPackage(null);
    setPaymentMethod(null);
    setCurrentStep(0);
    setPromoCode("");
  };

  const handleSelectPayment = (method) => {
    setPaymentMethod(method);
    setCurrentStep(2);
  };

  const handleConfirmPayment = async () => {
    const userId = localStorage.getItem("userId");
    const memberId = localStorage.getItem("memberId");
    if (!userId || !memberId) {
      alert("User not logged in or no memberId found!");
      return;
    }
    if (!selectedPackage) {
      alert("No package selected!");
      return;
    }
    try {
      const membershipRes = await transactionsApi.createMemberMembership({
        memberId: memberId,
        packageName: selectedPackage.packageName,
      });
      const membershipId = membershipRes.data.data;
      if (!membershipId) {
        alert("Failed to create memberMembership!");
        return;
      }
      const newMemberMembershipId = await transactionsApi.getMemberMembershipId(
        membershipId
      );
      if (!newMemberMembershipId) {
        alert("Cannot retrieve membership details!");
        return;
      }
      await transactionsApi.createTransaction({
        userId: userId,
        memberMembershipId: newMemberMembershipId,
      });
      const transactionResponse = await transactionsApi.getTransaction(
        userId,
        newMemberMembershipId
      );
      const transactionData = transactionResponse.data.data;
      if (!transactionData || transactionData.paymentStatus !== "Pending") {
        alert("Transaction is not pending or failed!");
        return;
      }
      const gatewayTransactionId = transactionData.gatewayTransactionId;
      const paymentRes = await transactionsApi.createPayment(
        gatewayTransactionId
      );
      const paymentUrl = paymentRes.data.data;
      if (!paymentUrl) {
        alert("Cannot get payment URL from server!");
        return;
      }
      window.location.href = paymentUrl;
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment initiation failed, please try again.");
    }
  };

  const handleFinish = () => {
    handleCloseOverlay();
  };

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
                  className={`package-card-member ${
                    pkg.packageName === "Premium" ? "premium" : ""
                  }`}
                >
                  <h4>{pkg.packageName}</h4>
                  <p className="package-description">{pkg.description}</p>
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
                  {pkg.packageName === "Free" ? (
                    <button
                      className="package-btn"
                      disabled={currentPlan?.packageName === "Free"}
                    >
                      {currentPlan?.packageName === "Free"
                        ? "YOUR CURRENT PLAN"
                        : "Try Now"}
                    </button>
                  ) : (
                    <button
                      className="package-btn"
                      onClick={() => handleChoosePackage(pkg)}
                    >
                      Choose Plan
                    </button>
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
                  <button className="membership-button standard" disabled>
                    {currentPlan.packageName === "Free"
                      ? "YOUR CURRENT PLAN"
                      : currentPlan.packageName}
                  </button>
                </>
              ) : (
                <p>No active membership found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay thanh toán */}
      {showOverlay && (
        <div className="packages-overlay" onClick={handleCloseOverlay}>
          <div className="packages-modal" onClick={(e) => e.stopPropagation()}>
            {/* STEP 1: CHOOSE HOW TO PAY */}
            {currentStep === 1 && selectedPackage && (
              <div className="transaction-step choose-payment-step">
                <div className="babyhaven-logo">
                  <img src={logo} alt="BabyHaven Logo" className="logo-img" />
                  <img src={name} alt="BabyHaven Name" className="name-img" />
                </div>
                <div className="step-indicator">STEP 1 OF 3</div>
                <h2 className="step-title">CHOOSE HOW TO PAY</h2>
                <p className="step-subtitle">
                  Secure for peace of mind. <br />
                  Cancel easily online.
                </p>
                <div className="payment-method-options">
                  <button
                    className={`payment-button ${
                      paymentMethod === "CreditCard" ? "active" : ""
                    }`}
                    onClick={() => handleSelectPayment("CreditCard")}
                  >
                    <span>Credit or Debit Card</span>
                    <div className="payment-logos">
                      <img src={visa} alt="Visa" />
                      <img src={vnpay} alt="VNPay" />
                    </div>
                  </button>
                  <button
                    className={`payment-button ${
                      paymentMethod === "Momo" ? "active" : ""
                    }`}
                    onClick={() => handleSelectPayment("Momo")}
                  >
                    <span>Momo E-Wallet</span>
                    <div className="payment-logos">
                      <img src={momo} alt="Momo" />
                    </div>
                  </button>
                </div>
              </div>
            )}
            {/* STEP 2: PAYMENT INFO */}
            {currentStep === 2 && selectedPackage && (
              <div className="transaction-step payment-info-step">
                <div className="babyhaven-logo">
                  <img src={logo} alt="BabyHaven Logo" className="logo-img" />
                  <img src={name} alt="BabyHaven Name" className="name-img" />
                </div>
                <div className="step-indicator">STEP 2 OF 3</div>
                <h2 className="step-title">Set up your payment information</h2>
                <div className="step2-container">
                  <div className="step2-left">
                    <div className="selected-package-box">
                      <div className="package-icon">
                        <img src={packagesIcon} alt="Package Icon" />
                      </div>
                      <div className="package-info">
                        <div className="package-name">
                          {selectedPackage?.packageName}
                        </div>
                        <div className="package-price">
                          {selectedPackage
                            ? `${selectedPackage.price.toLocaleString()} ${
                                selectedPackage.currency
                              } / ${selectedPackage.durationMonths} months`
                            : ""}
                        </div>
                      </div>
                      <button
                        className="change-button"
                        onClick={handleCloseOverlay}
                      >
                        Change
                      </button>
                    </div>
                    <div className="promo-input-box">
                      <input
                        type="text"
                        placeholder="Add promotion here"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                    </div>
                    <div className="payment-method-box">
                      <div className="payment-method-text">
                        Credit or Debit Card
                      </div>
                      <div className="payment-logos">
                        <img src={visa} alt="Visa" />
                        <img src={vnpay} alt="VNPay" />
                      </div>
                      <button
                        className="change-button"
                        onClick={() => setCurrentStep(1)}
                      >
                        Change
                      </button>
                    </div>
                    <div className="terms-check">
                      <input type="checkbox" id="agreeTerm" />
                      <label htmlFor="agreeTerm">
                        By checking the checkbox, you agree to our{" "}
                        <a href="#">Terms of Use</a>,{" "}
                        <a href="#">Privacy Statement</a>, and that you are over
                        18.
                      </label>
                    </div>
                  </div>
                  <div className="subscription-box">
                    <h3>Your subscription</h3>
                    <div className="subscription-items">
                      <div>1. {selectedPackage?.packageName}</div>
                      {promoCode && (
                        <div>2. Promo code applied: {promoCode}</div>
                      )}
                    </div>
                    <div className="subscription-dates">
                      <div>Start date: {new Date().toLocaleDateString()}</div>
                      <div>
                        End date:{" "}
                        {new Date(
                          new Date().setMonth(
                            new Date().getMonth() +
                              selectedPackage?.durationMonths
                          )
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="cost-breakdown">
                      <div className="cost-row">
                        <span>Amount</span>
                        <span className="amount">
                          {selectedPackage
                            ? `${selectedPackage.price.toLocaleString()} ${
                                selectedPackage.currency
                              }`
                            : ""}
                        </span>
                      </div>
                      <div className="cost-row">
                        <span>Promotion</span>
                        <span className="promotion">
                          {selectedPackage
                            ? `${discount.toLocaleString()} ${
                                selectedPackage.currency
                              }`
                            : ""}
                        </span>
                      </div>
                      <div className="total-row">
                        <span>Total</span>
                        <span className="total">
                          {selectedPackage
                            ? `${(
                                selectedPackage.price - discount
                              ).toLocaleString()} ${selectedPackage.currency}`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="action-buttons">
                  <button
                    className="btn-cancel"
                    onClick={() => setCurrentStep(1)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-confirm"
                    onClick={handleConfirmPayment}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
            {/* STEP 3: CONGRATULATION */}
            {currentStep === 3 && selectedPackage && (
              <div className="transaction-step final-step">
                <div className="step-indicator">STEP 3 OF 3</div>
                <h2 className="step-title">CONGRATULATION!</h2>
                <p className="final-msg">
                  Your <strong>{selectedPackage.packageName}</strong> features
                  are now available.
                </p>
                <button className="follow-btn">
                  Follow your children growth here &rarr;
                </button>
                <button className="close-overlay" onClick={handleFinish}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberShipPage;
