import express from "express";
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyEmail, getLoggedInUser } from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
import multer from "multer";


const authRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

authRouter.post('/register', upload.single("file"), register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',userAuth, sendVerifyOtp);
authRouter.post('/verify-account',userAuth, verifyEmail);
authRouter.get('/is-Auth',userAuth, isAuthenticated);
authRouter.post('/send-reset-otp',sendResetOtp);
authRouter.post('/reset-password',resetPassword);
authRouter.get("/me",userAuth, getLoggedInUser);




export default authRouter;