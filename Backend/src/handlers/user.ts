import { RequestHandler } from "express";
import * as userService from "../services/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Request body interfaces
interface CreateUserRequest {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface FindOneByHandlerRequest {
  field: string;
  value: string;
}

const SECRET = process.env.SECRET || "default-secret"; // Ensure this is set in .env

const getAllUsers: RequestHandler = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    if (!users || users.length === 0) {
      res.status(404).json({ message: "No users found" });
      return;
    }
    const safeUsers = users.map(({ password, ...user }) => user);
    res.status(200).json(safeUsers);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserById: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }
  try {
    const user = await userService.getUserById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const { password, ...safeUser } = user;
    res.status(200).json(safeUser);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createUser: RequestHandler = async (req, res) => {
  const { full_name, email, phone, password } = req.body as CreateUserRequest;

  try {
    // Validate all fields are present and non-empty
    if (!full_name?.trim() || !email?.trim() || !phone?.trim() || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    // Check for existing user by email
    const existingUserByEmail = await userService.findOneBy('email', email.trim());
    if (existingUserByEmail) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    // Check for existing user by phone
    const existingUserByPhone = await userService.findOneBy('phone', phone.trim());
    if (existingUserByPhone) {
      res.status(400).json({ message: "Phone number already exists" });
      return;
    }

    // Hash the password
    const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the new user
    const newUser = await userService.createUser({
      full_name: full_name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: hashedPassword,
      score : 0, // Default score
      });

    // Remove password from response and generate JWT token
    const { password: _, ...safeUser } = newUser;
    const token = jwt.sign({ id: safeUser.id }, SECRET, { expiresIn: "1h" });

    res.status(201).json({
      message: "User created successfully",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { full_name, email, phone, password } = req.body as UpdateUserRequest;

  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  try {
    const user = await userService.getUserById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    if (email && email.trim() !== user.email) {
      const existingUser = await userService.findOneBy('email', email.trim());
      if (existingUser) {
        res.status(400).json({ message: "Email already in use" });
        return;
      }
    }

    const updates: Partial<CreateUserRequest> = {};
    if (full_name) updates.full_name = full_name.trim();
    if (email) updates.email = email.trim();
    if (phone) updates.phone = phone.trim();
    if (password) updates.password = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS || "10", 10));

    const updatedUser = await userService.updateUser(id, updates);
    const { password: _, ...safeUser } = updatedUser;

    res.status(200).json({
      message: "User updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  try {
    const user = await userService.getUserById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    await userService.deleteUser(id);
    // Token is "destroyed" by client-side action (discard token) or expiration
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser: RequestHandler = async (req, res) => {
  const { email, password } = req.body as LoginRequest;

  try {
    if (!email?.trim() || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await userService.findOneBy('email', email.trim());
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const { password: _, ...safeUser } = user;
    const token = jwt.sign({ id: safeUser.id }, SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper function, simplified
const findOneBy = async (field: 'email' | 'phone' | 'full_name', value: string) => {
  try {
    const user = await userService.findOneBy(field, value.trim());
    return user || null; // Return null if no user found
  } catch (error) {
    console.error('Find one by error:', error);
    throw error instanceof Error ? error : new Error("Unknown error occurred");
  }
};

// Handler accepting raw JSON in body
const findOneByHandler: RequestHandler = async (req, res) => {
  const { field, value } = req.body as FindOneByHandlerRequest;

  // Validate input
  if (!field || !value) {
    res.status(400).json({ message: "Field and value are required" });
    return;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    res.status(400).json({ message: "Value cannot be empty" });
    return;
  }

  const validFields = ['email', 'phone', 'full_name'] as const;
  if (!validFields.includes(field as any)) {
    res.status(400).json({ message: "Invalid field parameter" });
    return;
  }

  try {
    const user = await findOneBy(field as typeof validFields[number], trimmedValue);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { password: _, ...safeUser } = user;
    res.status(200).json({
      message: "User found",
      user: safeUser,
    });
  } catch (error) {
    console.error('Find user error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// New logout handler
const logoutUser: RequestHandler = async (req, res) => {
  // Since JWT is stateless, logout is typically handled client-side by discarding the token
  res.status(200).json({ message: "Logout successful" });
};

const getUserScore: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  try {
    const score = await userService.getUserScore(id);
    if (score === null) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ score });
  } catch (error) {
    console.error('Get user score error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const updateUserScore: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { score } = req.body as { score: number };

  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  try {
    const updatedUser = await userService.updateUserScore(id, score);
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({
      message: "User score updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user score error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { getAllUsers, getUserById, createUser, updateUser, deleteUser, loginUser, findOneBy, findOneByHandler, logoutUser , getUserScore, updateUserScore };

