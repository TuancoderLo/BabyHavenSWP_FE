import api from "../config/axios";

const membershipApi = {
  // Lấy chi tiết membership của 1 member
  getMemberMembership: (memberId) => {
    // GET /api/MemberMemberships/{id}
    return api.get(`MemberMemberships/${memberId}`);
  },

  // Lấy toàn bộ gói membership
  getAllPackages: () => {
    // GET /api/MembershipPackages
    return api.get("MembershipPackages");
  },
};

export default membershipApi;