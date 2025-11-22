// routes/streamRoute.js
import express from "express";
import { StreamChat } from "stream-chat";
import mongoose from "mongoose";
import https from "https";

import userSchema from "../models/userModel.js";
import mentorSchema from "../models/mentorModel.js";

const router = express.Router();

// ENV
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_CHAT_SECRET;

if (!apiKey || !apiSecret) {
  console.error("❌ Missing STREAM_API_KEY or STREAM_CHAT_SECRET");
}

// ============================================
// SAFE MODEL REGISTRATION
// ============================================
if (!mongoose.models.User) mongoose.model("User", userSchema);
if (!mongoose.models.Mentor) mongoose.model("Mentor", mentorSchema);

const User = mongoose.model("User");
const Mentor = mongoose.model("Mentor");

// ============================================
// STREAM SERVER CLIENT
// ============================================
const keepAliveAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  timeout: 30000,
});

const serverClient = StreamChat.getInstance(apiKey, apiSecret, {
  httpsAgent: keepAliveAgent,
});

// ============================================
// HELPER: SAFE AVATAR MAKER
// ============================================
const makeSafeAvatarUrl = (user) => {
  const name = user?.name || user?.fullName || "User";

  const image = user?.photo || user?.profilePic || "";

  // allow only HTTPS image URLs
  if (typeof image === "string" && /^https?:\/\//i.test(image.trim())) {
    return image.trim();
  }

  // fallback to UI Avatars
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
};

// ============================================
// ENSURE A STREAM USER EXISTS
// (Fixes mentor → chat mentee errors)
// ============================================
router.post("/ensure-user", async (req, res) => {
  try {
    let { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: "userId required" });
    }

    userId = String(userId).trim();

    let user = null;

    try {
      user = await User.findById(userId).lean();
    } catch (_) {}
    if (!user) {
      try {
        user = await Mentor.findById(userId).lean();
      } catch (_) {}
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Peer user not found in DB",
      });
    }

    const avatar = makeSafeAvatarUrl(user);

    await serverClient.upsertUser({
      id: userId,
      name: user.name || user.fullName || "User",
      image: avatar,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ ENSURE USER ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to ensure user exists on Stream",
    });
  }
});

// ============================================
// CREATE TOKEN FOR A USER
// ============================================
router.get("/token/:userId", async (req, res) => {
  try {
    let { userId } = req.params;
    if (!userId || userId === "undefined" || userId === "null") {
      return res.status(400).json({
        success: false,
        error: "Invalid userId",
      });
    }

    userId = String(userId).trim();
    console.log("🔵 Token request for", userId);

    let user = null;
    try {
      user = await User.findById(userId).lean();
    } catch (_) {}
    if (!user) {
      try {
        user = await Mentor.findById(userId).lean();
      } catch (_) {}
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found in database",
      });
    }

    const avatar = makeSafeAvatarUrl(user);

    // upsert user
    await serverClient.upsertUser({
      id: userId,
      name: user.name || user.fullName || "User",
      image: avatar,
    });

    // generate token
    const token = serverClient.createToken(userId);

    return res.json({
      success: true,
      token,
    });
  } catch (err) {
    console.error("❌ TOKEN ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Stream token generation failed",
    });
  }
});

export default router;
