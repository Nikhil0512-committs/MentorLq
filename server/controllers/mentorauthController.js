// controllers/mentorauthController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";
import multer from "multer";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";
import mongoose from "mongoose";
import mentorSchema from "../models/mentorModel.js";

// Compile model once
const Mentor = mongoose.models.Mentor || mongoose.model("Mentor", mentorSchema);

/* MULTER */
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only .jpeg and .jpg files are allowed"));
    }
    cb(null, true);
  },
});

/* REGISTER MENTOR */
export const registerMentor = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.json({ success: false, message: "Missing required fields" });

    const existingMentor = await Mentor.findOne({ email });
    if (existingMentor) return res.json({ success: false, message: "Mentor already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const {
      specialization,
      bio,
      linkedIn,
      internshipComp,
      skills,
      career,
      mobileNo,
    } = req.body;

    if (
      !specialization ||
      !internshipComp ||
      !bio ||
      !linkedIn ||
      !mobileNo ||
      !Array.isArray(skills) ||
      skills.length === 0 ||
      skills.length > 4 ||
      !Array.isArray(career) ||
      career.length === 0 ||
      career.length > 4
    ) {
      return res.json({ success: false, message: "All questionnaire fields are required" });
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNo)) {
      return res.json({ success: false, message: "Mobile number must be exactly 10 digits" });
    }

    if (!req.file) {
      return res.json({ success: false, message: "Mentor photo is required" });
    }

    const base64Photo = req.file.buffer.toString("base64");

    const mentor = new Mentor({
      name,
      email,
      password: hashedPassword,
      specialization,
      internshipComp,
      skills,
      career,
      bio,
      linkedIn,
      mobileNo,
      photo: base64Photo,
    });

    await mentor.save();

    const token = jwt.sign({ id: mentor._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // cookie flags: secure true only in production; sameSite lax for local dev
    res.cookie("mentorToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to MentorLinq (Mentor)",
      text: `Welcome to MentorLinq as a mentor. Your account has been created with email ${email}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true });
  } catch (error) {
    console.error("registerMentor error:", error);
    return res.json({ success: false, message: error.message });
  }
};

/* LOGIN MENTOR */
export const loginMentor = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.json({ success: false, message: "Email and password are required" });

  try {
    const mentor = await Mentor.findOne({ email });
    if (!mentor) return res.json({ success: false, message: "Invalid email" });

    const isMatch = await bcrypt.compare(password, mentor.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: mentor._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("mentorToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("loginMentor error:", error);
    return res.json({ success: false, message: "Invalid email or password" });
  }
};

/* LOGOUT */
export const logoutMentor = async (req, res) => {
  try {
    res.clearCookie("mentorToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ success: true, message: "Mentor logged out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

/* SEND VERIFY OTP */
export const sendVerifyOtpMentor = async (req, res) => {
  try {
    const mentorId = req.mentor._id;
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) return res.json({ success: false, message: "Mentor not found" });

    if (mentor.isAccountVerified) return res.json({ success: false, message: "Account already verified" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    mentor.verifyOtp = otp;
    mentor.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await mentor.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: mentor.email,
      subject: "Mentor Account Verification OTP",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", mentor.email),
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "OTP sent on email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

/* VERIFY EMAIL */
export const verifyEmailMentor = async (req, res) => {
  const { otp } = req.body;
  const mentorId = req.mentor._id;

  if (!otp) return res.json({ success: false, message: "Missing OTP" });

  try {
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) return res.json({ success: false, message: "Mentor not found" });

    if (mentor.verifyOtp === "" || mentor.verifyOtp !== otp) return res.json({ success: false, message: "Invalid OTP" });
    if (mentor.verifyOtpExpireAt < Date.now()) return res.json({ success: false, message: "OTP expired" });

    mentor.isAccountVerified = true;
    mentor.verifyOtp = "";
    mentor.verifyOtpExpireAt = 0;
    await mentor.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

/* IS AUTHENTICATED */
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true, role: "mentor" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

/* SEND RESET OTP */
export const sendResetOtpMentor = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Email is required" });

  try {
    const mentor = await Mentor.findOne({ email });
    if (!mentor) return res.json({ success: false, message: "Mentor not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    mentor.resetOtp = otp;
    mentor.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await mentor.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: mentor.email,
      subject: "Password Reset OTP (Mentor)",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", mentor.email),
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

/* RESET PASSWORD */
export const resetPasswordMentor = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.json({ success: false, message: "Email, OTP, password are required" });

  try {
    const mentor = await Mentor.findOne({ email });
    if (!mentor) return res.json({ success: false, message: "Mentor not found" });

    if (mentor.resetOtp === "" || mentor.resetOtp !== otp) return res.json({ success: false, message: "Invalid OTP" });
    if (mentor.resetOtpExpireAt < Date.now()) return res.json({ success: false, message: "OTP expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    mentor.password = hashedPassword;
    mentor.resetOtp = "";
    mentor.resetOtpExpireAt = 0;
    await mentor.save();

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

/* GET MENTOR DATA */

