import axios from "axios";

// Corrected and Updated Code
const API = axios.create({
  baseURL: "https://focus-tracker-1-trs3.onrender.com", // Your backend URL
});

// Attach JWT to all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
