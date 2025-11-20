// middleware/mentorAuth.js
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import mentorSchema from "../models/mentorModel.js";

const Mentor = mongoose.models.Mentor || mongoose.model("Mentor", mentorSchema);

const mentorAuth = async (req, res, next) => {
  try {
    // cookie name must match what's set in loginMentor
    const token = req.cookies?.mentorToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "Mentor not authenticated (no token)" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    const mentor = await Mentor.findById(decoded.id).select("-password");
    if (!mentor) {
      return res.status(401).json({ success: false, message: "Invalid mentor token" });
    }

    // Attach mentor to request for downstream controllers
    req.mentor = mentor;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Mentor authentication failed", error: error.message });
  }
};

export default mentorAuth;
