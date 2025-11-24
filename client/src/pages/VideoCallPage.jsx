import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  PaginatedGridLayout, // <--- CHANGED: Used for equal sizing
  CallControls,
  // CallParticipantsList, <--- REMOVED
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
// Optional: Overwrite Stream's default grid css to ensure full coverage if needed
import "./stream-overrides.css"; 

import api from "../axios";
import { UserContext } from "../context/UserContext";
import { MentorContext } from "../context/MentorContext";
import { toast } from "react-toastify";

// You might not need this file if standard CSS works, but adding inline styles below just in case.

export default function VideoCallPage() {
  const { peerId: rawPeerId } = useParams();
  const navigate = useNavigate();

  // Clean peer ID
  const peerId = rawPeerId ? String(rawPeerId).trim() : "";

  const { currentUser } = useContext(UserContext);
  const { mentorProfile } = useContext(MentorContext);

  // Manual fallback identity
  const [manualMe, setManualMe] = useState(null);
  const [manualName, setManualName] = useState(null);

  let me = mentorProfile?._id
    ? String(mentorProfile._id).trim()
    : currentUser?._id
    ? String(currentUser._id).trim()
    : manualMe;

  const myName =
    mentorProfile?.name || currentUser?.name || manualName || "User";

  const [videoClient, setVideoClient] = useState(null);
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prevent double-running in StrictMode
  const initRan = useRef(false);

  // ---------------------------
  // Effect 1: Recover Identity
  // ---------------------------
  useEffect(() => {
    if (me) return;

    const recover = async () => {
      try {
        const m = await api.get("/api/mentor/data");
        if (m.data?.success) {
          setManualMe(m.data.mentorData._id);
          setManualName(m.data.mentorData.name);
          return;
        }
      } catch {}

      try {
        const u = await api.get("/api/user/data");
        if (u.data?.success) {
          const user = u.data.userData || u.data.user || u.data.data;
          setManualMe(user._id || user.id);
          setManualName(user.name);
          return;
        }
      } catch {}

      toast.error("Authentication failed");
      navigate("/login");
    };

    recover();
  }, [me, navigate]);

  // ---------------------------
  // Effect 2: Init Video Client
  // ---------------------------
  useEffect(() => {
    if (!me || !peerId) return;

    if (initRan.current) return;
    initRan.current = true;

    let myClient = null;
    let myCall = null;
    let cancelled = false;

    const apiKey = import.meta.env.VITE_STREAM_API_KEY;

    const init = async () => {
      try {
        setLoading(true);

        // Get token
        const { data } = await api.get(`/api/stream/token/${me}`);
        if (!data.success) throw new Error("Token failed");

        if (cancelled) return;

        // Create client
        myClient = new StreamVideoClient({
          apiKey,
          user: { id: me, name: myName },
          token: data.token,
        });

        // Deterministic call ID
        const members = [me, peerId].sort((a, b) => a.localeCompare(b));
        const callId = members.join("_");

        // Create call
        myCall = myClient.call("default", callId);

        // HARD BLOCK implicit auto-join
        myCall.joined = false;

        // Manual join
        await myCall.join({ create: true });
        myCall.joined = true;

        if (cancelled) {
          try {
            await myCall.leave();
            await myClient.disconnectUser();
          } catch {}
          return;
        }

        setVideoClient(myClient);
        setCall(myCall);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          toast.error("Failed to join call");
          navigate(-1);
        }
      }
    };

    init();

    // Cleanup
    return () => {
      cancelled = true;
      if (myCall) myCall.leave().catch(() => {});
      if (myClient) myClient.disconnectUser().catch(() => {});
      setVideoClient(null);
      setCall(null);
      initRan.current = false;
    };
  }, [me, peerId, myName, navigate]);

  // ---------------------------
  // Leave Handler
  // ---------------------------
  const handleLeave = async () => {
    try {
      if (call) await call.leave();
    } catch {}

    toast.info("Video call ended", { autoClose: 800 });

    setTimeout(async () => {
      try {
        if (videoClient) await videoClient.disconnectUser();
      } catch {}

      navigate("/chat/page", {
        state: { videoEnded: true },
      });
    }, 850);
  };

  // ---------------------------
  // Loading Screen
  // ---------------------------
  if (loading) {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-gray-950 text-white gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xl">
            📹
          </div>
        </div>
        <p className="animate-pulse font-light tracking-wide text-sm">
          Securing connection...
        </p>
      </div>
    );
  }

  if (!videoClient || !call) return null;

  // ---------------------------
  // CLEAN EQUAL LAYOUT UI
  // ---------------------------
  return (
    <StreamVideo client={videoClient}>
      <StreamTheme>
        <StreamCall call={call} join={false}>
          {/* Main Container */}
          <div className="h-[100dvh] w-screen bg-[#121417] relative flex flex-col overflow-hidden">
            
            {/* Header: Minimal "Live" Badge only (Participants Removed) */}
            <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-start pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                <span className="text-white text-xs md:text-sm font-medium tracking-wide">
                  Live
                </span>
              </div>
            </div>

            {/* Video Grid: Uses PaginatedGridLayout for Equal Sizing */}
            <div className="flex-1 w-full h-full relative flex items-center justify-center">
              {/* custom-grid-wrapper is just a conceptual class. 
                 The styling below ensures the grid takes full space 
                 and participants are sized equally.
              */}
              <div className="w-full h-full [&_.str-video__paginated-grid-layout]:h-full [&_.str-video__paginated-grid-layout]:w-full">
                 <PaginatedGridLayout 
                    groupSize={2} // Forces logic to prioritize 2 people equally
                    videoPlaceholder={false} // Clean look if camera is off
                 />
              </div>
            </div>

            {/* Controls: Centered at bottom */}
            <div className="absolute bottom-6 md:bottom-8 left-0 w-full z-30 flex justify-center px-4 pointer-events-none">
              <div className="pointer-events-auto bg-gray-900/90 backdrop-blur-xl border border-white/10 px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-full shadow-2xl flex gap-3 md:gap-4 items-center overflow-x-auto max-w-full no-scrollbar transition-all duration-300">
                <CallControls onLeave={handleLeave} />
              </div>
            </div>

          </div>
        </StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
}
