import api from "../config/axios";

const childApi = {
  // Lấy danh sách trẻ theo Id
  getByMember: (memberId) => api.get(`Children/member/${memberId}`),
  // Tạo mới thông tin trẻ
  createChild: (childData) => api.post("/Children", childData),
  // Tạo mới growth record
  createGrowthRecord: (growthData) => api.post("/GrowthRecord", growthData),
  
  getChildByName: (child, memberId) => api.get(`Children/${child.name}/${child.dateOfBirth}/${memberId}`),
  getGrowthRecords: (childId) => api.get(`GrowthRecord/child/${childId}`),
};

export default childApi;