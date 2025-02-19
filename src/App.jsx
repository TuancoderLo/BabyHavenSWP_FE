import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Guest from "./components/guest/Guest";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import Homepage from "./components/homepage/HomePage";
import Admin from "./components/admin/Admin";
import ChartCard from "./components/admin/ChartCard/ChartCard";
import Home from "./components/admin/Component_Sidebar/home/home";
import Blog from "./components/admin/Component_Sidebar/blog/blog";
import Members from "./components/admin/Component_Sidebar/members/members";
import Packages from "./components/admin/Component_Sidebar/packages/packages";
import Inbox from "./components/admin/Component_Sidebar/inbox/inbox";
import Notifications from "./components/admin/Component_Sidebar/notifications/notifications";
import Settings from "./components/admin/Component_Sidebar/settings/settings";

function App() {
  const [userRole, setUserRole] = useState(() => localStorage.getItem("role"));
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isAuthenticated") === "true"
  );

  // Thêm hàm để cập nhật state
  const updateAuthState = () => {
    const role = localStorage.getItem("role");
    const auth = localStorage.getItem("isAuthenticated");
    setUserRole(role);
    setIsAuthenticated(auth === "true");
  };

  useEffect(() => {
    updateAuthState();
  }, []);

  // Protected Route component
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

    if (roles && !roles.includes(userRole)) {
      console.log("Unauthorized role, redirecting to home");
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
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/homepage"
          element={
            <ProtectedRoute roles={["user"]}>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        >
          <Route index element={<ChartCard />} />
          <Route path="home" element={<Home />} />
          <Route path="blog" element={<Blog />} />
          <Route path="members" element={<Members />} />
          <Route path="packages" element={<Packages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="inbox" element={<Inbox />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
