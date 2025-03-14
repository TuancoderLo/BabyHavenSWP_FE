import React, { useState, useEffect } from "react";
import "./Packages.css";
import membershipApi from "../../services/memberShipApi";
import transactionsApi from "../../services/transactionsApi";

import packagesIcon from "../../assets/packages.png";
import momo from "../../assets/momo.png";
import vnpay from "../../assets/vnpay.jpg";
import visa from "../../assets/visa.jpg";
import logo from "../../assets/logo.png";
import name from "../../assets/name.png";

function Packages() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [packagesData, setPackagesData] = useState([]);

  // 0 = List gói, 1 = Choose how to pay, 2 = Payment info, 3 = Congrat
  const [currentStep, setCurrentStep] = useState(0);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null);

  // Kiểm tra URL param ?paymentStatus=success => Step 3
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("paymentStatus");
    if (paymentStatus === "success") {
      setCurrentStep(3);
      const pkgJSON = localStorage.getItem("selectedPackage");
      if (pkgJSON) {
        setSelectedPackage(JSON.parse(pkgJSON));
      }
    }
  }, []);

  // Lấy danh sách gói membership
  useEffect(() => {
    membershipApi
      .getAllPackages()
      .then((res) => {
        if (res.data?.data) {
          const activePackages = res.data.data.filter(
            (pkg) => pkg.status.toLowerCase() === "active"
          );
          setPackagesData(activePackages);
        }
      })
      .catch((err) => console.error("Error fetching packages:", err));
  }, []);

  const handleOpenOverlay = () => {
    setShowOverlay(true);
    setCurrentStep(0);
    setSelectedPackage(null);
    setPaymentMethod(null);
    setPromoCode("");
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
    setSelectedPackage(null);
    setPaymentMethod(null);
    setCurrentStep(0);
    setPromoCode("");
  };

  // Step 0: Người dùng chọn gói
  const handleBuyPackage = (pkg) => {
    setSelectedPackage(pkg);
    localStorage.setItem("selectedPackage", JSON.stringify(pkg));
    setCurrentStep(1);
  };

  // Step 1: Chọn paymentMethod
  const handleSelectPayment = (method) => {
    setPaymentMethod(method);
  };

  // Tính discount (demo)
  const discount = promoCode === "ABC" ? 280000 : 0;
