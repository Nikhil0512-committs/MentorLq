// src/axios.js
import axios from "axios";

const api = axios.create({
  // ❌ DELETE THIS: baseURL: import.meta.env.VITE_API_BASE || "", 
  
  // ✅ ADD THIS: Force requests to go through Vercel (HTTPS)
  baseURL: "/", 
  
  withCredentials: true, 
  headers: {
    "Accept": "application/json",
    // ⚠️ DO NOT add 'Content-Type': 'application/json' here.
    // It will break your Image Upload (FormData) which needs to set its own boundaries.
  },
});

export default api;
