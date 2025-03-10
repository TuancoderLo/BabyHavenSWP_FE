import React, { useState, useEffect } from "react";
import "./TransactionsMember.css";

function TransactionsMember() {
  // Lịch sử
  const [transactions, setTransactions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
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
  }, []);


  const handleToggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };
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
