import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import userSchema from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";

// Create global User model once
if (!global.User) {
  global.User = mongoose.models.users || mongoose.model("users", userSchema);
}

// ====================== REGISTER ======================
export const register = async (req, res) => {
  try {
    // 1. Basic Details Validation
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // 2. Check for existing user
    const existingUser = await global.User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. All Other Fields Validation (like registerMentor)
    const {
      college,
      mbaSpecialization, // Renamed from 'specialization' in mentor
      careerInterest, // Mapped from 'careerInterests' in frontend
      mentorshipAreas,
      bio, // Mapped from 'shortBio' in frontend
      linkedIn, // Mapped from 'linkedinUrl' in frontend
      mobileNo, // Mapped from 'whatsappNumber' in frontend
    } = req.body;

    if (
      !college ||
      !mbaSpecialization ||
      !bio ||
      !linkedIn ||
      !mobileNo
    ) {
      return res.json({
        success: false,
        message: "All profile fields are required",
      });
    }

    // 5. Array Validation (matching frontend limits)
    if (
      !Array.isArray(careerInterest) ||
      careerInterest.length === 0 ||
      careerInterest.length > 2
    ) {
      return res.json({
        success: false,
        message:
          "Please select 1 or 2 career interests.",
      });
    }

    if (
      !Array.isArray(mentorshipAreas) ||
      mentorshipAreas.length === 0 ||
      mentorshipAreas.length > 2
    ) {
      return res.json({
        success: false,
        message: "Please select 1 or 2 mentorship areas.",
      });
    }

    // 6. Mobile Number Validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNo)) {
      return res.json({
        success: false,
        message: "Mobile number must be exactly 10 digits",
      });
    }

    // 7. File Validation (Photo is required)
    let photoBase64 = "";
    if (req.file) {
      photoBase64 = req.file.buffer.toString("base64");
    } else {
      return res.json({
        success: false,
        message: "Profile photo is required",
      });
    }

    // 8. Create new user
    // Note: Ensure your userSchema matches these field names
    const user = new global.User({
      name,
      email,
      password: hashedPassword,
      college, // Added this field
      specialization: mbaSpecialization,
      bio,
      linkedIn,
      mobileNo,
      careerInterest, // Using the direct array
      mentorshipAreas, // Using the direct array
      photo: photoBase64,
    });

    await user.save();

    // 9. Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 10. Generate & Send OTP (This part was correct)
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Verify your MentorLinq account",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        email
      ),
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Registration successful. OTP sent to your email.",
      token, // Sending token might be unnecessary if you verify right after
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ====================== LOGIN ======================
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await global.User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ====================== LOGOUT ======================
export const logout = async (req, res) => {
  try {
    // Note: Logout doesn't need email. Clearing cookie is enough.
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ====================== SEND VERIFY OTP ======================
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user.id; // Comes from auth middleware
    const user = await global.User.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent on email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ====================== VERIFY EMAIL ======================
export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const userId = req.user.id; // Comes from auth middleware

  if (!otp) {
    return res.json({ success: false, message: "Missing OTP" });
  }

  try {
    const user = await global.User.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ====================== IS AUTHENTICATED ======================
export const isAuthenticated = async (req, res) => {
  try {
    // This route is only hit if auth middleware passes
   res.json({
      success: true,
      role: "user"
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ====================== SEND RESET OTP ======================
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await global.User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ====================== RESET PASSWORD ======================
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, OTP, and password are required",
    });
  }

  try {
    const user = await global.User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getLoggedInUser = async (req, res) => {
  try {
    const user = await global.User.findById(req.user.id).select("-password");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
