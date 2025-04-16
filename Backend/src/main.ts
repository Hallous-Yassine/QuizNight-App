import { displaySignature } from "./cmd/signature";
import { appDataSource } from "./config";
import express from "express";
import http from "http";
import cors from "cors";
import { userRouter , healthRouter } from "./routes"; 
import color from "cli-color"; 

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/health", healthRouter);
app.use("/user", userRouter); 


async function startServer() {
  try {
    await appDataSource.initialize();
    console.log("Database connection established successfully.");

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(color.red(displaySignature));
    });
  } catch (error) {
    console.error("Failed to initialize DataSource:", error);
    process.exit(1); 
  }
}

startServer();