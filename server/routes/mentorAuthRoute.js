import express from "express";
import {
  registerMentor,
  loginMentor,
  logoutMentor,
  sendResetOtpMentor,
  resetPasswordMentor,
  isAuthenticated,
  sendVerifyOtpMentor,
  verifyEmailMentor,
  upload,
} from "../controllers/mentorauthController.js";
import mentorAuth from "../middleware/mentorAuth.js";

const router = express.Router();

router.post("/register", upload.single("photo"), registerMentor);
router.post("/login", loginMentor);
router.post("/logout", logoutMentor);
router.post('/send-verify-otp', mentorAuth, sendVerifyOtpMentor);
router.post('/verify-account', mentorAuth, verifyEmailMentor);
router.get('/is-Auth', mentorAuth, isAuthenticated);
router.post("/send-reset-otp", sendResetOtpMentor);
router.post("/reset-password",resetPasswordMentor);

export default router;
