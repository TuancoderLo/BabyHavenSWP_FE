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
    const response = await api.put(`/api/ConsultationRequests/${requestId}`, { status });
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
    const response = await api.get(`/api/ConsultationResponses/odata`, {
      params: { doctorName },
    });
    return response.data;
  },
  getDoctorsFromEndpoint: async () => {
    const response = await api.get("/Doctors");
    return response.data;
  },

};

export default doctorApi;
