import api from "../config/axios";

/**
 * Lấy thông tin của một member theo ID
 * @param {string} memberId - ID của member cần lấy thông tin
 * @returns {Promise<Object>} - Thông tin chi tiết của member
 */
export const getMemberById = async (memberId) => {
  try {
    const response = await api.get(`Members/${memberId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin member:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin của một member
 * @param {string} memberId - ID của member cần cập nhật
 * @param {Object} memberData - Dữ liệu cập nhật cho member
 * @returns {Promise<Object>} - Thông tin member sau khi cập nhật
 */
export const updateMember = async (memberId, memberData) => {
  try {
    const response = await api.put(`Members/${memberId}`, memberData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật member:", error);
    throw error;
  }
};

/**
 * Lấy danh sách tất cả members
 * @returns {Promise<Array>} - Danh sách các members
 */
export const getAllMembers = async () => {
  try {
    const response = await api.get("Members");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách members:", error);
    throw error;
  }
};
