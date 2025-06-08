import { RequestHandler } from "express";
import * as quizService from "../services/quiz";
import Quiz from "../models/quiz";

interface CreateQuizRequest{
    type: string;
    title: string;
    description: string;
    image: string;
    createdById: number;
}

    
const getAllQuizzes: RequestHandler = async (req, res) => {
    try {
        const quizzes = await quizService.getAllQuizzes();
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: "Error: Cannot get all quizzes" });
    }
};

const getQuizById: RequestHandler = async (req, res) => {
    const { id } = req.params;
    try {
        const quizData = await quizService.getQuizById(Number(id));
        res.status(200).json(quizData);
    } catch (error) {
        res.status(500).json({ message: "Error: Cannot get quiz by id" });
    }
};

// Create a new quiz and return the created quiz
const createQuiz: RequestHandler = async (req, res) => {
    const quizData: CreateQuizRequest = req.body;
    try {
        const newQuiz = await quizService.createQuiz(quizData);
        res.status(201).json(newQuiz);
    } catch (error) {
        res.status(500).json({ message: "Error: Cannot create quiz" });
    }
};

// const getQuizByUserId: RequestHandler = async (req, res) => {

const getQuizByUserId: RequestHandler = async (req, res) => {
    const { userId } = req.params;
    try {
        const quizzes = await quizService.getQuizByUserId(Number(userId));
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: "Error: Cannot get quizzes by user id" });
    }
}


export { getAllQuizzes, getQuizById, createQuiz , getQuizByUserId };

