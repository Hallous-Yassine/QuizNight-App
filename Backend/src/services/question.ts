import Question from "../models/question";7
import { appDataSource } from "../config";
import { get } from "http";

const questionRepository = appDataSource.getRepository(Question);

const getAllQuestions = async (quizId: number) => {
  try {
    const questions = await questionRepository.find({
      where: { quizId },
      order: { question_number: "ASC"},
    });
    return questions;
  } catch (error) {
    throw new Error("Error: Cannot get all questions");
  }
}

// create question 
const createQuestion = async (questionData: any) => {
  try {
    const question = await questionRepository.create(questionData);
    await questionRepository.save(question);
    return question;
  } catch (error) {
    throw new Error("Error: Cannot create question");
  }
}

export {createQuestion, getAllQuestions};


