import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.json({ success: false, message: "Login again" });
    }

    // ✅ Verify token and store result in `decoded`
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.json({ success: false, message: "Not authorized. Login again" });
    }

    // ✅ Create req.user and attach user ID
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default userAuth;