import axios from "axios";

// Original Code
// import axios from "axios";
//
// const API = axios.create({
//   baseURL: "http://localhost:5000/api", // backend URL
// });
//
// // Attach JWT to all requests
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("jwtToken");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
//
// export default API;

// Corrected and Updated Code
const API = axios.create({
  baseURL: "http://localhost:5000/api", // Your backend URL
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
