// src/pages/ChatPage.jsx
import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
  Thread,
  useMessageContext,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

import api from "../axios";
import { UserContext } from "../context/UserContext";
import { MentorContext } from "../context/MentorContext";
import { toast } from "react-toastify";

// --- Helpers ---
const getInitials = (name) => name?.substring(0, 2).toUpperCase() || "?";

// --- Incoming Call Modal ---
const IncomingCallModal = ({ callerName, onAccept, onDecline }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 flex flex-col items-center animate-bounce-in">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl animate-pulse">
        📹
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">{callerName}</h2>
      <p className="text-sm text-gray-500 mb-8">Incoming Video Call...</p>

      <div className="flex gap-6 w-full justify-center">
        <button onClick={onDecline} className="flex flex-col items-center gap-1 group">
          <div className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">✕</div>
          <span className="text-xs text-gray-500">Decline</span>
        </button>
        <button onClick={onAccept} className="flex flex-col items-center gap-1 group">
          <div className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition animate-bounce-slow">📞</div>
          <span className="text-xs text-gray-500">Accept</span>
        </button>
      </div>
    </div>
  </div>
);

// --- Attachment Preview Modal ---
const AttachmentModal = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="max-w-[96%] max-h-[92%]">
        <img
          src={src}
          alt="attachment"
          className="max-w-full max-h-[92vh] object-contain rounded-md shadow-2xl"
        />
      </div>
    </div>
  );
};

