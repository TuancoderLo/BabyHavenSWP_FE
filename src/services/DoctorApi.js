import axios from "axios";

const BASE_URL = "https://localhost:7279/api";

const doctorApi = {
  getAllDoctors: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Doctors`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDoctorSpecializations: async (doctorId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/Specializations/${doctorId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getConsultationRequests: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/ConsultationRequests`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default doctorApi;
