import { Routes, Route, Navigate } from "react-router-dom";
import Children from "./children/ChildrenPage";
import DoctorConsultation from "./doctor/DoctorConsultation";
import Subscriptions from "./subscriptions/Subscriptions";
import Transactions from "./transactions/Transactions";
import HealthAnalyst from "./health/HealthAnalyst";
import Notifications from "./notifications/Notifications";
import Settings from "./settings/Settings";
function MemberRoutes() {
    return (
        <div className="member-content">
            <Routes>
                {/* Khi vào /member, mặc định vào Children */}
                <Route path="/" element={<Children />} />
                <Route path="doctor-consultation" element={<DoctorConsultation />} />
                <Route path="subscriptions" element={<Subscriptions />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="health-analyst" element={<HealthAnalyst />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />

                {/* Nếu nhập sai đường dẫn, quay lại HomePage */}
                <Route path="*" element={<Navigate to="/homepage" />} />
            </Routes>
        </div>
    );
}

export default MemberRoutes;