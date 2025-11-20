import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getUserData } from "../controllers/userController.js";
import multer from "multer";

const userRouter = express.Router();

// ✅ Fallback check
if (!global.User) {
  console.error("⚠️ global.User is not defined. Please initialize it in your main server file like:");
  console.error("   global.User = mongoose.model('User', userSchema);");
}

/* =======================================================================
   ✅ MULTER CONFIG
   ======================================================================== */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only .jpeg, .jpg and .png files are allowed"));
    }
    cb(null, true);
  },
});

/* =======================================================================
   ✅ PROTECTED ROUTES
   ======================================================================== */
userRouter.get("/data", userAuth, getUserData);

/* =======================================================================
   ✅ QUESTIONNAIRE + PHOTO UPLOAD ROUTE (MATCHES YOUR FRONTEND)
   ======================================================================== */
userRouter.post("/questionnaire", userAuth, upload.single("profileImage"), async (req, res) => {
  try {
    const {
      fullName,
      college,
      mbaSpecialization,
      internshipCompany,
      careerInterests,
      mentorshipAreas,
      shortBio,
      linkedinUrl,
      whatsappNumber,
    } = req.body;
      let parsedCareerInterests = [];
      let parsedMentorshipAreas = [];



try {
  // If the data came as a JSON string
  if (typeof careerInterests === "string") {
    parsedCareerInterests = JSON.parse(careerInterests);
  } else if (Array.isArray(careerInterests)) {
    parsedCareerInterests = careerInterests;
  } else {
    parsedCareerInterests = (careerInterests || "").split(",");
  }
} catch {
  parsedCareerInterests = Array.isArray(careerInterests) ? careerInterests : [];
}

try {
  if (typeof mentorshipAreas === "string") {
    parsedMentorshipAreas = JSON.parse(mentorshipAreas);
  } else if (Array.isArray(mentorshipAreas)) {
    parsedMentorshipAreas = mentorshipAreas;
  } else {
    parsedMentorshipAreas = (mentorshipAreas || "").split(",");
  }
} catch {
  parsedMentorshipAreas = Array.isArray(mentorshipAreas) ? mentorshipAreas : [];
}

    // 🔍 Validation
    if (
      !fullName ||
      !college ||
      !mbaSpecialization ||
      !internshipCompany ||
      !careerInterests ||
      !mentorshipAreas ||
      !shortBio ||
      !linkedinUrl ||
      !whatsappNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 📱 Validate WhatsApp number
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(whatsappNumber)) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp number must be exactly 10 digits",
      });
    }

    // 🖼️ Handle image
    let photoBase64 = "";
    if (req.file) {
      photoBase64 = req.file.buffer.toString("base64");
    } else {
      return res.status(400).json({
        success: false,
        message: "Profile photo is required",
      });
    }

    // 🧠 Parse comma-separated lists
    

    

    // 🧩 Update user in DB
    const updatedUser = await global.User.findByIdAndUpdate(
      req.user.id,
      {
        name: fullName,
        college,
        specialization: mbaSpecialization,
        internshipCompany,
        careerInterest: parsedCareerInterests,
        mentorshipAreas: parsedMentorshipAreas,
        bio: shortBio,
        linkedIn: linkedinUrl,
        mobileNo: whatsappNumber,
        photo: photoBase64,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Questionnaire and photo submitted successfully",
      data: {
        name: updatedUser.name,
        email: updatedUser.email,
        college: updatedUser.college,
        specialization: updatedUser.specialization,
        internshipCompany: updatedUser.internshipCompany,
        careerInterest: updatedUser.careerInterest,
        mentorshipAreas: updatedUser.mentorshipAreas,
        bio: updatedUser.bio,
        linkedIn: updatedUser.linkedIn,
        mobileNo: updatedUser.mobileNo,
      },
    });
  } catch (error) {
    console.error("❌ Questionnaire Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default userRouter;
