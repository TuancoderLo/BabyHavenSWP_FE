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

// Thêm hàm mới để xử lý việc hủy các thao tác
export const clearTemporaryData = (
  dataTypes = [],
  navigate = null,
  navigateTo = null
) => {
  // Xóa các dữ liệu tạm thời cụ thể
  if (dataTypes.includes("registration")) {
    localStorage.removeItem("registration_data");
    localStorage.removeItem("pending_email");
  }

  if (dataTypes.includes("verification")) {
    localStorage.removeItem("verification_step");
    localStorage.removeItem("verification_token");
  }

  if (dataTypes.includes("payment")) {
    localStorage.removeItem("payment_info");
    localStorage.removeItem("order_data");
  }

  if (dataTypes.includes("draft")) {
    localStorage.removeItem("draft_content");
    localStorage.removeItem("temp_images");
  }

  // Xóa tất cả dữ liệu tạm thời nếu không chỉ định loại
  if (dataTypes.length === 0) {
    const tempKeys = [
      "registration_data",
      "pending_email",
      "verification_step",
      "verification_token",
      "payment_info",
      "order_data",
      "draft_content",
      "temp_images",
    ];

    tempKeys.forEach((key) => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
      }
    });
  }

  // Chuyển hướng nếu có yêu cầu
  if (navigate && navigateTo) {
    navigate(navigateTo);
  }

  console.log("Đã xóa dữ liệu tạm thời thành công");
};

// Thiết lập thời gian sống cho dữ liệu tạm thời
export const setTemporaryDataWithExpiry = (
  key,
  value,
  expiryInMinutes = 10
) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + expiryInMinutes * 60 * 1000,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

// Lấy dữ liệu tạm thời có kiểm tra hết hạn
export const getTemporaryDataWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const now = new Date();

  // So sánh thời gian hiện tại với thời gian hết hạn
  if (now.getTime() > item.expiry) {
    // Nếu đã hết hạn, xóa và trả về null
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
};

// Hàm kiểm tra và xóa dữ liệu tạm thời đã hết hạn
export const cleanupExpiredTemporaryData = () => {
  // Danh sách các khóa có thể là dữ liệu tạm thời
  const tempKeys = [
    "registration_data",
    "pending_email",
    "verification_step",
    "verification_token",
    "payment_info",
    "order_data",
    "draft_content",
    "temp_images",
  ];

  tempKeys.forEach((key) => {
    const itemStr = localStorage.getItem(key);
    if (itemStr) {
      try {
        const item = JSON.parse(itemStr);
        if (item.expiry && new Date().getTime() > item.expiry) {
          localStorage.removeItem(key);
          console.log(`Đã xóa dữ liệu tạm thời hết hạn: ${key}`);
        }
      } catch (e) {
        // Nếu không phải JSON hợp lệ hoặc không có expiry, bỏ qua
      }
    }
  });
};
