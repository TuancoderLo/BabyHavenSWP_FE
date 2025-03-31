import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../../layouts/Member/sidebar/Sidebar";
import "./Member.css";

// Import các components
import Children from "./DashboardMember/children/ChildrenPage";
import Consultation from "./DashboardMember/consultation/DoctorConsultation";
import TransactionsMember from "./DashboardMember/transactionsMember/TransactionsMember";
import Membership from "./DashboardMember/membership/MemberShipPage";
import Account from "./DashboardMember/account/Account";
import Milestone from "./DashboardMember/milestone/MilestonePage";

function Member() {
  return (
    <div className="member-page">
      <Sidebar />
      <div className="member-main">
        <div className="member-main-content">
          <Routes>
            <Route path="/" element={<Navigate to="children" replace />} />
            <Route path="children" element={<Children />} />
            <Route path="milestone" element={<Milestone />} />
            <Route path="doctor-consultation" element={<Consultation />} />
            <Route path="transactions" element={<TransactionsMember />} />
            <Route path="membership" element={<Membership />} />
            <Route path="account" element={<Account />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Member;
