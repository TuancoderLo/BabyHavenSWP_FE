import React, { useState, useEffect } from "react";
import "./TransactionsMember.css";
import transactionsApi from "../../../../services/transactionsApi";

function TransactionsMember() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("No userId found in localStorage");
      return;
    }

    // Gọi API: GET /api/Transactions/transaction/{userId}
    transactionsApi
      .getMemberTransactions(userId)
      .then((res) => {
        if (res.data?.data) {
          setTransactions(res.data.data);
        }
      })
      .catch((err) => console.error("Error fetching transactions:", err));
  }, []);

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

      {transactions.length === 0 ? (
        <p className="no-transaction">No transactions found.</p>
      ) : (
        <div className="transaction-history-list">
          <table className="history-table">
            <thead>
              <tr>
                {/* Thêm cột ID auto-increment */}
                <th>ID</th>
                <th>Package</th>
                {/* Gộp Amount + Currency => cột “Amount” */}
                <th>Amount</th>
                {/* Hiển thị ngày + giờ */}
                <th>Transaction Date</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((trx, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{trx.packageName}</td>
                  {/* Gộp amount + currency => 1279000 VND */}
                  <td>
                    {trx.amount.toLocaleString()} {trx.currency}
                  </td>
                  {/* Dùng toLocaleString() => hiển thị cả ngày & giờ */}
                  <td>{new Date(trx.transactionDate).toLocaleString()}</td>
                  <td>{trx.paymentMethod}</td>
                  <td>{trx.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionsMember;
