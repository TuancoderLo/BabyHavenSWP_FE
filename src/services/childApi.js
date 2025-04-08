import api from "../config/axios";

const childApi = {
  // Lấy danh sách trẻ theo memberId
  getByMember: (memberId) => api.get(`Children/member/${memberId}`),
  // Tạo mới thông tin trẻ
  createChild: (childData) => api.post("/Children", childData),
  // Tạo mới growth record
  createGrowthRecord: (growthData) => api.post("/GrowthRecord", growthData),

  // Cập nhật thông tin trẻ
  updateGrowthRecord: (childId, growthData) =>
    api.put(`/GrowthRecord/${childId}`, growthData),

  getGrowthRecordsOdata: (query) =>
    api.get(`/GrowthRecord/odata`, {
      params: {
        query,
      },
    }),

  getChildByName: (child, memberId) =>
    api.get(`Children/${child.name}/${child.dateOfBirth}/${memberId}`),

  getGrowthRecords: (childName, parentName) =>
    api.get(`GrowthRecord/odata`, {
      params: {
        $filter: `ChildName eq '${childName}' and ParentName eq '${parentName}'`,
      },
    }),

getGrowthRecordsByDateRange: (childName, parentName, startDate, endDate) =>
  api.get(`GrowthRecord/odata`, {
    params: {
      $filter: `ChildName eq '${childName}' and ParentName eq '${parentName}' and createdAt ge '${startDate}' and createdAt le '${endDate}'`
    }
  }),
};

export default childApi;
