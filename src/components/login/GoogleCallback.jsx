import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom"; // Để điều hướng người dùng
import { jwtDecode } from "jwt-decode";
import "./GoogleCallback.css";

const GoogleCallback = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    useEffect(() => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get("token"); // Lấy token từ query string

            if (typeof token === "string" && token.trim() !== "") {
                // Giải mã token để lấy thông tin người dùng (nếu cần)
                const tokenPayload = jwtDecode(token);
                const user = {
                    email: tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
                    name: tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
                    userId: tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
                    roleId: tokenPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
                    profilePicture: tokenPayload["ProfileImage"],
                    isVerifed: tokenPayload["IsVerified"]
                };
                localStorage.setItem("isAuthenticated", "true");
                localStorage.setItem("role", user.roleId);

                // Lưu thông tin từ token payload
                localStorage.setItem("email", user.email);
                localStorage.setItem("name", user.name);
                localStorage.setItem("profilePicture", user.profilePicture);
                localStorage.setItem("isVerified", user.isVerifed);

                console.log(tokenPayload);

                navigate("/homepage");
            } else {
                setError("Invalid or missing token");
                console.error("Invalid or missing token");
            }
        } catch (error) {
            // Xử lý lỗi nếu không có token hoặc token không hợp lệ
            console.error("Error during Google authentication:", error);
        }
    }, [navigate]);

    return (
        <div className="google-callback-container">
            <div className="loading-message">
                <div className="spinner"></div>
                <p>Processing Google Authentication...</p>
            </div>
        </div>
    );
};

export default GoogleCallback;
