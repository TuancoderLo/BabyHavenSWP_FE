import api from "../config/axios";

const membershipApi = {
  // Get membership details for a specific member
  getMemberMembership: (memberId) => {
    // GET /api/MemberMemberships/{id}
    return api.get(`MemberMemberships/${memberId}`);
  },

  // Get all membership packages
  getAllPackages: () => {
    // GET /api/MembershipPackages
    return api.get("MembershipPackages");
  },

  // Get all memberships
  getAllMemberships: () => {
    // GET /api/MemberMemberships
    return api.get("MemberMemberships");
  },

  // Delete a membership
  deleteMembership: (memberMembershipId) => {
    // DELETE /api/MemberMemberships/{memberMembershipId}
    return api.delete(`MemberMemberships/${memberMembershipId}`);
  },

  // Thêm các hàm mới
  createMembership: (data) => {
    return api.post("MemberMemberships", data);
  },

  updateMembership: (memberMembershipId, data) => {
    return api.put(`MemberMemberships/${memberMembershipId}`, data);
  },
};

export default membershipApi;
