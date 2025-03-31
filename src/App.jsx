import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Guest & Auth
import Guest from "./pages/Home/HomePage/Guest";
import Login from "./pages/Authentication/Login/Login";
import Register from "./pages/Authentication/Register/Register";
import ForgetPassword from "./pages/Authentication/Login/ForgetPassword";
import VerifyEmail from "./pages/Authentication/Register/VerifyEmail";
import CategoryPage from "./pages/Home/ApiForHomePage/Navbar/CategoryPage";
import FormatBlog from "./pages/Home/ApiForHomePage/Navbar/FormatBlog";
import CompleteProfile from "./pages/Authentication/CompleteProfile";

// HomePage (user)
import Homepage from "./pages/Home/HomePage/HomePage";
import Member from "./pages/Member/member";
// Admin
import Admin from "./pages/Admin/Admin";
// import ChartCard from "./components/admin/ChartCard/ChartCard";
// import Home from "./components/admin/Component_Sidebar/home/home";
import Blog from "./pages/Admin/DashboardAdmin/blog/blog";
import Members from "./pages/Admin/DashboardAdmin/members/members";
import AdminPackages from "./pages/Admin/DashboardAdmin/packages/packages";
import RateAdmin from "./pages/Admin/DashboardAdmin/Rating/RateAdmin";

//doctor
import Doctor from "./pages/Doctor/Doctor";

//Member
import MemberPackages from "./components/packages/Packages.jsx";
// ↑ đổi tên import (MamberPackages) để khác với AdminPackages

import GoogleCallback from "./pages/Authentication/GoogleCallback.jsx";

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
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/google-callback" element={<GoogleCallback />} />
        <Route path="/register" element={<Register />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/packages" element={<MemberPackages />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/blog/:blogId" element={<FormatBlog />} />

        {/* Protected routes */}
        <Route
          path="/homepage"
          element={
            <ProtectedRoute roles={["1", "3"]}>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute roles={["2", "3"]}>
              <Doctor />
            </ProtectedRoute>
          }
        />

        {/* Route con dành cho Member */}
        <Route
          path="/member/*"
          element={
            <ProtectedRoute roles={["1", "3"]}>
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
          {/* <Route index element={<ChartCard />} /> */}
          {/* <Route path="home" element={<Home />} /> */}
          <Route path="blog" element={<Blog />} />
          <Route path="members" element={<Members />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="ratings" element={<RateAdmin />} />
        </Route>

        {/* Bắt tất cả còn lại => về "/" */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
