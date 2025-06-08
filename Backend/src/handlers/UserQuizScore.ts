import { RequestHandler } from "express";
import * as UserQuizScoreService from "../services/UserQuizScore";

const getUserQuizScoreByUserIdAndQuizId: RequestHandler = async (req, res) => {
    const { userId, quizId } = req.params;
    try {
        const userQuizScore = await UserQuizScoreService.getUserQuizScoreByUserIdAndQuizId(Number(userId), Number(quizId));
        if (!userQuizScore) {
        res.status(404).json({ message: "User quiz score not found" });
        return 
        }
        res.status(200).json(userQuizScore);
        return
    } catch (error) {
        res.status(500).json({ message: error });
        return 
    }
}

const getUserQuizScoreById: RequestHandler = async (req, res) => {
    const { id } = req.params;
    try {
        const userQuizScore = await UserQuizScoreService.getUserQuizScoreById(Number(id));
        if (!userQuizScore) {
            res.status(404).json({ message: "User quiz score not found" });
            return 
        }
        res.status(200).json(userQuizScore);
        return 
    } catch (error) {
        res.status(500).json({ message: error });
        return 
    }
}

const createUserQuizScore: RequestHandler = async (req, res) => {
    const { userId, quizId, bestScore } = req.body;
    try {
        const userQuizScore = await UserQuizScoreService.createUserQuizScore(userId, quizId, bestScore);
        res.status(201).json(userQuizScore);
        return 
    } catch (error) {
        res.status(500).json({ message: error });
        return 
    }
}

const updateUserQuizScore: RequestHandler = async (req, res) => {
    const { id } = req.params;
    const { bestScore } = req.body;
    try {
        const userQuizScore = await UserQuizScoreService.updateUserQuizScore(Number(id), bestScore);
        res.status(200).json(userQuizScore);
        return 
    } catch (error) {
        res.status(500).json({ message: error });
        return
    }
}

const totalScore: RequestHandler = async (req, res) => {
    const { userId } = req.params;
    try {
        const total = await UserQuizScoreService.totalScore(Number(userId));
        res.status(200).json({ total });
        return 
    } catch (error) {
        res.status(500).json({ message: error });
        return 
    }
}

export {
    getUserQuizScoreByUserIdAndQuizId,
    getUserQuizScoreById,
    createUserQuizScore,
    updateUserQuizScore,
    totalScore
}