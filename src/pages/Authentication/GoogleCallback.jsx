import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../../config/axios";
import "./GoogleCallback.css";

const GoogleCallback = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    // Xử lý ngay khi component được render
    const handleGoogleAuth = async () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get("token"); // Lấy token từ URL

            if (!token) {
                throw new Error("Invalid or missing token");
            }

            // Giải mã token để lấy thông tin người dùng
            const tokenPayload = jwtDecode(token);
            const user = {
                email: tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
                name: tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
                userId: tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
                roleId: tokenPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
                profilePicture: tokenPayload["ProfileImage"],
                isVerified: tokenPayload["IsVerified"],
            };

            // Nếu là role member thì lưu memberId vào localStorage
            if (user.roleId === "1") {
                try {
                    const member = await api.get("Members/member/" + user.userId);
                    localStorage.setItem("memberId", member.data.data.memberId);
                    console.log("Member is verified:", member.data.data.IsVerified);
                } catch (error) {
                    console.error("Error fetching member:", error);
                }
            }

            // Lưu thông tin vào localStorage
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("role", user.roleId);
            localStorage.setItem("isVerified", user.isVerified);
            localStorage.setItem("email", user.email);
            localStorage.setItem("userId", user.userId);
            localStorage.setItem("name", user.name);

            console.log("User:", user);
            console.log("User is verified:", user.isVerified);

            console.log("User authenticated:", tokenPayload);
            onLoginSuccess();
            if (user.isVerified === false) {
                navigate("/complete-profile");
            } else {
                navigate("/homepage");
            }
        } catch (error) {
            setError(error.message);
            console.error("Error during Google authentication:", error);
        }
    };

    handleGoogleAuth(); // Gọi hàm xử lý ngay khi component render

    return (
        <div className="google-callback-container">
            <div className="loading-message">
                <div className="spinner"></div>
                <p>Processing Google Authentication...</p>
            </div>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default GoogleCallback;
