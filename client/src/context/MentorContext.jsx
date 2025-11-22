import { createContext, useState, useEffect } from 'react'
import api from '../axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

export const MentorContext = createContext()

export const MentorProvider = ({ children }) => {
  const [mentorProfile, setMentorProfile] = useState(null)
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchConnections = async () => {
    try {
      // Ensure your connection routes also handle missing auth gracefully if needed,
      // or wrap this in a try/catch as usual.
      const { data } = await api.get("/api/req/mentor/connections");
      if (data.success) setConnections(data.connections || []);
    } catch (error) { console.log("Conn fetch error", error); }
  };

  const fetchMentorProfile = async () => {
    try {
      const { data } = await api.get("/api/mentor/data");

      // ✅ Backend now returns success: false if not logged in (instead of 401)
      if (data.success) {
        setMentorProfile(data.mentorData);
        fetchConnections();
      } else {
        setMentorProfile(null);
        setConnections([]);
      }
    } catch (error) {
      // This catch block handles actual network failures (e.g. server down)
      console.error("Mentor fetch error:", error);
      setMentorProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorProfile();
  }, []);

  const mentorLogin = async (email, password) => {
    try {
      const { data } = await api.post('/api/auth/mentor/login', { email, password });
      if (data.success) {
        await fetchMentorProfile();
        return true; 
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  }

  const mentorLogout = async () => {
    try {
      const { data } = await api.post('/api/auth/mentor/logout');
      if (data.success) {
        setMentorProfile(null);
        setConnections([]);
        navigate('/'); 
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  return (
    <MentorContext.Provider value={{ mentorProfile, connections, fetchConnections, mentorLogin, mentorLogout, loading }}>
      {children}
    </MentorContext.Provider>
  )
}