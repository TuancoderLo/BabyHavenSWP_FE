import api from "../config/axios";

const alertApi = {
  getAlert: async (name, dob, id) => {
    return api.get(`Alert/${name}/${dob}/${id}`, {
      validateStatus: (status) => status === 1 || (status >= 200 && status < 300)
    });
  },
};

export default alertApi;
