import User from '../models/user';
import { appDataSource } from "../config";

const userRepository = appDataSource.getRepository(User);

const getAllUsers = async () => {
  try {
    const users = await userRepository.find();
    return users;
  } catch (error) {
    throw new Error('Error : Cannot get all users');
  }
}

const getUserById = async (id: number) => {
  try {
    const user = await userRepository.findOneBy({ id });
    return user;
  } catch (error) {
    throw new Error('Error : Cannot get user by id');
  }
}

const createUser = async (userData: Partial<User>) => {
  try {
    const user = userRepository.create(userData);
    await userRepository.save(user);
    return user;
  } catch (error) {
    throw new Error('Error : Cannot create user');
  }
}

const updateUser = async (id: number, userData: Partial<User>) => {
  try {
    const user = await userRepository.findOneBy({ id });
    if (!user) {
      throw new Error('User not found');
    }
    Object.assign(user, userData);
    await userRepository.save(user);
    return user;
  } catch (error) {
    throw new Error('Error : Cannot update user');
  }
}

const deleteUser = async (id: number) => {
  try {
    const user = await userRepository.findOneBy({ id });
    if (!user) {
      throw new Error('User not found');
    }
    await userRepository.remove(user);
  } catch (error) {
    throw new Error('Error : Cannot delete user');
  }
}

const findOneBy = async (field: string, value: string) => {
  try {
    const user = await userRepository.findOne({ where: {[field]: value}  });
    return user;
  } catch (error) {
    throw new Error('Error : Cannot find user by field');
  }
}

const getUserScore = async (id: number) => {
  try {
    const user = await userRepository.findOneBy({ id });
    if (!user) {
      throw new Error('User not found');
    }
    return user.score;
  } catch (error) {
    throw new Error('Error : Cannot get user score');
  }
}

const updateUserScore = async (id: number, score: number) => {
  try {
    const user = await userRepository.findOneBy({ id });
    if (!user) {
      throw new Error('User not found');
    }
    user.score = score;
    await userRepository.save(user);
    return user;
  } catch (error) {
    throw new Error('Error : Cannot update user score');
  }
}


export {
  getAllUsers, getUserById, createUser, updateUser, deleteUser, findOneBy , getUserScore, updateUserScore
};



