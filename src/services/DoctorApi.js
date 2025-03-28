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
  updateConsultationRequestsStatus: async (requestId, statusString) => {
    const response = await api.put(
      `/ConsultationRequests/${requestId}/${statusString}`
    );
    return response.data;
  },

  getConsultationRequestsByDoctorOData: async (doctorId) => {
    const query = `?$filter=doctorId eq ${doctorId}`;
    const response = await api.get(`/ConsultationRequests/odata${query}`);
    return response.data;
  },

  getConsultationRequestsByDoctorAndStatus: async (doctorId, status) => {
    let filter = `?$filter=doctorId eq ${doctorId}`;
    if (status) {
      filter += ` and status eq '${status}'`;
    }
    const response = await api.get(`/ConsultationRequests/odata${filter}`);
    return response.data;
  },
  
  getRatingFeedbackByResponseId: async (responseId) => {
    try {
      const query = `?$filter=responseId eq ${responseId}`;
      const response = await api.get(`/RatingFeedback/odata${query}`);
      console.log("Raw OData Feedback Response for responseId:", response); // Log để kiểm tra
      return response;
    } catch (error) {
      console.error(
        "Error fetching OData feedback by responseId:",
        error.response || error.message
      );
      throw error;
    }
  },


  //Api doctorformember
  createConsultationRequest: async (data) => {
    const response = await api.post("/ConsultationRequests", data);
    return response.data;
  },
  getConsultationResponses: async (id) => {
    const response = await api.get(`/ConsultationResponses/member/${id}`);
    return response.data;
  },

  getConsultationResponsesOData: async (query = "") => {
    try {
      const response = await api.get(`/ConsultationResponses/odata${query}`);
      console.log("Raw OData Response from API:", response); // Log response từ axios
      return response;
    } catch (error) {
      console.error(
        "Error fetching OData responses:",
        error.response || error.message
      );
      throw error; // Ném lỗi để xử lý ở nơi gọi
    }
  },

  createRatingFeedback: async (data) => {
    const response = await api.post("/RatingFeedback", data);
    return response.data;
  },

  updateConsultationResponseStatus: async (responseId, statusString) => {
    const response = await api.put(
      `/ConsultationResponses/${responseId}/${statusString}`
    );
    return response.data;
  },

  getUserFeedbackOData: async (userId) => {
    try {
      const query = `?$filter=userId eq ${userId}`; // Lọc theo userId
      const response = await api.get(`/RatingFeedback/odata${query}`);
      console.log("Raw OData Feedback Response:", response); // Log để kiểm tra
      return response;
    } catch (error) {
      console.error(
        "Error fetching OData feedback:",
        error.response || error.message
      );
      throw error;
    }
  },

  getConsultationRequestsByMemberId: async (memberId) => {
    try {
      const query = `?$filter=memberId eq ${memberId}`;
      const response = await api.get(`/ConsultationRequests/odata${query}`);
      console.log("Raw OData Response from API:", response);
      return response;
    } catch (error) {
      console.error(
        "Error fetching OData requests:",
        error.response || error.message
      );
      throw error;
    }
  },


  getDoctorsFromEndpoint: async () => {
    const response = await api.get("/Doctors");
    return response.data;
  },

  //admin api
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

  updateDoctor: async (doctorId, data) => {
    const response = await api.put(`/Doctors/${doctorId}`, data);
    return response.data;
  },

  updateDoctorSpecialization: async (doctorId, data) => {
    const response = await api.put(`/Specializations/${doctorId}`, data);
    return response.data;
  },
};

export default doctorApi;
