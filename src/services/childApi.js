import api from "../config/axios";

const childApi = {
  // Lấy danh sách trẻ theo Id
  getByMember: (memberId) => api.get(`Children/member/${memberId}`),
  // Tạo mới thông tin trẻ
  createChild: (childData) => api.post("/Children", childData),
  // Tạo mới growth record
  createGrowthRecord: (growthData) => api.post("/GrowthRecord", growthData),
  
  getChildByName: (child, memberId) => api.get(`Children/${child.name}/${child.dateOfBirth}/${memberId}`),

  getGrowthRecords: (odataParams) => api.get(`GrowthRecord/odata`, { params: odataParams }),
  getGrowthRecordsRange:(childId, startDate, endDate) => api.get(`GrowthRecord/child/${childId}/date-range`, {
    params: {
      startDate,
      endDate,
    },
  }),

};

export default childApi;