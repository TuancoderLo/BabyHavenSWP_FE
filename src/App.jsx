import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Guest from "./components/guest/Guest";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import Homepage from "./components/homepage/HomePage";
import Admin from "./components/admin/Admin";

function App() {
  const [userRole, setUserRole] = useState(() => localStorage.getItem("role"));
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isAuthenticated") === "true"
  );
  const [email, setEmail] = useState(() => localStorage.getItem("email"));

  // Thêm hàm để cập nhật state
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
            <ProtectedRoute role={["1"]}>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role={["3"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
