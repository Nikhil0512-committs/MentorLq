// src/pages/MenteeDashboard.jsx
import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import api from "../axios";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=random";

function SkeletonCard() {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow p-4 animate-pulse">
      <div className="flex gap-4 items-start">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/5" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function MenteeDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);

  const [user, setUser] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sendingId, setSendingId] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 640 : true
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [query, setQuery] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState("All");

  const containerRef = useRef(null);

  // Priority: User State > Context
  const menteeId = user?._id || currentUser?._id;

  // 🔥 ROBUST MENTOR FINDER (adjusted for backend)
  // Backend stores: sender => User (mentee), recipient => Mentor
  const getConnectedMentor = (c) => {
    if (!c) return null;

    // Prefer recipient (mentor). This matches your backend model.
    if (c.recipient) return c.recipient;

    // Fallback: if recipient missing (ghost/incomplete), return sender
    return c.sender || null;
  };

  const specializations = useMemo(() => {
    const set = new Set();
    mentors.forEach((m) => {
      if (m.specialization) set.add(m.specialization);
      if (Array.isArray(m.career)) m.career.forEach((c) => set.add(c));
    });
    return ["All", ...Array.from(set)];
  }, [mentors]);

  const skills = useMemo(() => {
    const set = new Set();
    mentors.forEach((m) => {
      if (Array.isArray(m.skills)) m.skills.forEach((s) => set.add(s));
    });
    return ["All", ...Array.from(set)];
  }, [mentors]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", onResize);
    loadAllData();
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch User
      try {
        const uRes = await api.get("/api/user/data");
        if (uRes?.data?.success) {
          setUser(uRes.data.userData || uRes.data.user || uRes.data.data);
        } else if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        if (currentUser) setUser(currentUser);
      }

      // 2. Fetch Mentors
      const mRes = await api.get("/api/mentor/all");
      if (mRes?.data?.success) setMentors(mRes.data.mentors || []);

      // 3. Fetch Outgoing
      const outRes = await api.get("/api/req/outgoing");
      if (outRes?.data?.success) setOutgoing(outRes.data.outgoing || []);

      // 4. Fetch Connections (accepted)
      // This route returns connection documents where sender=user and recipient=mentor (accepted)
      const cRes = await api.get("/api/req/connections");
      if (cRes?.data?.success) {
        // Keep the raw connection objects (the UI expects these)
        setConnections(cRes.data.connections || []);
      }
    } catch (err) {
      console.error("Load Error:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatus = (mentorId) => {
    if (!mentorId) return "none";
    const mIdStr = mentorId.toString();

    if (Array.isArray(outgoing)) {
      const p = outgoing.find(r => {
        const rId = r.recipient?._id ? r.recipient._id.toString() : r.recipient?.toString();
        return rId === mIdStr;
      });
      if (p) return "pending";
    }
    if (Array.isArray(connections)) {
      const found = connections.find(c => {
        // Since backend uses recipient as mentor, check recipient._id
        const recipientId = c.recipient?._id ? c.recipient._id.toString() : c.recipient?.toString();
        const senderId = c.sender?._id ? c.sender._id.toString() : c.sender?.toString();
        return recipientId === mIdStr || senderId === mIdStr;
      });
      if (found) return "connected";
    }
    return "none";
  };

  const sendRequest = async (mentorId) => {
    setSendingId(mentorId);
    try {
      const res = await api.post(`/api/req/send/${mentorId}`);
      if (res?.data?.success) {
        const newReq = res.data.request || {
          recipient: mentorId,
          sender: menteeId,
          status: "pending",
          _id: `tmp-${Date.now()}`,
        };
        setOutgoing((prev) => [newReq, ...prev]);
        toast.success("Connection request sent");
      } else {
        toast.error(res?.data?.message || "Failed to send request");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Network error");
    } finally {
      setSendingId(null);
    }
  };

  const filtered = useMemo(() => {
    let arr = mentors || [];
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (m) =>
          (m.name || "").toLowerCase().includes(q) ||
          (m.bio || "").toLowerCase().includes(q)
      );
    }
    if (selectedSpec !== "All") {
      arr = arr.filter(
        (m) =>
          m.specialization === selectedSpec ||
          (Array.isArray(m.career) && m.career.includes(selectedSpec))
      );
    }
    if (selectedSkill !== "All") {
      arr = arr.filter(
        (m) => Array.isArray(m.skills) && m.skills.includes(selectedSkill)
      );
    }
    return arr;
  }, [mentors, query, selectedSpec, selectedSkill]);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll(".mentor-card");
    cards.forEach((c, i) => {
      c.style.opacity = 0;
      c.style.transform = "translateY(8px)";
      setTimeout(() => {
        c.style.transition = "opacity 360ms ease, transform 360ms cubic-bezier(.2,.9,.3,1)";
        c.style.opacity = 1;
        c.style.transform = "translateY(0)";
      }, 60 * i);
    });
  }, [filtered, activeTab, isMobile]);

  const TopRightMenu = () => (
    <div className="relative">
      <button
        aria-label="menu"
        onClick={() => setMenuOpen((s) => !s)}
        className="p-2 rounded-md bg-white/90 backdrop-blur shadow inline-flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg z-30 border border-gray-100">
          <button className={`w-full text-left px-4 py-3 border-b ${activeTab === "dashboard" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`} onClick={() => { setActiveTab("dashboard"); setMenuOpen(false); }}>Dashboard</button>
          <button className={`w-full text-left px-4 py-3 border-b ${activeTab === "my-mentors" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`} onClick={() => { setActiveTab("my-mentors"); setMenuOpen(false); }}>My Mentors</button>
          <button className={`w-full text-left px-4 py-3 ${activeTab === "messages" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`} onClick={() => { setActiveTab("messages"); setMenuOpen(false); }}>Messages</button>
        </div>
      )}
    </div>
  );

  function MentorCard({ m }) {
    if (!m) return null;
    const status = getConnectionStatus(m._id);
    const imgSrc = m.photo
      ? m.photo.startsWith("data:") ? m.photo : `data:image/jpeg;base64,${m.photo}`
      : DEFAULT_AVATAR;

    const careerDisplay = Array.isArray(m.career) && m.career.length > 0 ? m.career.join(", ") : m.specialization;

    return (
      <article
        className="mentor-card bg-white rounded-2xl shadow p-4 md:p-6 w-full border border-gray-100 cursor-pointer transition-shadow hover:shadow-md"
        onClick={() => {
          // ⭐ If connected, clicking the card opens chat
          if (status === "connected") {
             navigate('/chat/page', { state: { selectedPeerId: m._id } });
          }
        }}
      >
        <div className="flex gap-4 items-start">
          <img src={imgSrc} alt={m.name} className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover border bg-gray-50" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{m.name}</h3>
                <div className="text-sm text-blue-600 font-medium">{m.specialization || "General Mentor"}</div>
              </div>
              <div className="flex items-center gap-2 mt-1 md:mt-0">
                {m.isAccountVerified && <span className="text-[10px] uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Verified</span>}
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600 line-clamp-3"><span className="font-bold text-gray-900">Bio: </span>{m.bio || "No bio provided."}</div>
            {m.linkedIn && (
  <div className="mt-2 text-sm text-blue-600 font-medium">
    <span className="font-bold text-gray-900">LinkedIn: </span>
    <a
      href={m.linkedIn}
      onClick={(e) => e.stopPropagation()}
      target="_blank"
      rel="noopener noreferrer"
      className="underline text-blue-600 hover:text-blue-700"
    >
      View Profile
    </a>
  </div>
)}

            {careerDisplay && <div className="mt-2 text-sm text-gray-600"><span className="font-bold text-gray-900">Mentorship Areas: </span>{careerDisplay}</div>}
            <div className="mt-2">
              <span className="text-sm font-bold text-gray-900 block mb-1.5">Skills:</span>
              <div className="flex flex-wrap gap-2">
                {(m.skills || []).slice(0, 5).map((s, i) => <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md border border-gray-200">{s}</span>)}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              {status === "none" && <button onClick={(e) => { e.stopPropagation(); sendRequest(m._id); }} disabled={sendingId === m._id} className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-blue-200">{sendingId === m._id ? "Sending..." : "Connect"}</button>}
              {status === "pending" && <button className="flex-1 md:flex-none px-4 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg cursor-default border border-amber-200">Request Pending</button>}
              {status === "connected" && (
                // ⭐ FIXED NAVIGATION: Use /chat/page with state
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    navigate('/chat/page', { state: { selectedPeerId: m._id } });
                  }}
                  className="flex-1 md:flex-none px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center gap-2"
                >
                  <span>Message 💬</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome, <span className="text-blue-600">{user?.name || currentUser?.name || "Friend"}</span></h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Find mentors and grow your career.</p>
          </div>
          <TopRightMenu />
        </div>

        <div className="mb-6 bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or bio..." className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all" /></div>
            <div className="md:col-span-3"><select value={selectedSpec} onChange={(e) => setSelectedSpec(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-blue-500"><option disabled value="">Specialization</option>{specializations.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            <div className="md:col-span-3"><select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-blue-500"><option disabled value="">Skills</option>{skills.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            <div className="md:col-span-1"><button onClick={() => loadAllData()} className="w-full h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors py-2.5">⟳</button></div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
        ) : (
          <>
            {(activeTab === "my-mentors" || activeTab === "messages") && (
              <div className="animate-fade-in">
                <h2 className="text-lg font-bold mb-4 text-gray-800">{activeTab === "messages" ? "Messages" : "My Mentors"}</h2>
                {connections.length ? (
                  <div className="flex flex-col gap-4" ref={containerRef}>
                    {connections
                      .map((c) => getConnectedMentor(c))
                      .filter((m) => m && m._id)
                      .map((m) => <MentorCard key={m._id} m={m} />)}
                  </div>
                ) : (
                  <div className="text-gray-500 bg-white p-6 rounded-xl text-center border border-dashed">No connected mentors yet.</div>
                )}
              </div>
            )}

            {activeTab === "dashboard" && (
              <div className="animate-fade-in">
                <h2 className="text-lg font-bold mb-4 text-gray-800">Recommended Mentors</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" ref={containerRef}>
                  {filtered.length ? filtered.map((m) => <MentorCard key={m._id} m={m} />) : <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed">No mentors match your current filters.</div>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
