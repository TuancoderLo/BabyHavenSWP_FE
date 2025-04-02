import api from "../config/axios";

const MilestoneApi = {
  createMilestone: (data) =>
    api.post("/Milestone", data, {
      validateStatus: (status) => {
        console.log("createMilestone status:", status);
        return status === 1 || (status >= 200 && status < 300);
      },
    }),

  // Add createChildMilestone method
  createChildMilestone: (data) =>
    api.post("/ChildMilestone", data, {
      validateStatus: (status) => {
        console.log("createChildMilestone status:", status);
        return status === 1 || (status >= 200 && status < 300);
      },
    }),

  updateChildMilestone: (childMilestoneId, data) =>
    api.put(`/ChildMilestone/${childMilestoneId}`, data, {
      validateStatus: (status) => {
        console.log("updateChildMilestone status:", status);
        return status === 1 || (status >= 200 && status < 300);
      },
    }),

  getMilestoneByChild: (child, memberId) =>
    api.get(
      `ChildMilestone/Child/${child.name}/${child.dateOfBirth}/${memberId}`,
      {
        validateStatus: (status) => {
          console.log("getMilestoneByChild status:", status);
          return status === 1 || (status >= 200 && status < 300);
        },
      }
    ),

  getAllMilestones: () =>
    api.get("/Milestone", {
      validateStatus: (status) => {
        console.log("getAllMilestones status:", status);
        return status === 1 || (status >= 200 && status < 300);
      },
    }),

  getMilestoneById: (id) =>
    api.get(`/Milestone/${id}`, {
      validateStatus: (status) => {
        console.log("getMilestoneById status:", status);
        return status === 1 || (status >= 200 && status < 300);
      },
    }),

  getMilestonesByAgeRange: (minAge, maxAge) =>
    api.get(`/Milestone/odata?$filter=minAge ge ${minAge} and maxAge le ${maxAge}`, {
      validateStatus: (status) => {
        console.log("getMilestonesByAgeRange status:", status);
        return status === 1 || (status >= 200 && status < 300);
      },
    }),
};

export default MilestoneApi;