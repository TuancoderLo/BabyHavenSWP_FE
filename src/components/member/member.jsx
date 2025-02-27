import "./member.css";
import Sidebar from "./sidebar/Sidebar.jsx";
import NavBar from "./navbar/NavBar.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import Children from "./children/ChildrenPage";
import DoctorConsultation from "./doctor/DoctorConsultation";
import Subscriptions from "./subscriptions/Subscriptions";
import Transactions from "./transactions/Transactions";
import HealthAnalyst from "./health/HealthAnalyst";
import Notifications from "./notifications/Notifications";
import Settings from "./settings/Settings";

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
          <Route path="doctor-consultation" element={<DoctorConsultation />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="health-analyst" element={<HealthAnalyst />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/homepage" />} />
        </Routes>
      </div>
    </div>
  </div>
  );
}

export default Member;
