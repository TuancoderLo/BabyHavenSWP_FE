import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import "./Member.css";

// Import các components
import Children from "./children/ChildrenPage";
import Consultation from "./consultation/DoctorConsultation";
import TransactionsMember from "./transactionsMember/TransactionsMember";
import Membership from "./membership/MemberShipPage";
import Notifications from "./notifications/Notifications";
import Account from "./account/Account";

function Member() {
  return (
    <div className="member-page">
      <Sidebar />
      <div className="member-main">
        <div className="member-main-content">
          <Routes>
            <Route path="/" element={<Navigate to="children" replace />} />
            <Route path="children" element={<Children />} />
            <Route path="doctor-consultation" element={<Consultation />} />
            <Route path="transactions" element={<TransactionsMember />} />
            <Route path="membership" element={<Membership />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="account" element={<Account />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Member;
