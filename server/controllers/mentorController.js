import mentorSchema from "../models/mentorModel.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"; 

const mentorModel = mongoose.models.Mentor || mongoose.model("Mentor", mentorSchema);

export const getMentorData = async (req, res) => {
  try {
    
    const { mentorToken } = req.cookies;

    
    if (!mentorToken) {
      return res.json({ success: false, message: "No token provided" });
    }

   
    const decoded = jwt.verify(mentorToken, process.env.JWT_SECRET);
    const mentorId = decoded.id;

   
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
