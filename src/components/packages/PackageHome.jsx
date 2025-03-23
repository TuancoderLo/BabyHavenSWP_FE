import React, { useState, useEffect } from "react";
import "./PackageHome.css";
import membershipApi from "../../services/memberShipApi";
import transactionsApi from "../../services/transactionsApi";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import packagesIcon from "../../assets/packages.png";
import momo from "../../assets/momo.png";
import vnpay from "../../assets/vnpay.jpg";
import visa from "../../assets/visa.jpg";
import logo from "../../assets/Logo.png";
import name from "../../assets/Name.png";
import api from "../../config/axios";
import packageApi from "../../services/packageApi";
import vnpayApi from "../../services/vnpayApi";

function Packages() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [packagesData, setPackagesData] = useState([]);
  const navigate = useNavigate();

  // 0 = List gói, 1 = Choose how to pay, 2 = Payment info, 3 = Congrat
  const [currentStep, setCurrentStep] = useState(0);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [error, setError] = useState("");
  const [currentPlan, setCurrentPlan] = useState(null);

  // Kiểm tra URL param ?paymentStatus=success => Step 3
  useEffect(() => {
    const processPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const status = params.get("vnp_TransactionStatus"); // "00" là thành công

      if (status === "00") {
        console.log("Thanh toán thành công!");

        // Lưu vào sessionStorage
        const pkgJSON = localStorage.getItem("selectedPackage");
        if (pkgJSON) {
          sessionStorage.setItem("completedPayment", "true");
          sessionStorage.setItem("selectedPackageAfterPayment", pkgJSON);

          try {
            // Gọi API để xác nhận thanh toán
            const result = await vnpayApi.paymentConfirm(
              Object.fromEntries(params.entries())
            );
            sessionStorage.setItem("result", result);
            console.log("Kết quả từ API:", result);

            // Redirect về homepage
            window.location.href = "/homepage";
          } catch (error) {
            console.error("Lỗi khi gửi yêu cầu xác nhận thanh toán:", error);
          }
        }
      } else {
        console.error("Thanh toán thất bại hoặc không xác định.");
      }
    };
    processPayment();
    console.log(sessionStorage.getItem("result"));
  }, []);

  // Thêm useEffect mới để kiểm tra trạng thái thanh toán đã hoàn tất
  useEffect(() => {
    // Kiểm tra xem đã thanh toán thành công chưa (sau khi navigate từ payment về)
    const completedPayment = sessionStorage.getItem("completedPayment");
    console.log(completedPayment);
    if (completedPayment === "true") {
      // Đợi một khoảng thời gian ngắn để đảm bảo homepage đã render
      const timer = setTimeout(() => {
        const pkgJSON = sessionStorage.getItem("selectedPackageAfterPayment");
        if (pkgJSON) {
          setSelectedPackage(JSON.parse(pkgJSON));
        }

        setCurrentStep(3);
        setShowOverlay(true);

        // Xóa dữ liệu từ sessionStorage để tránh hiển thị lại khi refresh
        sessionStorage.removeItem("completedPayment");
        sessionStorage.removeItem("selectedPackageAfterPayment");
      }, 700); // Đợi 500ms

      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array => run once after component mounts

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
      const newMemberMembershipId = await transactionsApi.getMemberMembershipId(
        membershipId
      );
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

      // 4) Gọi API VNPay để tạo URL thanh toán với gatewayTransactionId
      const paymentRes = await transactionsApi.createPayment(
        gatewayTransactionId
      );
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
  // Add new useEffect to get current plan
  useEffect(() => {
    const memberId = localStorage.getItem("memberId");
    if (memberId) {
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
    } else {
      setCurrentPlan(null);
    }
  }, []);

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
                <h2 className="modal-title">Explore the different</h2>

                <div className="packages-container">
                  {/* Free Package */}
                  <div className="package-card-homepage free">
                    <h3>Free</h3>
                    <p className="package-description">
                      Free membership with basic features
                    </p>
                    <div className="feature-list">
                      <div className="feature-item">
                        <span className="feature-label">Support services</span>
                        <span className="feature-value">Low</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-label">
                          Max children allowed
                        </span>
                        <span className="feature-value">1</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-label">
                          Available to make consultation with experts
                        </span>
                        <span className="feature-value">Not allowed</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-label">
                          Tracking milestones of child
                        </span>
                        <span className="feature-value">
                          3 milestone per child
                        </span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-label">
                          Early warning about child health
                        </span>
                        <span className="feature-value">Available</span>
                      </div>
                    </div>

                    <div className="package-price">
                      <span className="price-amount Free">
                        {packagesData
                          .find((p) => p.packageName === "Free")
                          ?.price.toLocaleString()}
                        đ
                      </span>
                      <span className="price-duration Free">
                        {
                          packagesData.find((p) => p.packageName === "Free")
                            ?.durationMonths
                        }                      </span>
                      <span className="price-duration Free"> Months</span>
                    </div>

                    <button
                      className={`package-btn-homepage ${
                        currentPlan?.packageName === "Free"
                          ? "current-plan"
                          : "Free"
                      }`}
                      disabled={currentPlan?.packageName === "Free"}
                    >
                      {currentPlan?.packageName === "Free"
                        ? "YOUR CURRENT PLAN"
                        : "Free"}
                    </button>
                  </div>

                  {/* Standard Package */}
                  <div className="package-card-homepage standard">
                    <div className="best-service-badge">POPULAR</div>
                    <h3>STANDARD</h3>
                    <p className="package-description">
                      Standard membership with advance features
                    </p>
                    <div className="feature-list">
                      <div className="feature-item">
                        <span className="feature-label">Support services</span>
                        <span className="feature-value">Medium</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-label">
                          Max children allowed
                        </span>
                        <span className="feature-value">2</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-label">
                          Available to make consultation with experts
                        </span>
                        <span className="feature-value">
                          5 consultation per month
                        </span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-label">
                          Tracking milestones of child
                        </span>
                        <span className="feature-value">Unlimited</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-label">
                          Early warning about child health
                        </span>
                        <span className="feature-value">Available</span>
                      </div>
                    </div>

                    <div className="package-price">
                      <span className="price-amount-homepage">
                        {packagesData
                          .find((p) => p.packageName === "Standard")
                          ?.price.toLocaleString()}
                        đ
                      </span>
                      <span className="price-duration">
                        {
                          packagesData.find((p) => p.packageName === "Standard")
                            ?.durationMonths
                        }
                      </span>
                      <span className="price-duration"> Months</span>
                    </div>

                    <button
                      className={`package-btn-homepage ${
                        currentPlan?.packageName === "Standard"
                          ? "current-plan"
                          : "standard"
                      }`}
                      onClick={() =>
                        currentPlan?.packageName !== "Standard" &&
                        handleBuyPackage(
                          packagesData.find((p) => p.packageName === "Standard")
                        )
                      }
                      disabled={currentPlan?.packageName === "Standard"}
                    >
                      {currentPlan?.packageName === "Standard"
                        ? "YOUR CURRENT PLAN"
                        : "GO STANDARD"}
                    </button>
                  </div>
                  {/* Premium Package */}
                  <div className="package-card-homepage premium">
                    <div className="premium-icon">
                      <img src={packagesIcon} alt="Packages Icon" />
                    </div>
                    <div className="best-service-badge">BEST SERVICE</div>
                    <h3>PREMIUM</h3>
                    <p className="package-description">
                      Premium membership with full features
                    </p>
                    <div className="feature-list">
                      <div className="feature-item">
                        <span className="feature-label">Support services</span>
                        <span className="feature-value">Best</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-label">
                          Max children allowed
                        </span>
                        <span className="feature-value">6</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-label">
                          Available to make consultation with experts
                        </span>
                        <span className="feature-value">
                          10 consultation per month
                        </span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-label">
                          Tracking milestones of child
                        </span>
                        <span className="feature-value">Unlimited</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-label">
                          Early warning about child health
                        </span>
                        <span className="feature-value">Available</span>
                      </div>
                    </div>

                    <div className="package-price">
                      <span className="price-amount-homepage">
                        {packagesData
                          .find((p) => p.packageName === "Premium")
                          ?.price.toLocaleString()}
                        đ
                      </span>
                      <span className="price-duration">
                        {
                          packagesData.find((p) => p.packageName === "Premium")
                            ?.durationMonths
                        }
                      </span>
                      <span className="price-duration"> Months</span>
                    </div>

                    <button
                      className={`package-btn-homepage ${
                        currentPlan?.packageName === "Premium"
                          ? "current-plan"
                          : "premium-btn"
                      }`}
                      onClick={() =>
                        currentPlan?.packageName !== "Premium" &&
                        handleBuyPackage(
                          packagesData.find((p) => p.packageName === "Premium")
                        )
                      }
                      disabled={currentPlan?.packageName === "Premium"}
                    >
                      {currentPlan?.packageName === "Premium"
                        ? "YOUR CURRENT PLAN"
                        : "GO PREMIUM"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1, 2, 3 remain unchanged */}
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
                    className={`payment-button ${paymentMethod === "CreditCard" ? "active" : ""
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
                    className={`payment-button ${paymentMethod === "Momo" ? "active" : ""
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
                        onClick={() => handleCloseOverlay()}
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
