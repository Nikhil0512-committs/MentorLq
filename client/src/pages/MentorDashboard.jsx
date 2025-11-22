import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import api from "../axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MentorContext } from "../context/MentorContext";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=random";

function SkeletonCard() {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow p-4 animate-pulse">
      <div className="flex gap-4 items-start">
        <div className="w-20 h-20 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/5" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function MentorDashboard() {
  const { mentorProfile, loading: profileLoading } = useContext(MentorContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 640 : true);
  const [incoming, setIncoming] = useState([]); 
  const [connections, setConnections] = useState([]); 
  const [query, setQuery] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const containerRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", onResize);
    loadAll();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const getMentorName = () => {
    if (profileLoading) return "...";
    if (!mentorProfile) return "Mentor";
    return mentorProfile.name || "Mentor";
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [incRes, connRes] = await Promise.allSettled([
        api.get("/api/req/incoming"),
        api.get("/api/req/mentor/connections"),
      ]);

      if (incRes.status === "fulfilled" && incRes.value?.data?.success) {
        setIncoming(incRes.value.data.incoming || []);
      } else {
        setIncoming([]);
      }

      if (connRes.status === "fulfilled" && connRes.value?.data?.success) {
        setConnections(connRes.value.data.connections || []);
      } else {
        setConnections([]);
      }
    } catch (err) {
      console.error("loadAll error", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId) => {
    setProcessingId(requestId);
    try {
      const res = await api.put(`/api/req/${requestId}/accept`);
      if (res?.data?.success) {
        setIncoming((prev) => prev.filter((r) => r._id !== requestId));
        if (res.data.connection) {
          setConnections((prev) => [res.data.connection, ...prev]);
        } else {
          loadAll(); 
        }
        toast.success("Request accepted");
      } else {
        toast.error(res?.data?.message || "Failed to accept request");
      }
    } catch (err) {
      console.error("acceptRequest error:", err);
      toast.error(err?.response?.data?.message || "Network error");
    } finally {
      setProcessingId(null);
    }
  };

  const rejectRequest = async (requestId) => {
    setProcessingId(requestId);
    try {
      const res = await api.put(`/api/req/${requestId}/reject`);
      if (res?.data?.success) {
        setIncoming((prev) => prev.filter((r) => r._id !== requestId));
        toast.success("Request rejected");
      } else {
        toast.error(res?.data?.message || "Failed to reject request");
      }
    } catch (err) {
      console.error("rejectRequest error:", err);
      toast.error(err?.response?.data?.message || "Network error");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredIncoming = useMemo(() => {
    if (!query.trim()) return incoming;
    const q = query.toLowerCase();
    return incoming.filter((r) => {
      const s = r.sender || {};
      return ((s.name || "").toLowerCase().includes(q) || (s.bio || "").toLowerCase().includes(q));
    });
  }, [incoming, query]);

  const filteredConnections = useMemo(() => {
    if (!query.trim()) return connections;
    const q = query.toLowerCase();
    return connections.filter((c) => {
      const mentee = c.sender || {}; // For mentor, connections usually have Sender as Mentee
      // NOTE: Adjust this if your connections logic places Mentees as Recipient occasionally
      // A robust check similar to MenteeDashboard can be added here if needed.
      return ((mentee.name || "").toLowerCase().includes(q) || (mentee.bio || "").toLowerCase().includes(q));
    });
  }, [connections, query]);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll(".card-anim");
    cards.forEach((c, i) => {
      c.style.opacity = 0;
      c.style.transform = "translateY(8px)";
      setTimeout(() => {
        c.style.transition = "opacity 320ms ease, transform 320ms cubic-bezier(.2,.9,.3,1)";
        c.style.opacity = 1;
        c.style.transform = "translateY(0)";
      }, 50 * i);
    });
  }, [filteredIncoming, filteredConnections, activeTab]);

  const renderList = (items) => {
    if (!items) return "—";
    if (Array.isArray(items)) { return items.length > 0 ? items.join(", ") : "—"; }
    return items; 
  };

  const TopRightMenu = () => (
    <div className="relative">
      <button onClick={() => setMenuOpen((s) => !s)} className="p-2 rounded-md bg-white/90 shadow hover:bg-gray-50">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border z-30">
          <button className={`w-full px-4 py-3 text-left ${activeTab === "dashboard" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`} onClick={() => { setActiveTab("dashboard"); setMenuOpen(false); }}>Dashboard</button>
          <button className={`w-full px-4 py-3 text-left ${activeTab === "requests" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`} onClick={() => { setActiveTab("requests"); setMenuOpen(false); }}>Requests</button>
          <button className={`w-full px-4 py-3 text-left ${activeTab === "my-mentees" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`} onClick={() => { setActiveTab("my-mentees"); setMenuOpen(false); }}>My Mentees</button>
        </div>
      )}
    </div>
  );

  const RequestCard = ({ r }) => {
    const s = r.sender || {}; 
    const img = s.photo ? (s.photo.startsWith("data:") ? s.photo : `data:image/jpeg;base64,${s.photo}`) : DEFAULT_AVATAR;
    return (
      <article className="card-anim bg-white rounded-2xl shadow p-4 border">
        <div className="flex gap-4">
          <img src={img} alt={s.name} className="w-16 h-16 rounded-full object-cover border bg-gray-100" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{s.name || "Unnamed"}</h3>
                <div className="text-sm text-gray-600">{s.specialization || s.college || "Mentee"}</div>
              </div>
              <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
            <p className="mt-2 text-sm text-gray-700"><span className="font-semibold text-gray-900">Bio: </span>{s.bio || "No bio provided."}</p>
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <div><span className="font-semibold">Mentorship Areas: </span>{renderList(s.mentorshipAreas)}</div>
              <div><span className="font-semibold">Career Interests: </span>{renderList(s.careerInterest)}</div>
              <div><span className="font-semibold">LinkedIn: </span>{s.linkedIn ? <a href={s.linkedIn} target="_blank" rel="noreferrer" className="text-blue-600 underline hover:text-blue-800">View Profile</a> : "—"}</div>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => acceptRequest(r._id)} disabled={processingId === r._id} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">{processingId === r._id ? "Processing..." : "Accept"}</button>
              <button onClick={() => rejectRequest(r._id)} disabled={processingId === r._id} className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">Reject</button>
            </div>
          </div>
        </div>
      </article>
    );
  };

  const MenteeCard = ({ c }) => {
    // Robust Mentee Finder for Mentor
    const getConnectedMentee = (c) => {
      const mentorId = mentorProfile?._id?.toString();
      const senderId = c.sender?._id?.toString();
      const recipientId = c.recipient?._id?.toString();

      // If I am sender, recipient is mentee. If I am recipient, sender is mentee.
      if (senderId === mentorId) return c.recipient;
      if (recipientId === mentorId) return c.sender;
      
      // Fallback default behavior (usually sender is mentee)
      return c.sender;
    };

    const m = getConnectedMentee(c) || {};
    const img = m.photo ? (m.photo.startsWith("data:") ? m.photo : `data:image/jpeg;base64,${m.photo}`) : DEFAULT_AVATAR;

    return (
      <article className="card-anim bg-white rounded-2xl shadow p-4 border">
        <div className="flex gap-4">
          <img src={img} alt={m.name} className="w-16 h-16 rounded-full object-cover border bg-gray-100" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{m.name || "Unnamed"}</h3>
                <div className="text-sm text-gray-600">{m.specialization || m.college || "Mentee"}</div>
              </div>
              <div className="text-xs text-gray-500">Connected: {new Date(c.updatedAt || c.createdAt).toLocaleDateString()}</div>
            </div>
            <p className="mt-2 text-sm text-gray-700"><span className="font-semibold text-gray-900">Bio: </span>{m.bio || "No bio provided."}</p>
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <div><span className="font-semibold">Mentorship Areas: </span>{renderList(m.mentorshipAreas)}</div>
              <div><span className="font-semibold">Career Interests: </span>{renderList(m.careerInterest)}</div>
              <div><span className="font-semibold">LinkedIn: </span>{m.linkedIn ? <a href={m.linkedIn} target="_blank" rel="noreferrer" className="text-blue-600 underline hover:text-blue-800">View Profile</a> : "—"}</div>
            </div>
            <div className="mt-4 flex gap-3">
              {/* ⭐ FIXED NAVIGATION: Use /chat/page with state */}
              <button
                onClick={() => {
                  if (!m?._id) {
                    toast.error("Unable to open chat. Invalid mentee ID.");
                    return;
                  }
                  // Pass ID in state
                  navigate('/chat/page', { state: { selectedPeerId: m._id } });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm flex items-center gap-2"
              >
                <span>Message 💬</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome, <span className="text-blue-600">{getMentorName()}</span></h1>
            <p className="text-sm text-gray-600 mt-1">Manage incoming requests and mentees.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block bg-white rounded-lg px-4 py-2 border text-sm"><div className="text-xs text-gray-500">Incoming</div><div className="text-lg font-semibold text-gray-900">{incoming.length}</div></div>
            <div className="hidden md:block bg-white rounded-lg px-4 py-2 border text-sm"><div className="text-xs text-gray-500">Mentees</div><div className="text-lg font-semibold text-gray-900">{connections.length}</div></div>
            <TopRightMenu />
          </div>
        </div>
        
        {/* Search & mobile tabs */}
        <div className="mb-5">
          <div className={`flex ${isMobile ? "flex-col gap-3" : "items-center gap-3"}`}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search requests or mentees..." className="w-full md:w-72 px-3 py-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            <div className="ml-auto flex items-center gap-2">
              {isMobile ? (
                <div className="flex gap-2 bg-white p-1 rounded-lg border w-full justify-center">
                  <button className={`flex-1 px-3 py-1.5 text-sm rounded ${activeTab === "dashboard" ? "bg-blue-600 text-white shadow" : "text-gray-700"}`} onClick={() => setActiveTab("dashboard")}>Dashboard</button>
                  <button className={`flex-1 px-3 py-1.5 text-sm rounded ${activeTab === "requests" ? "bg-blue-600 text-white shadow" : "text-gray-700"}`} onClick={() => setActiveTab("requests")}>Requests</button>
                  <button className={`flex-1 px-3 py-1.5 text-sm rounded ${activeTab === "my-mentees" ? "bg-blue-600 text-white shadow" : "text-gray-700"}`} onClick={() => setActiveTab("my-mentees")}>Mentees</button>
                </div>
              ) : (
                <button onClick={loadAll} className="px-3 py-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors">⟳ Refresh</button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <div className="mb-6 animate-fade-in">
                <div className="bg-white rounded-xl p-6 border shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
                  <p className="text-gray-600 mt-1">You are all caught up.</p>
                  <div className="mt-4 grid grid-cols-2 gap-4 md:hidden">
                    <div className="bg-gray-50 p-4 rounded-lg border"><div className="text-xs text-gray-500 uppercase font-bold">Incoming</div><div className="text-2xl font-bold text-blue-600">{incoming.length}</div></div>
                    <div className="bg-gray-50 p-4 rounded-lg border"><div className="text-xs text-gray-500 uppercase font-bold">Mentees</div><div className="text-2xl font-bold text-green-600">{connections.length}</div></div>
                  </div>
                  <div className="hidden md:flex mt-4 gap-4"><button onClick={() => setActiveTab("requests")} className="text-blue-600 hover:underline text-sm">View Pending Requests &rarr;</button></div>
                </div>
              </div>
            )}
            {activeTab === "requests" && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">Incoming Requests <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{incoming.length}</span></h2>
                {filteredIncoming.length ? <div className="flex flex-col gap-4" ref={containerRef}>{filteredIncoming.map((r) => <RequestCard key={r._id} r={r} />)}</div> : <div className="bg-white rounded-xl text-center border border-dashed p-8 text-gray-500">No pending requests at the moment.</div>}
              </div>
            )}
            {activeTab === "my-mentees" && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">My Mentees</h2>
                {filteredConnections.length ? <div className="flex flex-col gap-4" ref={containerRef}>{filteredConnections.map((c) => <MenteeCard key={c._id} c={c} />)}</div> : <div className="bg-white rounded-xl text-center border border-dashed p-8 text-gray-500">You haven't connected with any mentees yet.</div>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}