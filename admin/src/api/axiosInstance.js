// src/api/axiosInstance.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:8800/api/", 
  withCredentials: true, 
});

API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      localStorage.removeItem("user");
      
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
export default API;