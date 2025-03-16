import api from "../config/axios";

const MilestoneApi = {
  createMilestone: (data) => api.post("/Milestone", data, {
    validateStatus: (status) => status === 1 || (status >= 200 && status < 300)
  }),
};

export default MilestoneApi;
