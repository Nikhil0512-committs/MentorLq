import mentorSchema from "../models/mentorModel.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"; // ✅ Import JWT

const mentorModel = mongoose.models.Mentor || mongoose.model("Mentor", mentorSchema);

export const getMentorData = async (req, res) => {
  try {
    // 1. Manually get the token from cookies
    const { mentorToken } = req.cookies;

    // 2. If no token, return success: false (This avoids the 401 console error)
    if (!mentorToken) {
      return res.json({ success: false, message: "No token provided" });
    }

    // 3. Verify the token manually
    const decoded = jwt.verify(mentorToken, process.env.JWT_SECRET);
    const mentorId = decoded.id;

    // 4. Fetch Mentor
    const mentor = await mentorModel.findById(mentorId).select("-password");

    if (!mentor) {
      return res.json({ success: false, message: "Mentor not found" });
    }

    res.json({
      success: true,
      mentorData: {
        _id: mentor._id,
        name: mentor.name,
        isAccountVerified: mentor.isAccountVerified,
        bio: mentor.bio,
        imageUrl: mentor.photo,
        title: mentor.specialization,
        career: mentor.career,
        skills: mentor.skills,
      },
    });
  } catch (error) {
    // If token is invalid (e.g. expired), jwt.verify throws an error.
    // We catch it and return false, keeping the console clean.
    res.json({ success: false, message: error.message });
  }
};

export const getAllMentors = async (req, res) => {
  try {
    const mentors = await global.Mentor.find().select("-password");
    res.status(200).json({ success: true, mentors });
  } catch (error) {
    console.error("Error fetching mentors:", error);
    res.status(500).json({ success: false, message: "Failed to fetch mentors" });
  }
};