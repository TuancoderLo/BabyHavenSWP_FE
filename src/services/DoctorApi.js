import api from "../config/axios";

const doctorApi = {
  getAllDoctors: async () => {
    try {
      const response = await api.get("/Doctors");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDoctorSpecializations: async (doctorId) => {
    try {
      const response = await api.get(`/Specializations/${doctorId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getConsultationRequests: async () => {
    try {
      const response = await api.get("/ConsultationRequests");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createConsultationRequest: async (data) => {
    try {
      const response = await api.post("/ConsultationRequests", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default doctorApi;
