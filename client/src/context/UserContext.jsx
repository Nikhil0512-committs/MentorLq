// src/context/UserContext.jsx
import { createContext, useState, useEffect } from "react";
import api from "../axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try to restore session from cookie
  const checkAuth = async () => {
    try {
      // This endpoint should use auth middleware to read token cookie and return user
      const res = await api.get("/api/user/me",{
        headers: { Authorization: `Bearer ${token}` }
      }); // backend: isAuthenticated or me
      if (res?.data?.success) {
        // If backend returns user object: res.data.user
        setCurrentUser(res.data.user || null);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/api/user/login", { email, password });
    if (res?.data?.success) {
      // after login backend sets cookie; re-check user
      await checkAuth();
      return { success: true };
    }
    return { success: false, message: res?.data?.message || "Login failed" };
  };

  const logout = async () => {
    await api.post("/api/user/logout");
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};
