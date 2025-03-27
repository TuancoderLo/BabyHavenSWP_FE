import api from "../config/axios";

const bmiPercentitleApi = {
  // Get membership details for a specific member
  getAll: () => {
    // GET /api/MemberMemberships/{id}
    return api.get(`BmiPercentile`);
  },

  getByAgeAndGender: (age, gender) => {
    // GET /api/MemberMemberships/{id}
    return api.get(`BmiPercentile/${age}/${gender}`);
  }
}

export default bmiPercentitleApi;