import api from "../config/axios";

const MilestoneApi = {
  createMilestone: (data) =>
    api.post("/Milestone", data, {
      validateStatus: (status) =>
        status === 1 || (status >= 200 && status < 300),
    }),

  createChildMilestone: (data) =>
    api.post("/ChildMilestone", data, {
      validateStatus: (status) =>
        status === 1 || (status >= 200 && status < 300),
    }),

  getMilestoneByChild: (child, memberId) =>
    api.get(
      `ChildMilestone/Child/${child.name}/${child.dateOfBirth}/${memberId}`
    ),
};

export default MilestoneApi;
