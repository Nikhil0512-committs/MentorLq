// models/mentorModel.js
import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    specialization: { type: String },
    internshipComp:{type:String},
    career: {type:[String], 
    validate: {
    validator: arr => arr.length <= 4,
    message: "Skills can have at most 4 items"
  }
    },
    skills: {type:[String], 
    validate: {
    validator: arr => arr.length <= 4,
    message: "Skills can have at most 4 items"
  }
    },
    experienceYears: { type: Number },
    bio: { type: String },
    linkedIn: { type: String },
    mobileNo: { type: String },
    photo: { type: String },
    isAccountVerified: { type: Boolean, default: false },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpireAt: { type: Number, default: 0 },
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Number, default: 0 },
    connections: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // for mentorModel.js
  },
],

  },
  { timestamps: true }
);

export default mentorSchema;
