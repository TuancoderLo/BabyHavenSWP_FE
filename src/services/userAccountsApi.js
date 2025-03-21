import api from "../config/axios";

const userAccountsApi = {
  getAll: () => {
    return api.get("UserAccounts");
  },

  getById: (id) => {
    return api.get(`UserAccounts/${id}`);
  },

  create: (data) => {
    const formattedData = {
      username: data.username?.trim(),
      email: data.email?.trim(),
      phoneNumber: data.phoneNumber?.trim(),
      name: data.name?.trim(),
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      address: data.address?.trim(),
      password: data.password,
      status: 0, // Mặc định status = 0
      roleId: data.roleId || 1, // Sử dụng roleId từ form, mặc định là 1 (Member) nếu không có
      profilePicture: data.profilePicture, // Đảm bảo thêm trường này nếu có
    };

    return api.post("UserAccounts", formattedData);
  },

  update: (id, data) => {
    const formattedData = {
      userId: id,
      username: data.username?.trim(),
      email: data.email?.trim(),
      phoneNumber: data.phoneNumber?.trim(),
      name: data.name?.trim(),
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      address: data.address?.trim(),
      status: data.status || 0,
      roleId: data.roleId,
      profilePicture: data.profilePicture,
      ...(data.password ? { password: data.password } : {}),
    };

    return api.put(`UserAccounts/${id}`, formattedData);
  },

  delete: (id) => {
    return api.delete(`UserAccounts/${id}`);
  },

  getParentCategories: (id) => {
    return api.get(`UserAccounts/${id}`);
  },

  updateStatus: (id, status) => {
    return api.patch(`UserAccounts/${id}/status`, { status });
  },
};

export default userAccountsApi;
