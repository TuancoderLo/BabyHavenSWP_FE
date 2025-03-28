import { setTemporaryDataWithExpiry } from "../../../utils/authUtils";

// Thay vì
localStorage.setItem("registration_data", JSON.stringify(formData));
localStorage.setItem("pending_email", formData.email);

// Sử dụng
setTemporaryDataWithExpiry("registration_data", formData, 15); // hết hạn sau 15 phút
setTemporaryDataWithExpiry("pending_email", formData.email, 15);
