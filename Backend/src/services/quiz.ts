import quiz from '../models/quiz';
import { appDataSource } from "../config";

const quizRepository = appDataSource.getRepository(quiz);

const getAllQuizzes = async () => {
  try {
    const quizzes = await quizRepository.find();
    return quizzes;
  } catch (error) {
    throw new Error('Error : Cannot get all quizzes');
  }
}

const getQuizById = async (id: number) => {
  try { 
    const quizData = await quizRepository.findOneBy({ id });
    if (!quizData) {
      throw new Error('Error : Quiz not found');
    }
    return quizData;
  }
  catch (error) {
    throw new Error('Error : Cannot get quiz by id');
  }
}

// Create a new quiz and return the created quiz 
const createQuiz = async (quizData: Partial<quiz>) => {
  try {
    const newQuiz = quizRepository.create(quizData);
    await quizRepository.save(newQuiz);
    return newQuiz;
  } catch (error) {
    throw new Error('Error : Cannot create quiz');
  }
}

const getQuizByUserId = async (userId: number) => {
  try {
    const quizzes = await quizRepository.find({ where: { createdById: userId } });
    return quizzes;
  } catch (error) {
    throw new Error('Error : Cannot get quizzes by user id');
  }
}


export { 
  getAllQuizzes,
  getQuizById,
  createQuiz,
  getQuizByUserId
}


