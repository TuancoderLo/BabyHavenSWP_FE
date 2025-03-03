import api from "../config/axios";

const childApi = {
    //lấy danh sách trẻ theo Id
    getByMember: (memberId) => api.get(`Children/member/${memberId}`),
    creat: (data) => api.post("Children", data),
};
export default childApi;