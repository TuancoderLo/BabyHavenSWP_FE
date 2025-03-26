import api from "../config/axios";

const doctorApi = {
  getAllDoctors: async () => {
    const response = await api.get("/Doctors");
    return response.data;
  },
  //Api doctor
  getDoctorByUserId: async (userId) => {
    const response = await api.get(`/Doctors/doctor/${userId}`);
    return response.data;
  },

  getDoctorById: async (id) => {
    const response = await api.get(`/Doctors/${id}`);
    return response.data;
  },

  getConsultationRequestsById: async (id) => {
    const response = await api.get(`/ConsultationRequests/${id}`);
    return response.data;
  },

  getDoctorSpecializations: async (doctorId) => {
    const response = await api.get(`/Specializations/${doctorId}`);
    return response.data;
  },

  getConsultationRequests: async () => {
    const response = await api.get("/ConsultationRequests");
    return response.data;
  },
  createConsultationResponse: async (data) => {
    const response = await api.post("/ConsultationResponses", data);
    return response.data;
  },
  // Thêm hàm updateConsultationRequestStatus
  updateConsultationRequestStatus: async (requestId, status) => {
    const response = await api.put(`/api/ConsultationRequests/${requestId}`, {
      status,
    });
    return response.data;
  },

  //Api doctorformember
  createConsultationRequest: async (data) => {
    const response = await api.post("/ConsultationRequests", data);
    return response.data;
  },
  getConsultationResponse: async () => {
    const response = await api.get("/ConsultationResponses");
    return response.data;
  },
  getConsultationResponsesByDoctor: async (doctorName) => {
    const response = await api.get(`/ConsultationResponses/odata`, {
      params: { doctorName },
    });
    return response.data;
  },
  // Updated updateConsultationRequestStatus
  updateConsultationRequestStatus: async (requestId, statusString) => {
    // statusString = 'pending' hoặc 'accepted' hoặc 'rejected', ...
    const response = await api.put(
      `/ConsultationRequests/${requestId}/${statusString}`
    );
    return response.data;
  },

  getDoctorsFromEndpoint: async () => {
    const response = await api.get("/Doctors");
    return response.data;
  },

  // Thêm hàm mới để lấy Top N bác sĩ được yêu cầu nhiều nhất
  getTopRequestedDoctors: async (limit = 3) => {
    try {
      // Lấy tất cả các yêu cầu tư vấn
      const requests = await api.get("/ConsultationRequests");
      const allRequests = requests.data;

      // Đếm số lượng yêu cầu cho mỗi bác sĩ
      const doctorCounts = {};
      allRequests.forEach((request) => {
        doctorCounts[request.doctorId] =
          (doctorCounts[request.doctorId] || 0) + 1;
      });

      // Sắp xếp và lấy top N
      const topDoctorIds = Object.entries(doctorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => parseInt(id));

      // Lấy thông tin chi tiết về các bác sĩ
      const doctorDetailsPromises = topDoctorIds.map((id) =>
        api.get(`/Doctors/${id}`).then((response) => ({
          ...response.data,
          requestCount: doctorCounts[id],
        }))
      );

      const topDoctors = await Promise.all(doctorDetailsPromises);
      return topDoctors;
    } catch (error) {
      console.error("Lỗi khi lấy top bác sĩ:", error);
      throw error;
    }
  },
};

export default doctorApi;
