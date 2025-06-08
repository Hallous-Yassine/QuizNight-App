import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { getUserById } from "../services/user";

const auth: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if authorization header exists
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

    // Check if token is present
    if (!token) {
      res.status(401).json({ message: "Unauthorized: Token missing" });
      return;
    }

    const secret = process.env.SECRET;

    // Check if secret is defined
    if (!secret) {
      console.error("JWT secret is not defined");
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, secret) as { id: number }; // Type assertion for id
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: "Unauthorized: Token has expired" });
        return;
      } else if (e instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
        return;
      } else {
        res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
        return;
      }
    }

    res.locals.user = decoded;

    // Verify if the user exists in the database
    const user = await getUserById(decoded.id);
    if (!user) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }

    // Store the user object in res.locals for downstream use
    res.locals.user = user;
    next();
  } catch (error) {
    console.error("Unexpected authentication error:", error); // Fallback for unexpected errors
    res.status(500).json({ message: "Internal server error" });
  }
};

export default auth;