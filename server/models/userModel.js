import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String, required: true },
  verifyOtp: {type:String, default:""},
  verifyOtpExpireAt: {type:Number, default:0},
  isAccountVerified: {type:Boolean, default:false},
  specialization: { type: String  },
  bio: { type: String},
  linkedIn: { type: String },
  mobileNo: { type: String },
  photo: { type: String },
  resetOtp: { type: String, default: "" },
  careerInterest: {type:[String], 
    validate:{
      validator: arr=>arr.length<=2,
      message: "career Interest can have at most 2 items"
    }
  },
  mentorshipAreas:{type:[String], 
    validate:{
      validator: arr=> arr.length <=2,
      message: "needHelp can have at most 2 items"
    }
  },
  resetOtpExpireAt: { type: Number, default: 0 },
  connections: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor", // for userModel.js
  },
],
}, { timestamps: true });


export default userSchema;
