import api from "../config/axios";

const alertApi = {
  getAlert: async (name, dob, id) => {
    try {
      const response = await api.get(`Alert/${name}/${dob}/${id}`, {
        validateStatus: (status) => status === 1 || (status >= 200 && status < 300),
      });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch alerts");
    }
  },
};

export default alertApi;