import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./TransactionsMember.css";
import visa from "../../../assets/visa.jpg";
import vnpay from "../../../assets/vnpay.jpg";

function TransactionsMember() {
  const location = useLocation();
  const { selectedPackage, userName } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [agreed, setAgreed] = useState(false);

  // Lịch sử (nếu user không chọn gói)
  const [transactions, setTransactions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    // Nếu không có selectedPackage => hiển thị Payment History
    if (!selectedPackage) {
      // Giả lập fetch transaction
      const dummy = [
        {
          id: 1,
          title: "Allied Health Professionals Insurance Policy",
          date: "2025-03-01",
          installmentNo: 1,
          yearlyAmount: 407,
          gst: 5.61,
          paymentMethod: "Visa **** 2322",
          status: "Completed",
        },
        {
          id: 2,
          title: "Commercial Motors",
          date: "2025-03-05",
          installmentNo: 1,
          yearlyAmount: 1500,
          gst: 10.0,
          paymentMethod: "Mastercard **** 9812",
          status: "Pending",
        },
      ];
      setTransactions(dummy);
    }
  }, [selectedPackage]);

  const handleToggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handlePayNow = () => {
    if (!agreed) {
      alert("Please agree to the Terms & Conditions before paying.");
      return;
    }
    console.log("Paying with method:", paymentMethod);
    // Gọi API thanh toán...
  };

  // ================= TH1: User sang để Thanh toán gói
  if (selectedPackage) {
    // Lấy userName từ state, fallback localStorage nếu cần
    const nameFromLocal = userName || localStorage.getItem("name") || "Guest";

    return (
      <div className="transaction-page">
        {/* Steps */}
        <div className="transaction-steps">
          <div className="step done">
            <span>1</span> Personal details
          </div>
          <div className="step active">
            <span>2</span> Payment
          </div>
          <div className="step">
            <span>3</span> Complete
          </div>
        </div>

        <div className="transaction-content">
          {/* Cột trái: Form thanh toán */}
          <div className="payment-section">
            <h2 className="section-title">Select Payment Option</h2>
            <p className="section-subtitle">
              All transactions are secure and encrypted
            </p>

            {/* Thông tin user (Name) */}
            <div className="user-info-box">
              <label>User Name</label>
              <input
                type="text"
                value={nameFromLocal}
                readOnly
                style={{ marginBottom: "1rem" }}
              />
            </div>

            {/* Gói đã chọn */}
            <div className="selected-package-info">
              <p>
                You selected plan: <strong>{selectedPackage.packageName}</strong>
              </p>
              <p>Price: {selectedPackage.price} {selectedPackage.currency}</p>
            </div>

            {/* Payment method */}
            <div className="payment-methods">
              {/* <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentMethod === "paypal"}
                  onChange={handlePaymentChange}
                />
                <span>Paypal</span>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                  alt="Paypal"
                  className="payment-icon"
                />
              </label> */}

              <label className="payment-option credit-card-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit"
                  checked={paymentMethod === "credit"}
                  onChange={handlePaymentChange}
                />
                <span>Credit Card</span>
                <div className="credit-icons">
                  <img
                    src={visa}
                    alt="Visa"
                    className="credit-icon"
                  />
                  <img
                    src={vnpay}
                    alt="MasterCard"
                    className="credit-icon"
                  />
                </div>
              </label>

              {/* {paymentMethod === "credit" && (
                <div className="credit-card-form">
                  <div className="form-group">
                    <label>Name on card</label>
                    <input type="text" placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label>Card number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="two-cols">
                    <div className="form-group">
                      <label>Expiry date</label>
                      <input type="text" placeholder="MM/YY" />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input type="text" placeholder="123" />
                    </div>
                  </div>
                </div>
              )} */}

              {/* <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="googlepay"
                  checked={paymentMethod === "googlepay"}
                  onChange={handlePaymentChange}
                />
                <span>Google Pay</span>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                  alt="Google Pay"
                  className="payment-icon"
                />
              </label> */}

              {/* <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={handlePaymentChange}
                />
                <span>Cash on delivery</span>
              </label> */}
            </div>

            <div className="checkout-footer">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={() => setAgreed(!agreed)}
                />
                <span>
                  By clicking, I agree to the <u>Terms & Conditions</u> and{" "}
                  <u>Privacy Policy</u>
                </span>
              </label>
              <button className="pay-button" onClick={handlePayNow}>
                Pay Now
              </button>
            </div>
          </div>

          {/* Cột phải: giỏ hàng */}
          <div className="cart-section">
            <h3 className="section-title">Your cart</h3>
            <div className="cart-items">
              <div className="cart-item">
                <img
                  src="https://via.placeholder.com/60x60?text=Item1"
                  alt="Item"
                  className="cart-item-img"
                />
                <div className="cart-item-info">
                  <p className="item-name">
                    Membership {selectedPackage.packageName}
                  </p>
                  <p className="item-price">
                    {selectedPackage.price} {selectedPackage.currency}
                  </p>
                </div>
              </div>
            </div>

            <div className="coupon-section">
              <label>Apply coupon code</label>
              <input type="text" placeholder="Enter coupon code" />
            </div>

            <div className="order-summary">
              <p>
                <span>Subtotal:</span>{" "}
                <strong>
                  {selectedPackage.price} {selectedPackage.currency}
                </strong>
              </p>
              <p>
                <span>Shipping:</span> <strong>$0.00</strong>
              </p>
              <hr />
              <p className="order-total">
                <span>Total:</span>{" "}
                <strong>
                  {selectedPackage.price} {selectedPackage.currency}
                </strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ====================== TH2: Payment History ======================
  return (
    <div className="transaction-page payment-history-page">
      <div className="history-header">
        <h2>PAYMENT HISTORY</h2>
        <select className="history-filter">
          <option>Last 30 days</option>
          <option>Last 6 months</option>
          <option>Last year</option>
        </select>
      </div>

      <div className="transaction-history-list">
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          transactions.map((trx) => {
            const isExpanded = expandedId === trx.id;
            return (
              <div key={trx.id} className="history-item">
                <div className="history-item-header">
                  <div className="history-item-title">{trx.title}</div>
                  <div className="history-item-amount">
                    ${trx.yearlyAmount.toFixed(2)}
                  </div>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggle(trx.id)}
                  >
                    {isExpanded ? "▲" : "▼"}
                  </button>
                </div>
                {isExpanded && (
                  <div className="history-item-details">
                    <div className="detail-row">
                      <span>Payment Date:</span> {trx.date}
                    </div>
                    <div className="detail-row">
                      <span>Instalment No.:</span> {trx.installmentNo}
                    </div>
                    <div className="detail-row">
                      <span>Yearly Amount:</span>{" "}
                      ${trx.yearlyAmount.toFixed(2)}
                    </div>
                    <div className="detail-row">
                      <span>GST:</span> ${trx.gst.toFixed(2)}
                    </div>
                    <div className="detail-row">
                      <span>Payment Method:</span> {trx.paymentMethod}
                    </div>
                    <div className="detail-row">
                      <span>Status:</span> {trx.status}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default TransactionsMember;
