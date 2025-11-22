import { createContext, useState, useEffect } from "react";
import api from "../axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      const { data } = await api.get("/api/req/connections");
      if (data.success) setConnections(data.connections || []);
    } catch (err) { /* ignore */ }
  };

  const checkAuth = async () => {
    try {
      const { data } = await api.get("/api/user/data");
      if (data && data.success) {
        setCurrentUser(data.userData || data.user || data.data);
        fetchConnections();
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      // ⭐ Silent 401: If not a user, just set null and stop.
      if (err.response && err.response.status === 401) {
        setCurrentUser(null);
      } else {
        console.error("User check failed", err);
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      if (res?.data?.success) {
        await checkAuth(); // Force refresh
        return { success: true };
      }
      return { success: false, message: res?.data?.message || "Login failed" };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login error" };
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      setCurrentUser(null);
      setConnections([]);
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, connections, fetchConnections, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};