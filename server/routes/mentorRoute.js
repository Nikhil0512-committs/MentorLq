import express from "express";
import mentorAuth from "../middleware/mentorAuth.js";
import { getMentorData , getAllMentors } from "../controllers/mentorController.js";

const mentorRouter = express.Router();

// protected route to get mentor details
mentorRouter.get("/data", mentorAuth, getMentorData);
mentorRouter.get("/all",getAllMentors);

export default mentorRouter;
