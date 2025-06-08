// src/routes/upload.ts
import express, { Request, Response , Router} from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadRouter = Router();

// Ensure the destination folder exists
const uploadDir = path.join(__dirname, '../../../Frontend/assets/');
fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// Upload endpoint
uploadRouter.post('/', upload.single('image'), (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
  
    const relativePath = `../assets/${req.file.filename}`;
    res.status(200).json({ url: relativePath });
  });

export default uploadRouter;
