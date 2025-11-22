import express from "express";
import { getMentorData , getAllMentors } from "../controllers/mentorController.js";

const mentorRouter = express.Router();

// protected route to get mentor details
mentorRouter.get("/data",  getMentorData);
mentorRouter.get("/all",getAllMentors);

export default mentorRouter;
