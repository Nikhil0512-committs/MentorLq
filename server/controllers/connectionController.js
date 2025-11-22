// controllers/connection.controller.js
// Improved, robust connection controller
// - works for mentee and mentor callers where applicable
// - ensures populated fields include photo, specialization, skills, linkedIn
// - uses string comparisons for ObjectId equality

export const sendConnectionRequest = async (req, res) => {
  try {
    const userId = req.user?.id; // mentee (from userAuth)
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const mentorId = req.params.mentorId;
    if (!mentorId) return res.status(400).json({ success: false, message: "Missing mentorId" });

    const mentor = await global.Mentor.findById(mentorId);
    if (!mentor) return res.status(404).json({ success: false, message: "Mentor not found" });

    const existing = await global.ConnectionRequest.findOne({
      sender: userId,
      recipient: mentorId,
    });

    if (existing) return res.status(400).json({ success: false, message: "Request already sent" });

    const request = await global.ConnectionRequest.create({
      sender: userId,
      recipient: mentorId,
    });

    return res.status(201).json({ success: true, message: "Request sent", request });
  } catch (err) {
    console.error("sendConnectionRequest error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getIncomingRequests = async (req, res) => {
  try {
    // This route is intended for mentors (mentorAuth) so prefer req.mentor
    const mentorId = req.mentor?._id || req.user?.id;
    if (!mentorId) return res.status(401).json({ success: false, message: "Not authenticated as mentor" });

    const incoming = await global.ConnectionRequest.find({
      recipient: mentorId,
      status: "pending",
    }).populate(
      "sender",
      "name email photo college specialization internshipCompany careerInterest mentorshipAreas bio linkedIn"
    );

    return res.json({ success: true, incoming });
  } catch (err) {
    console.error("getIncomingRequests error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getOutgoingRequests = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const outgoing = await global.ConnectionRequest.find({
      sender: userId,
      status: "pending",
    }).populate(
      "recipient",
      "name email photo college specialization internshipCompany careerInterest mentorshipAreas bio linkedIn"
    );

    return res.json({ success: true, outgoing });
  } catch (err) {
    console.error("getOutgoingRequests error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const mentorId = req.mentor?._id;
    if (!mentorId) return res.status(401).json({ success: false, message: "Not authenticated as mentor" });

    const requestId = req.params.requestId;
    if (!requestId) return res.status(400).json({ success: false, message: "Missing requestId" });

    const request = await global.ConnectionRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    if (request.recipient.toString() !== mentorId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    request.status = "accepted";
    await request.save();

    // add to users' connections arrays (use addToSet)
    await global.User.findByIdAndUpdate(request.sender, {
      $addToSet: { connections: request.recipient },
    });
    await global.Mentor.findByIdAndUpdate(request.recipient, {
      $addToSet: { connections: request.sender },
    });

    // return the populated connection (optional)
    const populated = await global.ConnectionRequest.findById(requestId)
      .populate("sender", "name email photo specialization skills linkedIn")
      .populate("recipient", "name email photo specialization skills linkedIn");

    return res.json({ success: true, message: "Request accepted", connection: populated });
  } catch (err) {
    console.error("acceptConnectionRequest error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  try {
    const mentorId = req.mentor?._id;
    if (!mentorId) return res.status(401).json({ success: false, message: "Not authenticated as mentor" });

    const requestId = req.params.requestId;
    if (!requestId) return res.status(400).json({ success: false, message: "Missing requestId" });

    const request = await global.ConnectionRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    if (request.recipient.toString() !== mentorId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    request.status = "rejected";
    await request.save();

    return res.json({ success: true, message: "Request rejected" });
  } catch (err) {
    console.error("rejectConnectionRequest error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getFriendRequestsForMentor = async (req, res) => {
  try {
    const mentorId = req.mentor?._id;
    if (!mentorId) return res.status(401).json({ success: false, message: "Not authenticated as mentor" });

    const requests = await global.ConnectionRequest.find({
      recipient: mentorId,
      status: "pending",
    })
      .populate("sender", "name email photo specialization skills linkedIn")
      .sort({ createdAt: -1 });

    return res.json({ success: true, total: requests.length, requests });
  } catch (err) {
    console.error("getFriendRequestsForMentor error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * getConnections
 * - This is used by both mentee (userAuth) and mentor (mentorAuth) clients.
 * - It returns all accepted connections where the caller is either sender or recipient.
 * - We populate both sides with the fields client UI needs.
 */
// 🔥 DANGER: One-time route to clear all connections

export const getConnections = async (req, res) => {
  try {
    const callerId = req.user?.id || req.mentor?._id;
    if (!callerId) return res.status(401).json({ success: false, message: "Not authenticated" });

    // 1. Get all connections
    const connections = await global.ConnectionRequest.find({
      $or: [{ sender: callerId }, { recipient: callerId }],
      status: "accepted",
    })
      .populate("sender", "name email photo specialization careerInterest mentorshipAreas  bio linkedIn ")
      .populate("recipient", "name email photo specialization skills bio linkedIn")
      .sort({ updatedAt: -1 }); // ⭐ Show newest connections first

    // 2. ⭐ CRITICAL FIX: Filter out "Ghosts"
    // If a user was deleted from the DB, 'sender' or 'recipient' will be null.
    // We filter those out so the frontend never receives them.
    const validConnections = connections.filter(c => {
        return c.sender?._id && c.recipient?._id;
    });

    return res.json({ success: true, connections: validConnections });
  } catch (err) {
    console.error("getConnections error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// server/controllers/connectionController.js

// ... existing functions (sendConnectionRequest, getConnections, etc.) ...

// 🔥 DANGER: One-time function to clear all connections
export const nukeConnections = async (req, res) => {
  try {
    // 1. Delete all connection requests
    await global.ConnectionRequest.deleteMany({});
    
    // 2. (Optional but recommended) Clear the connections array in Users and Mentors too
    // This ensures no "ghost" IDs remain in the user profiles
    if (global.User) {
      await global.User.updateMany({}, { $set: { connections: [] } });
    }
    if (global.Mentor) {
      await global.Mentor.updateMany({}, { $set: { connections: [] } });
    }

    return res.json({ success: true, message: "💥 All connections and lists nuked successfully." });
  } catch (err) {
    console.error("Nuke error:", err);
    return res.status(500).json({ error: err.message });
  }
};

