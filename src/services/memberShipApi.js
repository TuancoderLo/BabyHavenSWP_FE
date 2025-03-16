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

  // Thêm phương thức mới để lấy tất cả memberships
  getAllMemberships: () => {
    // GET /api/MemberMemberships
    return api.get("MemberMemberships");
  },

  // Thêm phương thức xóa membership
  deleteMembership: (memberMembershipId) => {
    // DELETE /api/MemberMemberships/{memberMembershipId}
    return api.delete(`MemberMemberships/${memberMembershipId}`);
  },
};

export default membershipApi;
