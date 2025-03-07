import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_APIS_URL_REMOTE;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Envia sempre cookies na comunicação
});

// Add a request interceptor to include the auth token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get the token from localStorage
    const token = localStorage.getItem('auth_token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added token from localStorage to request headers');
    } else {
      // Fallback to cookies if localStorage token is not available
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      const cookieToken = tokenCookie ? tokenCookie.split('=')[1] : null;
      
      if (cookieToken) {
        config.headers.Authorization = `Bearer ${cookieToken}`;
        console.log('Added token from cookies to request headers');
      } else {
        console.log('No token found in localStorage or cookies');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
