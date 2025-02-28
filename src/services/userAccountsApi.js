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
      roleId: 2, // Mặc định roleId = 2 (Member)
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
    };

    return api.put(`UserAccounts/${id}`, formattedData);
  },

  delete: (id) => {
    return api.delete(`UserAccounts/${id}`);
  },

  getParentCategories: (id) => {
    return api.get(`UserAccounts/${id}`);
  },
};

export default userAccountsApi;
