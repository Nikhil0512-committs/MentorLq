import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.json({ success: false, message: "Login again" });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.json({ success: false, message: "Not authorized. Login again" });
    }

   
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default userAuth;