// Step 2: Tạo memberMembership => getMemberMembershipId => tạo transaction => paymentURL
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
    // 1) Tạo memberMembership và nhận về membership id (dạng chuỗi)
    const membershipRes = await transactionsApi.createMemberMembership({
      memberId: memberId,
      packageName: selectedPackage.packageName,
    });
    const membershipId = membershipRes.data.data; // ví dụ: "2c989e71-eeb5-47bc-b18d-e000632aae7f"
    if (!membershipId) {
      alert("Failed to create memberMembership!");
      return;
    }

    // 2) Lấy thông tin chi tiết của memberMembership qua API GET /api/MemberMemberships/odata
    // Hàm getMemberMembershipId nhận vào membershipId vừa tạo và trả về memberMembershipId từ chi tiết
    const newMemberMembershipId = await transactionsApi.getMemberMembershipId(membershipId);
    if (!newMemberMembershipId) {
      alert("Cannot retrieve membership details!");
      return;
    }

    // 3) Tạo Transaction với userId và memberMembershipId (vừa lấy được)
    const transactionRes = await transactionsApi.createTransaction({
      userId: userId,
      memberMembershipId: newMemberMembershipId,
    });
    
    // Lấy thông tin transaction vừa tạo
    const transactionResponse = await transactionsApi.getTransaction(userId, newMemberMembershipId);
    const transactionData = transactionResponse.data.data;
    
    if (!transactionData || transactionData.paymentStatus !== "Pending") {
      alert("Transaction is not pending or failed!");
      return;
    }
    const gatewayTransactionId = transactionData.gatewayTransactionId;

    // 4) Gọi API VNPay để tạo URL thanh toán với gatewayTransactionId
    const paymentRes = await transactionsApi.createPayment(gatewayTransactionId);
    const paymentUrl = paymentRes.data.data;
    if (!paymentUrl) {
      alert("Cannot get payment URL from server!");
      return;
    }
    console.log(paymentUrl);
    // 5) Redirect sang cổng VNPay
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
    <>
      {/* Icon packages ở góc */}
      <div className="floating-icon" onClick={handleOpenOverlay}>
        <img src={packagesIcon} alt="Packages Icon" />
      </div>

      {showOverlay && (
        <div className="packages-overlay" onClick={handleCloseOverlay}>
          <div className="packages-modal" onClick={(e) => e.stopPropagation()}>
            {/* STEP 0: LIST PACKAGES */}
            {currentStep === 0 && (
              <div className="step0-list-packages">
                <h2 className="modal-title">Our Packages</h2>
                <p className="modal-subtitle">
                  Select the best package for your family
                </p>

                <div className="packages-row">
                  {packagesData.length > 0 ? (
                    packagesData.map((pkg, index) => (
                      <div key={index} className="package-card">
                        <h3>{pkg.packageName}</h3>
                        <p className="package-description">{pkg.description}</p>
                        <div className="package-price">
                          <span className="price-amount">
                            {pkg.price.toLocaleString()} {pkg.currency}
                          </span>
                          <span className="price-duration">
                            / {pkg.durationMonths} months
                          </span>
                        </div>
                        <div className="max-children-info">
                          Max children: {pkg.maxChildrenAllowed}
                        </div>
                        <button
                          className="package-btn"
                          onClick={() => handleBuyPackage(pkg)}
                        >
                          Buy Now
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>No available packages</p>
                  )}
                </div>
              </div>
            )}

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
                    onClick={() => {
                      handleSelectPayment("CreditCard");
                      setCurrentStep(2);
                    }}
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
                    onClick={() => {
                      handleSelectPayment("Momo");
                      setCurrentStep(2);
                    }}
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
                        <img src={packagesIcon} alt="Premium" />
                      </div>
                      <div className="package-info">
                        <div className="package-name">Premium package</div>
                        <div className="package-price">1.279.000đ/12 months</div>
                      </div>
                      <button className="change-button" onClick={() => handleCloseOverlay()}>
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
                      <div className="payment-method-text">Credit or Debit Card</div>
                      <div className="payment-logos">
                        <img src={visa} alt="Visa" />
                        <img src={vnpay} alt="VNPay" />
                      </div>
                      <button className="change-button" onClick={() => setCurrentStep(1)}>
                        Change
                      </button>
                    </div>

                    <div className="terms-check">
                      <input type="checkbox" id="agreeTerm" />
                      <label htmlFor="agreeTerm">
                        By checking the checkbox, you agree to our <a href="#">Terms of Use</a>, <a href="#">Privacy Statement</a>, and that you are over 18.
                      </label>
                    </div>
                  </div>

                  <div className="subscription-box">
                    <h3>Your subscription</h3>
                    <div className="subscription-items">
                      <div>1. Premium package</div>
                      <div>2. Family package promotion</div>
                    </div>
                    
                    <div className="subscription-dates">
                      <div>Start date: 20-10-2024</div>
                      <div>End date: 20-10-2025</div>
                    </div>

                    <div className="cost-breakdown">
                      <div className="cost-row">
                        <span>Amount</span>
                        <span className="amount">1.279.000 VND</span>
                      </div>
                      <div className="cost-row">
                        <span>Promotion</span>
                        <span className="promotion">280.000 VND</span>
                      </div>
                      <div className="total-row">
                        <span>Total</span>
                        <span className="total">999.000 VND</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="action-buttons">
                  <button className="btn-cancel" onClick={() => setCurrentStep(1)}>
                    Cancel
                  </button>
                  <button className="btn-confirm" onClick={handleConfirmPayment}>
                    Confirm
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONGRAT */}
            {currentStep === 3 && selectedPackage && (
              <div className="transaction-step final-step">
                <div className="step-indicator">STEP 3 OF 3</div>
                <h2 className="step-title">CONGRATULATION!</h2>
                <p className="final-msg">
                  Your <strong>{selectedPackage.packageName}</strong> features
                  is available successfully
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
    </>
  );
}

export default Packages;