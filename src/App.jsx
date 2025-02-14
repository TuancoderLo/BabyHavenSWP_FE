import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Guest from "./components/guest/Guest";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import Homepage from "./components/homepage/HomePage";
import Dashboard from "./components/admin/Dashboard/Dashboard";
import Sidebar from "./components/admin/Sidebar/Sidebar";
import Navbar from "./components/admin/Navbar/Navbar";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
    <> <div className="app-container">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Phần nội dung chính (Navbar + trang) */}
      <div className="main-content">
        <Navbar toggleSidebar={toggleSidebar} />
        <Dashboard />
      </div>
    </div> <BrowserRouter>
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
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter></>

  );
}

export default App;
