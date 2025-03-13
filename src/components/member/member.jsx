import "./member.css";
import Sidebar from "./sidebar/Sidebar.jsx";
import NavBar from "./navbar/NavBar.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import Children from "./children/ChildrenPage";
import Consultation from "./consulation/DoctorConsultation";
import Membership from "./membership/MemberShipPage";
import TransactionsMember from "./transactionsMember/TransactionsMember";
import Notifications from "./notifications/Notifications";
import Account from "./account/Account";

function Member() {
  return (
    <div className="member-page">
      {/* Sidebar cố định */}
      <Sidebar />
      <div className="member-main">
        {/* Thanh Navbar cố định */}
        <div className="member-navbar">
          <NavBar />
        </div>
      {/* Container cho nội dung chính */}
      <div className="member-main-content">

        {/* Các trang con sẽ được render ở đây */}
        <Routes>
          <Route index element={<Children />} />
          <Route path="children" element={<Children />} />
          <Route path="doctor-consultation" element={<Consultation />} />
          <Route path="transactions" element={<TransactionsMember />} />
          <Route path="membership" element={<Membership />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="account" element={<Account />} />
          <Route path="*" element={<Navigate to="/homepage" />} />
        </Routes>
      </div>
    </div>
  </div>
  );
}

export default Member;
