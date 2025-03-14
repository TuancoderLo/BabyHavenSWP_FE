import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Guest & Auth
import Guest from "./components/guest/Guest";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import CategoryPage from "./pages/CategoryPage";

// HomePage (user)
import Homepage from "./components/homepage/HomePage";
import Member from "./components/member/member";
// Admin
import Admin from "./components/admin/Admin";
import ChartCard from "./components/admin/ChartCard/ChartCard";
// import Home from "./components/admin/Component_Sidebar/home/home";
import Blog from "./components/admin/Component_Sidebar/blog/blog";
import Members from "./components/admin/Component_Sidebar/members/members";
import AdminPackages from "./components/admin/Component_Sidebar/packages/packages";
import Inbox from "./components/admin/Component_Sidebar/inbox/inbox";
import Notifications from "./components/admin/Component_Sidebar/notifications/notifications";
import Settings from "./components/admin/Component_Sidebar/settings/settings";

//doctor
import Doctor from "./pages/Doctor/Doctor";

//Member
import MemberPackages from "./components/packages/Packages";
// ↑ đổi tên import (MamberPackages) để khác với AdminPackages

import GoogleCallback from "./components/login/GoogleCallback.jsx";

function App() {
  const [userRole, setUserRole] = useState(() => {
    const role = localStorage.getItem("role");
    console.log("Initial role from localStorage:", role);
    return role;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isAuthenticated") === "true"
  );
  const [email, setEmail] = useState(() => localStorage.getItem("email"));

  // Cập nhật lại role, auth từ localStorage
  const updateAuthState = () => {
    const role = localStorage.getItem("role");
    const auth = localStorage.getItem("isAuthenticated");
    const email = localStorage.getItem("email");
    setUserRole(role);
    setIsAuthenticated(auth === "true");
    setEmail(email);
  };

  useEffect(() => {
    updateAuthState();
  }, []);

  // Component bảo vệ route
  const ProtectedRoute = ({ children, roles }) => {
    console.log("Protected Route Check:", {
      isAuthenticated,
      userRole,
      requiredRoles: roles,
    });

    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      return <Navigate to="/login" />;
    }

    // Kiểm tra role
    if (!roles.includes(userRole)) {
      console.log(`User role ${userRole} not in allowed roles ${roles}`);
      return <Navigate to="/" />;
    }

    return children;
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
        <Route path="/google-callback" element={<GoogleCallback />} />
        <Route path="/register" element={<Register />} />
        <Route path="/packages" element={<MemberPackages />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />

        {/* Protected routes */}
        <Route
          path="/homepage"
          element={
            <ProtectedRoute roles={["1"]}>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute roles={["2"]}>
              <Doctor />
            </ProtectedRoute>
          }
        />

        {/* Route con dành cho Member */}
        <Route
          path="/member/*"
          element={
            <ProtectedRoute roles={["1"]}>
              <Member />
            </ProtectedRoute>
          }
        />
        {/* Protected route dành cho admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["3"]}>
              <Admin />
            </ProtectedRoute>
          }
        >
          {/* Các route con trong /admin */}
          <Route index element={<ChartCard />} />
          {/* <Route path="home" element={<Home />} /> */}
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
