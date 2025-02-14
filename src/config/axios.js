// Set config defaults when creating the instance
import axios from "axios";
const api = axios.create({
  baseURL: "http://14.225.207.163:8080/api/",
});

export default api;
