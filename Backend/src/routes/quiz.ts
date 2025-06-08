import { Router } from "express";
import {
    getAllQuizzes,
    getQuizById,
    createQuiz,
    getQuizByUserId
}from "../handlers/quiz"; // Adjust path as needed

import auth from "../middleware/auth"; // Adjust path as needed

const quizRouter = Router();

quizRouter.get("/", auth, getAllQuizzes); // Get all quizzes (protected)
quizRouter.get("/:id", auth, getQuizById); // Get quiz by ID (protected)
quizRouter.post("/", auth , createQuiz); // Create a new quiz (protected)
quizRouter.get("/user/:userId", auth, getQuizByUserId); // Get quizzes by user ID (protected)

export default quizRouter;

