import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
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

export default api;