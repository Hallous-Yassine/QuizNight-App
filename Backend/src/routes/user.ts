import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  findOneByHandler, 
  logoutUser,
  getUserScore,
  updateUserScore
} from "../handlers/user"; // Adjust path as needed
import auth from "../middleware/auth"; // Adjust path as needed

const userRouter = Router();

// User Routes
userRouter.get("/", auth, getAllUsers); // Get all users (protected)
userRouter.get("/:id", auth, getUserById); // Get user by ID (protected)
userRouter.post("/", createUser); // Create new user (public)
userRouter.put("/:id", auth, updateUser); // Update user by ID (protected)
userRouter.delete("/:id", auth, deleteUser); // Delete user by ID (protected)
userRouter.post("/login", loginUser); // User login (public)
userRouter.post("/find", auth, findOneByHandler); // Find user by field (protected)
userRouter.post("/logout", auth, logoutUser);
userRouter.get("/score/:id", auth, getUserScore); // Get user score by ID (protected)
userRouter.put("/score/:id", auth, updateUserScore); // Update user score by ID (protected)

export default userRouter;