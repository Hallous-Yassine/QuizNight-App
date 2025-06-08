import { RequestHandler } from "express";
import * as questionService from "../services/question";

const getAllQuestions: RequestHandler = async (req, res) => {
    try {
        const quizId = parseInt(req.params.quizId, 10);
        const questions = await questionService.getAllQuestions(quizId);
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: "Error: Cannot get all questions" });
    }
}

const createQuestion: RequestHandler = async (req, res) => {
    try {
        const questions = req.body; // array of question objects
        const createdQuestions = await Promise.all(questions.map((question: any) => questionService.createQuestion(question)));
        res.status(201).json(createdQuestions);
    } catch (error) {
        res.status(500).json({ message: "Error: Cannot create question" });
    }
}

export { getAllQuestions, createQuestion };
