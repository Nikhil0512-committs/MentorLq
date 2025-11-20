// controllers/userController.js

// ❗ DO NOT import mongoose or remake the model
// Use the global.User model created in server.js

export const getUserData = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID found",
      });
    }

    // Use the correct model
    const user = await global.User
      .findById(userId)
      .select(
        "-password -verifyOtp -verifyOtpExpireAt -resetOtp -resetOtpExpireAt"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        specialization: user.specialization || "",
        bio: user.bio || "",
        linkedIn: user.linkedIn || "",
        mobileNo: user.mobileNo || "",
        photo: user.photo || "",
        isAccountVerified: user.isAccountVerified,
        careerInterest: user.careerInterest || [],
        mentorshipAreas: user.mentorshipAreas || [],
        connections: user.connections || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

  } catch (error) {
    console.error("❌ Error in getUserData:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
