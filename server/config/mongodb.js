import mongoose from "mongoose";
import userSchema from "../models/userModel.js";
import mentorSchema from "../models/mentorModel.js";
import connectionRequestSchema from "../models/connectionRequestModel.js";

const connectDB = async () => {
  try {
    // Connect to the REAL database (test)
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "test" });

    console.log("✅ Connected to MongoDB (test)");

    // Compile models ON THIS SAME CONNECTION
    global.User = mongoose.models.User || mongoose.model("User", userSchema);
    global.Mentor = mongoose.models.Mentor || mongoose.model("Mentor", mentorSchema);
    global.ConnectionRequest =
      mongoose.models.ConnectionRequest ||
      mongoose.model("ConnectionRequest", connectionRequestSchema);

    console.log("🚀 Models initialized successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
