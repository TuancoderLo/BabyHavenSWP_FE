import api from "../config/axios";

const MilestoneApi = {
  addMilestone: (data) => {
    return api.post("api/Milestone", data);
  },
};

export default MilestoneApi;
