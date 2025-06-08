import { Router } from "express";
import {
    getAllQuestions,
    createQuestion,
} from "../handlers/question"; // Adjust path as needed

import auth from "../middleware/auth"; // Adjust path as needed

const questionRouter = Router();

questionRouter.get("/:quizId", auth, getAllQuestions); // Get all questions for a quiz (protected)
questionRouter.post("/", auth, createQuestion); // Create a new question (protected)

export default questionRouter;