import React, { useState, useEffect } from "react";
import "./Packages.css";
import membershipApi from "../../services/memberShipApi";
import transactionsApi from "../../services/transactionsApi";

import packagesIcon from "../../assets/packages.png";
import momo from "../../assets/momo.png";
import vnpay from "../../assets/vnpay.jpg";
import visa from "../../assets/visa.jpg";

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

  const handleNextFromStep1 = () => {
    if (!paymentMethod) {
      alert("Please select a payment method!");
      return;
    }
    setCurrentStep(2);
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
    // 1) Tạo MemberMembership (POST /api/MemberMemberships)
    await transactionsApi.createMemberMembership({
      memberId: memberId,
      packageName: selectedPackage.packageName,
    });

    // 2) Lấy memberMembershipId (đầu tiên) cho memberId
    const newMemberMembershipId = await transactionsApi.getMemberMembershipId(memberId);
    if (!newMemberMembershipId) {
      alert("Cannot find any memberMembershipId for this memberId!");
      return;
    }

    // 3) Tạo Transaction => { userId, memberMembershipId }
    await transactionsApi.createTransaction({
      userId: userId,
      memberMembershipId: newMemberMembershipId,
    });

    // 4) Tạo Payment URL
    const returnUrl = window.location.origin + "/membership?paymentStatus=success";
    const payRes = await transactionsApi.createPayment(newMemberMembershipId, returnUrl);
    const paymentUrl = payRes.data;
    if (!paymentUrl) {
      alert("Cannot get payment URL from server!");
      return;
    }

    // 5) Redirect sang cổng thanh toán
    window.location.href = paymentUrl;

  } catch (err) {
    console.error("Payment error:", err);
    alert("Payment initiation failed, please try again.");
  }
};

// Step 3: Đóng
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
                <div className="step-indicator">STEP 1 OF 3</div>
                <h2 className="step-title">CHOOSE HOW TO PAY</h2>
                <p className="step-subtitle">
                  Secure for peace of mind. <br />
                  Cancel easily online.
                </p>

                <div className="payment-method-options">
                  <div
                    className={`payment-box ${
                      paymentMethod === "CreditCard" ? "active" : ""
                    }`}
                    onClick={() => handleSelectPayment("CreditCard")}
                  >
                    <span>Credit or Debit Card</span>
                    <div className="payment-logos">
                      <img src={visa} alt="Visa" />
                      <img src={vnpay} alt="VNPay" />
                    </div>
                  </div>
                  <div
                    className={`payment-box ${
                      paymentMethod === "Momo" ? "active" : ""
                    }`}
                    onClick={() => handleSelectPayment("Momo")}
                  >
                    <span>Momo E-Wallet</span>
                    <div className="payment-logos">
                      <img src={momo} alt="Momo" />
                    </div>
                  </div>
                </div>

                <div className="step-buttons-centered">
                  <button
                    className="previous-btn"
                    onClick={() => setCurrentStep(0)}
                  >
                    Back
                  </button>
                  <button className="next-btn" onClick={handleNextFromStep1}>
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PAYMENT INFO */}
            {currentStep === 2 && selectedPackage && (
              <div className="transaction-step payment-info-step">
                <div className="step-indicator">STEP 2 OF 3</div>
                <h2 className="step-title">Set up your payment information</h2>

                <div className="step2-container">
                  <div className="step2-left">
                    <div className="selected-package-line">
                      <span className="package-name-highlight">
                        {selectedPackage.packageName} package
                      </span>
                      <button
                        className="change-btn"
                        onClick={() => setCurrentStep(0)}
                      >
                        Change
                      </button>
                    </div>

                    <label className="label-promo">Add promotion here</label>
                    <input
                      type="text"
                      className="promo-input"
                      placeholder="Enter your code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />

                    <div className="payment-method-chosen">
                      {paymentMethod === "CreditCard" && (
                        <>
                          <label>Credit or Debit Card</label>
                          <div className="card-logos-inline">
                            <img src={visa} alt="Visa" />
                            <img src={vnpay} alt="VNPay" />
                          </div>
                        </>
                      )}
                      {paymentMethod === "Momo" && (
                        <>
                          <label>Momo E-Wallet</label>
                          <div className="card-logos-inline">
                            <img src={momo} alt="Momo" />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="terms-check">
                      <input type="checkbox" id="agreeTerm" />
                      <label htmlFor="agreeTerm">
                        I agree to the Terms of Use and Privacy Statement.
                      </label>
                    </div>
                  </div>

                  <div className="step2-right">
                    <h3>Your subscription</h3>
                    <p>1. {selectedPackage.packageName} package</p>
                    <p>2. Family package promotion</p>
                    <p>
                      Start date: 20-10-2024 <br />
                      End date: 20-10-2025
                    </p>

                    <div className="cost-line">
                      <span>Amount</span>
                      <strong>
                        {selectedPackage.price.toLocaleString()} VND
                      </strong>
                    </div>
                    <div className="cost-line">
                      <span>Promotion</span>
                      <strong>{discount.toLocaleString()} VND</strong>
                    </div>
                    <hr />
                    <div className="cost-line total-cost">
                      <span>Total</span>
                      <strong>
                        {(selectedPackage.price - discount).toLocaleString()} VND
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="buttons-step2">
                  <button
                    className="btn-cancel"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
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