// --- Custom Message Bubble (with premium attachments & ticks) ---
const CustomMessage = () => {
  const { message, isMyMessage } = useMessageContext();
  const myMsg = isMyMessage();
  const [preview, setPreview] = useState(null);
  const loc = useLocation();
  const navigate = useNavigate();
  const shownVideoEndedRef = useRef(false);

  // Show video-ended toast once, then clear route state to avoid repeats.
  useEffect(() => {
    if (loc.state?.videoEnded && !shownVideoEndedRef.current) {
      shownVideoEndedRef.current = true;
      // show toast (short)
      toast.info("Video call ended", { autoClose: 1100 });
      // clear state so it doesn't show again
      try {
        navigate(location.pathname, { replace: true, state: {} });
      } catch {
        // ignore if navigate/state can't be replaced
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.state]);

  // Determine "seen" status (double tick) - keep your original check but enhance it
  const isSeen = (() => {
    // original simple check: message.status === "read"
    if (message?.status === "read") return true;
    // stream may provide read_by or unread/seen indicators
    if (Array.isArray(message?.read_by) && message.read_by.length > 0) return true;
    // stream provides 'reaction' or other fields; keep the fallback as not-seen
    return false;
  })();

  // Render attachments (premium UI)
  const renderAttachments = () => {
    const atts = Array.isArray(message?.attachments) ? message.attachments : [];
    if (!atts.length) return null;

    return (
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {atts.map((att, i) => {
          // prefer image-url fields
          const imageUrl = att.image_url || att.thumb_url || att.asset_url || att.url;
          const isImage = Boolean(imageUrl && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test((imageUrl || "").split("?")[0]));

          if (isImage && imageUrl) {
            return (
              <div
  key={i}
  className="cursor-pointer rounded-md overflow-hidden"
  onClick={(e) => { e.stopPropagation(); setPreview(imageUrl); }}
  style={{
    maxWidth: "220px",   // prevents giant desktop stretch
  }}
>
  <img
    src={imageUrl}
    alt=""
    className="w-20 h-auto object-cover rounded-md"
    onError={(e) => (e.currentTarget.style.display = "none")}
  />
</div>

            );
          }

          // non-image file link - premium mini card
          const fileUrl = att.asset_url || att.url || imageUrl;
          return (
            <a
              key={i}
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-gray-100 shadow-sm text-sm"
            >
              <div className="w-9 h-9 rounded-md bg-gray-50 flex items-center justify-center text-gray-600 font-bold">📎</div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium truncate">{att.title || att.name || "Download file"}</div>
                <div className="text-xs text-gray-500">{att.type || ""}</div>
              </div>
              <div className="text-xs text-blue-600">Open</div>
            </a>
          );
        })}
      </div>
    );
  };

  // Message bubble
  return (
    <>
      {preview && <AttachmentModal src={preview} onClose={() => setPreview(null)} />}

      {/* treat the special system call message similarly to your previous UI */}
      {message.text === "📞 STARTED_VIDEO_CALL" ? (
        <div className="w-full flex justify-center my-3">
          <span className="text-[11px] bg-gray-100 text-gray-600 px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-sm">
            <span className="text-lg">🎥</span> Call Started
          </span>
        </div>
      ) : (
        <div className={`w-full flex mb-1 px-4 ${myMsg ? "justify-end" : "justify-start"}`}>
          <div
            className={`relative px-4 py-2 rounded-2xl text-sm max-w-[50%] shadow-sm break-words ${
              myMsg
                ? "bg-blue-500 text-white rounded-tr-none"
                : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
            }`}
          >
            <div className="whitespace-pre-wrap">{message.text}</div>

            {/* attachments */}
            {renderAttachments()}

            {/* time + ticks */}
            <div className={`text-[10px] mt-2 flex items-center justify-end gap-2 ${myMsg ? "text-blue-100" : "text-gray-400"}`}>
              <span>{message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>
              {myMsg && (
                <span className="ml-1 text-xs opacity-90" title={isSeen ? "Seen" : "Sent"}>
                  {isSeen ? "✓✓" : "✓"}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- Sidebar Item ---
const ConnectionItem = ({ c, me, isActive, onClick, onlineStatus }) => {
  const senderId = c.sender?._id || c.sender;
  const peer = (String(senderId) === String(me)) ? c.recipient : c.sender;

  if (!peer || !peer._id) return null;
  const isOnline = onlineStatus[peer._id];

  return (
    <div
      onClick={() => onClick(peer._id)}
      className={`group flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 hover:bg-gray-50 border-b border-gray-50 ${
        isActive ? "bg-blue-50 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"
      }`}
    >
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm overflow-hidden shadow-sm border border-gray-100">
          {peer.photo && peer.photo.startsWith("http") ? (
            <img src={peer.photo} alt="" className="w-full h-full object-cover" />
          ) : (
            getInitials(peer.name || "User")
          )}
        </div>
        {isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h4 className={`text-sm font-semibold truncate ${isActive ? "text-blue-900" : "text-gray-900"}`}>
            {peer.name || "Unknown User"}
          </h4>
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {isOnline ? <span className="text-green-600">Online</span> : (peer.specialization || "User")}
        </p>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const statePeerId = location.state?.selectedPeerId;

  const { currentUser, connections: userConnections, loading: userLoading } = useContext(UserContext);
  const { mentorProfile, connections: mentorConnections, loading: mentorLoading } = useContext(MentorContext);

  // --- Identity ---
  const [manualMe, setManualMe] = useState(null);
  const [manualName, setManualName] = useState(null);
  const [manualConnections, setManualConnections] = useState([]);
  const [isVerifying, setIsVerifying] = useState(true);

  let me = null;
  let myName = "User";
  let isMentor = false;
  let connections = [];

  if (mentorProfile?._id) {
    me = String(mentorProfile._id);
    myName = mentorProfile.name;
    isMentor = true; // Only mentors get the button
    connections = mentorConnections;
  } else if (currentUser?._id) {
    me = String(currentUser._id);
    myName = currentUser.name;
    connections = userConnections;
  } else if (manualMe) {
    me = manualMe;
    myName = manualName;
    connections = manualConnections;
    if (!currentUser) isMentor = true;
  }

  if (me) me = String(me);

  // Merge Connections
  const mergedConnections = useMemo(() => {
    return [...connections, ...manualConnections].filter((v, i, a) => a.findIndex(t => (t._id === v._id)) === i);
  }, [connections, manualConnections]);

  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [activePeerId, setActivePeerId] = useState(statePeerId || null);
  const [isMobileListOpen, setIsMobileListOpen] = useState(!statePeerId);
  const [chatLoading, setChatLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [incomingCall, setIncomingCall] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConnections = useMemo(() => {
    return mergedConnections.filter(c => {
      const senderId = c.sender?._id || c.sender;
      const peer = (String(senderId) === String(me)) ? c.recipient : c.sender;
      return peer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [mergedConnections, searchTerm, me]);

  // --- 1. Identity Recovery ---
  useEffect(() => {
    if (me) { setIsVerifying(false); return; }
    if (userLoading || mentorLoading) return;

    const recover = async () => {
      try {
        const mRes = await api.get("/api/mentor/data");
        if (mRes.data?.success) {
          setManualMe(mRes.data.mentorData._id);
          setManualName(mRes.data.mentorData.name);
          const cRes = await api.get("/api/req/mentor/connections");
          setManualConnections(cRes.data?.connections || []);
          setIsVerifying(false);
          return;
        }
      } catch (e) {}

      try {
        const uRes = await api.get("/api/user/data");
        if (uRes.data?.success) {
          const u = uRes.data.userData || uRes.data.user || uRes.data.data;
          setManualMe(u._id || u.id);
          setManualName(u.name);
          const cRes = await api.get("/api/req/connections");
          setManualConnections(cRes.data?.connections || []);
          setIsVerifying(false);
          return;
        }
      } catch (e) {}
      setIsVerifying(false);
    };
    recover();
  }, [me, userLoading, mentorLoading]);

  // --- 2. Stream Init ---
  useEffect(() => {
    if (!me) return;
    const apiKey = import.meta.env.VITE_STREAM_API_KEY;
    const chatClient = StreamChat.getInstance(apiKey);
    let mounted = true;

    const initClient = async () => {
      try {
        const { data } = await api.get(`/api/stream/token/${me}`);
        if (!data.success) throw new Error("Token failed");
        await chatClient.connectUser({ id: me, name: myName }, data.token);

        if (mounted) {
          setClient(chatClient);
          setChatLoading(false);

          // Presence Listener
          chatClient.on('user.presence.changed', (event) => {
            setOnlineUsers(prev => ({ ...prev, [event.user.id]: event.user.online }));
          });

          // Call Listener (Mentee side logic)
          chatClient.on('message.new', (event) => {
            if (event.message.text === "📞 STARTED_VIDEO_CALL" && event.user.id !== me) {
              setIncomingCall(true);
            }
          });
        }
      } catch (err) { console.error(err); setChatLoading(false); }
    };
    initClient();
    return () => { mounted = false; chatClient.disconnectUser().catch(() => { }); setClient(null); };
  }, [me, myName]);

  // --- 3. Channel Watch ---
  useEffect(() => {
    if (!client || !me || !activePeerId) return;
    const loadChannel = async () => {
      setChannel(null);
      const cleanMe = String(me).trim();
      const cleanPeer = String(activePeerId).trim();

      try { await api.post("/api/stream/ensure-user", { userId: cleanPeer }); } catch (e) { }

      const members = [cleanMe, cleanPeer].sort((a, b) => a.localeCompare(b));
      const channelId = members.join("_");

      const newChannel = client.channel("messaging", channelId, { members: [cleanMe, cleanPeer] });
      await newChannel.watch();

      // Check initial peer status
      const peerState = Object.values(newChannel.state.members).find(m => m.user_id === cleanPeer);
      if (peerState?.user) {
        setOnlineUsers(prev => ({ ...prev, [cleanPeer]: peerState.user.online }));
      }

      setChannel(newChannel);
      setIsMobileListOpen(false);
    };
    loadChannel();
  }, [client, me, activePeerId]);

  // --- Start Call Handler (Mentor Only) ---
  const handleStartCall = async () => {
    if (!channel) return;
    // Send signal message
    await channel.sendMessage({ text: "📞 STARTED_VIDEO_CALL" });
    // Redirect self to call page
    navigate(`/videocall/${activePeerId}`);
  };

  // --- Render ---
  if (isVerifying || userLoading || mentorLoading) return <div className="h-screen flex items-center justify-center text-gray-500">Loading Profile...</div>;
  if (!me) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-gray-500">Please Log In.</div>
      <button onClick={() => navigate("/login")} className="text-blue-600 underline">Go to Login</button>
    </div>
  );
  if (chatLoading) return <div className="h-screen flex items-center justify-center text-gray-500">Connecting...</div>;

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-100 flex items-center justify-center md:p-5">

      {/* Incoming Call Overlay */}
      {incomingCall && (
        <IncomingCallModal
          callerName="Mentor"
          onAccept={() => {
            setIncomingCall(false);
            navigate(`/videocall/${activePeerId}`);
          }}
          onDecline={() => setIncomingCall(false)}
        />
      )}

      <div className="w-full h-full max-w-[1400px] bg-white md:rounded-2xl shadow-xl overflow-hidden flex border border-gray-200">

        {/* Sidebar */}
        <div className={`${isMobileListOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 lg:w-96 h-full bg-white border-r border-gray-200 z-20`}>
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Chats</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{mergedConnections.length}</span>
          </div>
          <div className="p-3 border-b border-gray-100 bg-white">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search connections..."
                className="w-full bg-gray-100 border-none rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredConnections.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">No contacts found.</div>
            )}
            {filteredConnections.map((c) => (
              <ConnectionItem
                key={c._id}
                c={c}
                me={me}
                onlineStatus={onlineUsers}
                isActive={String(activePeerId) === String((String(c.sender?._id || c.sender) === me ? (c.recipient?._id || c.recipient) : (c.sender?._id || c.sender)))}
                onClick={setActivePeerId}
              />
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col h-full relative bg-[#f0f2f5] ${isMobileListOpen ? 'hidden md:flex' : 'flex'}`}>
          {!channel ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400 border-l border-gray-200">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-sm text-4xl">💬</div>
              <h3 className="text-xl font-semibold text-gray-700">Welcome to MentorLinq Chat</h3>
              <p className="text-sm mt-2 text-gray-500">Select a conversation to start messaging.</p>
              <button onClick={() => setIsMobileListOpen(true)} className="mt-8 md:hidden px-6 py-2 bg-blue-600 text-white rounded-full shadow-lg">
                View Chats
              </button>
            </div>
          ) : (
            <Chat client={client} theme="str-chat__theme-light">
              <Channel channel={channel} Message={CustomMessage}>
                <Window>
                  {/* Header */}
                  <div className="h-16 bg-white border-b flex items-center px-4 justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsMobileListOpen(true)}>
                      <button className="md:hidden text-gray-600">◀</button>
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-50">
                        {getInitials(Object.values(channel.state.members).find(m => m.user_id !== me)?.user?.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 leading-tight text-base">
                          {Object.values(channel.state.members).find(m => m.user_id !== me)?.user?.name || "User"}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          {Object.values(channel.state.members).find(m => m.user_id !== me)?.user?.online ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              <span className="text-xs text-green-600 font-medium">Online</span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500">Offline</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* VIDEO CALL BUTTON (Only for Mentor) */}
                    {isMentor && (
                      <button
                        onClick={handleStartCall}
                        className="p-2.5 bg-gray-50 text-blue-600 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors border border-gray-200"
                        title="Start Video Call"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                      </button>
                    )}
                  </div>

                  <div className="flex-1 bg-[#efe7dd] overflow-y-auto custom-scrollbar p-2">
                    <MessageList />
                  </div>

                  <div className="p-3 bg-[#f0f2f5] border-t border-gray-200">
                    <div className="bg-white rounded-lg flex items-center overflow-hidden px-2">
                      <MessageInput placeholder="Type a message..." focus />
                    </div>
                  </div>
                </Window>
                <Thread />
              </Channel>
            </Chat>
          )}
        </div>
      </div>
    </div>
  );
}
