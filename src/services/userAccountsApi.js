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
      status: 0, // Mặc định status = 0 (Active)
      roleId: data.roleId || 1, // Sử dụng roleId từ form, mặc định là 1 (Member)
      profilePicture: data.profilePicture,
      isVerified: false, // Mặc định là false
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
      profilePicture: data.profilePicture,
      status: data.status === "Active" ? 0 : data.status === "Inactive" ? 1 : 2,
      isVerified: data.isVerified || false,
      ...(data.password ? { password: data.password } : {}),
    };

    return api.put(`UserAccounts`, formattedData);
  },

  updateMemberAccount: (id, data) => {
    const formattedData = {
      userId: localStorage.getItem("userId"), // lấy userId từ localStorage
      username: data.username?.trim(),
      email: data.email?.trim(),
      phoneNumber: data.phoneNumber?.trim(),
      name: data.name?.trim(),
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      address: data.address?.trim(),
      status: data.status ? data.status : 0,
      roleId: 1, // roleId mặc định là 1 (Member)
      profilePicture: data.profilePicture,
      password: data.password ? data.password : "", // nếu không nhập, gửi chuỗi rỗng
      isVerified: data.isVerified,
    };
    return api.put(`UserAccounts`, formattedData);
  },

  delete: (id) => {
    // Trước khi xóa, lấy thông tin user hiện tại
    return api.get(`UserAccounts/${id}`).then((response) => {
      const userData = response.data;
      // Cập nhật status = 1 (Inactive)
      const formattedData = {
        userId: id,
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        name: userData.name,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        address: userData.address,
        profilePicture: userData.profilePicture,
        status: 1, // Set status = 1 for soft delete
        isVerified: userData.isVerified,
      };
      return api.put("UserAccounts", formattedData);
    });
  },

  getParentCategories: (id) => {
    return api.get(`UserAccounts/${id}`);
  },

  updateStatus: (id, status) => {
    return api.patch(`UserAccounts/${id}/status`, { status });
  },

  findByEmail: (email) => {
    return api.get(`UserAccounts/odata?$filter=email eq '${email}'`);
  },

  createDoctor: async (doctorData) => {
    try {
      const response = await api.post("Doctors", doctorData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createMember: async (memberData) => {
    try {
      const response = await api.post("UserAccounts", memberData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default userAccountsApi;
