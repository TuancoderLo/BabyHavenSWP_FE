import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Guest & Auth
import Guest from "./components/guest/Guest";
import Login from "./components/login/Login";
import Register from "./components/register/Register";

// HomePage (user)
import Homepage from "./components/homepage/HomePage";

// Admin
import Admin from "./components/admin/Admin";
import ChartCard from "./components/admin/ChartCard/ChartCard";
import Home from "./components/admin/Component_Sidebar/home/home";
import Blog from "./components/admin/Component_Sidebar/blog/blog";
import Members from "./components/admin/Component_Sidebar/members/members";
import AdminPackages from "./components/admin/Component_Sidebar/packages/packages";
import Inbox from "./components/admin/Component_Sidebar/inbox/inbox";
import Notifications from "./components/admin/Component_Sidebar/notifications/notifications";
import Settings from "./components/admin/Component_Sidebar/settings/settings";

//Member
import MemberPackages from "./components/packages/Packages";
// ↑ đổi tên import (MamberPackages) để khác với AdminPackages
import MemberRoutes from "./components/member/MemberRoutes";

function App() {
  const [userRole, setUserRole] = useState(() => localStorage.getItem("role"));
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isAuthenticated") === "true"
  );

  // Cập nhật lại role, auth từ localStorage
  const updateAuthState = () => {
    const role = localStorage.getItem("role");
    const auth = localStorage.getItem("isAuthenticated");
    setUserRole(role);
    setIsAuthenticated(auth === "true");
  };

  useEffect(() => {
    updateAuthState();
  }, []);

  // Component bảo vệ route
  const ProtectedRoute = ({ children, roles }) => {
    if (!isAuthenticated) {
      // Chưa đăng nhập => về login
      return <Navigate to="/login" />;
    }

    if (roles && !roles.includes(userRole)) {
      // Đăng nhập rồi nhưng role ko phù hợp => về trang chủ
      return <Navigate to="/" />;
    }

    return children; // Cho phép vào
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Guest />} />
        <Route
          path="/login"
          element={<Login onLoginSuccess={updateAuthState} />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/packages" element={<MemberPackages />} />

        {/* Protected route dành cho user */}
        <Route
          path="/homepage"
          element={
            <ProtectedRoute roles={["user"]}>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route path="/member/*" element={<ProtectedRoute roles={["user"]}><MemberRoutes /></ProtectedRoute>} />


        {/* Protected route dành cho admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        >
          {/* Các route con trong /admin */}
          <Route index element={<ChartCard />} />
          <Route path="home" element={<Home />} />
          <Route path="blog" element={<Blog />} />
          <Route path="members" element={<Members />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="inbox" element={<Inbox />} />
        </Route>

        {/* Bắt tất cả còn lại => về "/" */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
