import jwt from "jsonwebtoken";
import User from "../models/User.js"; 

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    const user = await User.findById(decoded.id); // Fetch the user from the database

    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }

    req.user = user; // Attach user to the request object
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

export default authenticate;