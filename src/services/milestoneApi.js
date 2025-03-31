import api from "../config/axios";

const MilestoneApi = {
  createMilestone: (data) =>
    api.post("/Milestone", data, {
      validateStatus: (status) => {
        console.log("createMilestone status:", status); // Debug log
        return status === 1 || (status >= 200 && status < 300);
      },
    }),

  createChildMilestone: (data) =>
    api.post("/ChildMilestone", data, {
      validateStatus: (status) => {
        console.log("createChildMilestone status:", status); // Debug log
        return status === 1 || (status >= 200 && status < 300);
      },
    }),

  getMilestoneByChild: (child, memberId) =>
    api.get(
      `ChildMilestone/Child/${child.name}/${child.dateOfBirth}/${memberId}`,
      {
        validateStatus: (status) => {
          console.log("getMilestoneByChild status:", status); // Debug log
          return status === 1 || (status >= 200 && status < 300);
        },
      }
    ),

  // Get all system milestones
  getAllMilestones: () =>
    api.get("/Milestone", {
      validateStatus: (status) => {
        console.log("getAllMilestones status:", status); // Debug log
        return status === 1 || (status >= 200 && status < 300);
      },
    }),

  // Get milestone by ID
  getMilestoneById: (id) =>
    api.get(`/Milestone/${id}`, {
      validateStatus: (status) => {
        console.log("getMilestoneById status:", status); // Debug log
        return status === 1 || (status >= 200 && status < 300);
      },
    }),

  // Get milestones by age range (in months) using OData
  getMilestonesByAgeRange: (minAge, maxAge) =>
    api.get(`/Milestone/odata?$filter=minAge ge ${minAge} and maxAge le ${maxAge}`, {
      validateStatus: (status) => {
        console.log("getMilestonesByAgeRange status:", status); // Debug log
        return status === 1 || (status >= 200 && status < 300);
      },
    }),
};

export default MilestoneApi;