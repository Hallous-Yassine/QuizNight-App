import { RequestHandler } from "express";
import jwt from "jsonwebtoken";


const auth: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  // Check if header starts with "Bearer "
  if (!authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: Invalid token format" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized: Token missing" });
    return;
  }

  const secret = process.env.SECRET;
  if (!secret) {
    console.error("JWT secret is not defined");
    res.status(500).json({ message: "Internal server error" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret);
    res.locals.user = decoded;
    next();
  } catch (e) {
    console.error("Authentication error:", e); // Log for debugging
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

export default auth;