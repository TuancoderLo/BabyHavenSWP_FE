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
  
  updateConsultationRequestStatus: async (requestId, statusString) => {
    const response = await api.put(`/ConsultationRequests/${requestId}/${statusString}`);
    return response.data;
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
      console.error("Error fetching OData responses:", error.response || error.message);
      throw error; // Ném lỗi để xử lý ở nơi gọi
    }
  },

  createRatingFeedback: async (data) => {
    const response = await api.post("/RatingFeedback", data);
    return response.data;
  },
  
  updateConsultationResponseStatus: async (responseId, statusString) => {
  try {
    const response = await api.put(`/ConsultationResponses/${responseId}/status`, { status: statusString });
    return response.data;
  } catch (error) {
    console.error("Error updating ConsultationResponse status:", error);
    throw error;
  }
},
getUserFeedbackOData: async (userId) => {
  try {
    const query = `?$filter=userId eq '${userId}'`; // Lọc theo userId
    const response = await api.get(`/RatingFeedback/odata${query}`);
    console.log("Raw OData Feedback Response:", response); // Log để kiểm tra
    return response;
  } catch (error) {
    console.error("Error fetching OData feedback:", error.response || error.message);
    throw error;
  }
},
  getDoctorsFromEndpoint: async () => {
    const response = await api.get("/Doctors");
    return response.data;
  },

};

export default doctorApi;
