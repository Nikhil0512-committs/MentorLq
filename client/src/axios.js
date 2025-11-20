// src/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "", // set VITE_API_BASE in .env if needed
  withCredentials: true, // IMPORTANT: send cookies for auth (register sets cookie)
  headers: {
    "Accept": "application/json",
  },
});

export default api;
