// routes/streamRoute.js
import express from "express";
import { StreamChat } from "stream-chat";
import mongoose from "mongoose";
import https from "https";

import userSchema from "../models/userModel.js";
import mentorSchema from "../models/mentorModel.js";

const router = express.Router();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_CHAT_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Missing STREAM_API_KEY or STREAM_CHAT_SECRET environment variables.");
  // don't crash, but subsequent calls will fail clearly
}

/* ===========================================================
   REGISTER MONGO MODELS SAFELY
   =========================================================== */
if (!mongoose.models.User) mongoose.model("User", userSchema);
if (!mongoose.models.Mentor) mongoose.model("Mentor", mentorSchema);

const User = mongoose.model("User");
const Mentor = mongoose.model("Mentor");

/* ===========================================================
   STREAM SERVER CLIENT — KEEP-ALIVE + REGION (India)
   =========================================================== */

const keepAliveAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  timeout: 30000,
});

// For v9+ in non-US region (India), specify baseURL so WS endpoints match region.
const serverClient = StreamChat.getInstance(apiKey, apiSecret, {
  httpsAgent: keepAliveAgent,
});


/* ===========================================================
   HELPERS
   =========================================================== */

const makeSafeAvatarUrl = (user) => {
  const name = user?.name || user?.fullName || "User";

  const maybe = user?.photo || user?.profilePic || "";
  if (typeof maybe === "string" && /^https?:\/\//i.test(maybe.trim())) {
    return maybe.trim();
  }

  // if it's a data URL or raw base64, do NOT use it.
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
};

/* ===========================================================
   STREAM TOKEN ROUTE
   =========================================================== */
router.get("/token/:userId", async (req, res) => {
  try {
    let { userId } = req.params;

    // Clean ID
    if (!userId || userId === "undefined" || userId === "null") {
      return res.status(400).json({
        success: false,
        error: "Invalid userId",
      });
    }

    userId = String(userId).trim();

    console.log("🔵 STREAM TOKEN REQUEST FOR:", userId);

    /* -------------------------------------------------------
       1. GET USER OR MENTOR FROM DB
       ------------------------------------------------------- */
    let user = null;
    try {
      user = await User.findById(userId).lean();
    } catch (e) {
      // ignore
    }
    if (!user) {
      try {
        user = await Mentor.findById(userId).lean();
      } catch (e) {
        // ignore
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found in database",
      });
    }

    /* -------------------------------------------------------
       2. BUILD SAFE AVATAR URL (avoid base64 / data URLs)
       ------------------------------------------------------- */
    const avatar = makeSafeAvatarUrl(user);

    /* -------------------------------------------------------
       3. SYNC USER TO STREAM
       ------------------------------------------------------- */
    await serverClient.upsertUser({
      id: userId, // MUST MATCH EXACTLY
      name: user.name || user.fullName || "User",
      image: avatar,
    });

    /* -------------------------------------------------------
       4. CREATE TOKEN FOR SAME ID
       ------------------------------------------------------- */
    const token = serverClient.createToken(userId);

    return res.json({
      success: true,
      token,
    });
  } catch (err) {
    console.error("❌ STREAM TOKEN ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Stream token generation failed",
      details: err?.message || String(err),
    });
  }
});

export default router;
