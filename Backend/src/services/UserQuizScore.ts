import UserQuizScore from "../models/UserQuizScore";
import { appDataSource } from "../config";
import { get } from "http";

const userQuizScoreRepository = appDataSource.getRepository(UserQuizScore);

const getUserQuizScoreByUserIdAndQuizId = async (userId: number, quizId: number) => {
  try {
    const userQuizScore = await userQuizScoreRepository.findOneBy({ userId, quizId });
    return userQuizScore;
  }
  catch (error) {
    throw new Error('Error: Cannot get user quiz score by userId and quizId');
  }
}


const getUserQuizScoreById = async (id: number) => {
    try {
      const score = await userQuizScoreRepository.findOneBy({ id });
      return score;
    } catch (error) {
      throw new Error('Error: Cannot get user quiz score by id');
    }
}

const createUserQuizScore = async (userId: number, quizId: number, bestScore: number) => {
    try {
        const userQuizScore = userQuizScoreRepository.create({ userId, quizId, bestScore });
        await userQuizScoreRepository.save(userQuizScore);
        return userQuizScore;
    } catch (error) {
        throw new Error(`Error: Cannot create user quiz score - ${error}`);
    }
}

const updateUserQuizScore = async (id: number, bestScore: number) => {
    try {
        const userQuizScore = await userQuizScoreRepository.findOneBy({ id });
        if (!userQuizScore) {
            throw new Error('User quiz score not found');
        }
        userQuizScore.bestScore = bestScore;
        await userQuizScoreRepository.save(userQuizScore);
        return userQuizScore;
    } catch (error) {
        throw new Error('Error: Cannot update user quiz score');
    }
}

const totalScore = async (userId: number) => {
    try {
        const scores = await userQuizScoreRepository.findBy({ userId });
        const total = scores.reduce((acc, score) => acc + score.bestScore, 0);
        return total;
    } catch (error) {
        throw new Error('Error: Cannot get total score for user');
    }
}

export {
  getUserQuizScoreByUserIdAndQuizId,
  getUserQuizScoreById,
  createUserQuizScore,
  updateUserQuizScore,
  totalScore,
}