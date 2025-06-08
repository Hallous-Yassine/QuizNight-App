import { Router } from "express";
import {
    getUserQuizScoreByUserIdAndQuizId,
    getUserQuizScoreById,
    createUserQuizScore,
    updateUserQuizScore,
    totalScore,
} from "../handlers/UserQuizScore"; // Adjust path as needed

import auth from "../middleware/auth"; // Adjust path as needed

const userQuizScoreRouter = Router();

userQuizScoreRouter.get("/:id", auth, getUserQuizScoreById); // Get user quiz score by ID (protected)
userQuizScoreRouter.get("/user/:userId/quiz/:quizId", auth, getUserQuizScoreByUserIdAndQuizId); // Get user quiz score by user ID and quiz ID (protected)
userQuizScoreRouter.post("/", auth, createUserQuizScore); // Create new user quiz score (protected)
userQuizScoreRouter.put("/:id", auth, updateUserQuizScore); // Update user quiz score by ID (protected)
userQuizScoreRouter.get("/total/:userId", auth, totalScore); // Get total score by user ID (protected)

export default userQuizScoreRouter;