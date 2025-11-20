// routes/connection.route.js
import express from "express";
import mentorAuth from "../middleware/mentorAuth.js";
import userAuth from "../middleware/userAuth.js";
import {
  sendConnectionRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getFriendRequestsForMentor,
  getConnections
} from "../controllers/connectionController.js"; // ✅ fix filename (use consistent .controller.js)

const router = express.Router();

/**
 * ============================
 * USER (Mentee) ROUTES
 * ============================
 */

// Send connection request to a mentor
router.post("/send/:mentorId", userAuth, sendConnectionRequest);

// Get outgoing (sent) connection requests
router.get("/outgoing", userAuth, getOutgoingRequests);

// Get all accepted connections for the user
router.get("/connections", userAuth, getConnections);


/**
 * ============================
 * MENTOR ROUTES
 * ============================
 */

// Get all pending incoming requests
router.get("/incoming", mentorAuth, getIncomingRequests);

// Accept a connection request
router.put("/:requestId/accept", mentorAuth, acceptConnectionRequest);

// Reject a connection request
router.put("/:requestId/reject", mentorAuth, rejectConnectionRequest);

// Get all pending friend requests for this mentor
router.get("/friendRequests", mentorAuth, getFriendRequestsForMentor);

router.get("/mentor/connections", mentorAuth, getConnections);


/**
 * ============================
 * EXPORT ROUTER
 * ============================
 */
export default router;
