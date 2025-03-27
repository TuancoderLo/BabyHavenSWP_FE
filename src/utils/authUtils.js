// Hàm xóa dữ liệu đăng nhập khỏi localStorage và sessionStorage
export const clearAuthData = () => {
  // Danh sách các khóa cần xóa
  const keysToRemove = [
    "userData",
    "token",
    "refreshToken",
    "user",
    "userId",
    "role",
    "email",
    "name",
    "profilePicture",
    "accessToken",
    "expiration",
    "rememberMe",
    "lastLogin",
    "settings",
    "preferences",
    "childrenData",
  ];

  // Xóa từng khóa
  keysToRemove.forEach((key) => {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
    }
  });

  // Xóa session data
  sessionStorage.removeItem("session_started");

  // Kiểm tra và xóa các item khác có liên quan
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      (key.includes("token") ||
        key.includes("user") ||
        key.includes("auth") ||
        key.includes("login") ||
        key.includes("session"))
    ) {
      localStorage.removeItem(key);
      i--; // Điều chỉnh chỉ số
    }
  }

  console.log("Đã xóa dữ liệu đăng nhập thành công");
};

// Hàm đăng xuất hoàn chỉnh
export const logout = (navigate) => {
  clearAuthData();
  navigate("/login");
};

// Thêm hàm kiểm tra phiên mới
export const checkAndClearSessionData = () => {
  // Kiểm tra xem đây có phải là phiên mới không
  const isNewSession = !sessionStorage.getItem("session_started");

  if (isNewSession) {
    // Xóa dữ liệu đăng nhập
    clearAuthData();

    // Đánh dấu phiên đã bắt đầu
    sessionStorage.setItem("session_started", "true");
    console.log("Đã xóa dữ liệu đăng nhập cho phiên mới");

    return true; // Trả về true nếu đã xóa dữ liệu
  }

  return false; // Trả về false nếu không phải phiên mới
};
