import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoute.js";
import mentorAuthRouter from "./routes/mentorAuthRoute.js";
import mongoose from "mongoose";
import connectionRouter from "./routes/connectionRoute.js";
import mentorRouter from "./routes/mentorRoute.js";
import mentorSchema from "./models/mentorModel.js";
import userSchema from "./models/userModel.js";
import connectionRequestSchema from "./models/connectionRequestModel.js";
import streamRouter from "./routes/streamRoute.js";


// ✅ Compile the schema into a model globally
global.User = mongoose.models.User || mongoose.model("User", userSchema);
global.Mentor = mongoose.models.Mentor || mongoose.model("Mentor", mentorSchema);
global.ConnectionRequest = mongoose.models.ConnectionRequest || mongoose.model("ConnectionRequest", connectionRequestSchema);

const app = express();
const port = process.env.PORT || 4000;

// ✅ 1. Define allowed origins
const allowedOrigins = [`http://localhost:${port}`];

// ✅ 2. Apply CORS middleware FIRST
app.use(cors({
  origin: ["http://localhost:5173", "https://69214c7111316eaa3c0a7979--mentorrlinq.netlify.app", "https://mentorlinq.com"],
  credentials: true,
}));

// ✅ 3. Other middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ 4. Connect DB
connectDB(); // <-- This sets global.User and global.Mentor properly

// ✅ 5. Routes
app.get('/', (req, res) => res.send("API Working"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use("/api/auth/mentor", mentorAuthRouter);
app.use('/api/req',connectionRouter);
app.use('/api/mentor',mentorRouter);
app.use("/api/stream", streamRouter);

// ✅ 6. Start server
app.listen(port, () => console.log(`Server running on PORT ${port}`));