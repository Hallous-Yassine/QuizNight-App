import { DataSource } from "typeorm";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const appDataSource = new DataSource({
  type: "postgres",
  host: process.env.HOST || "localhost",
  port: Number(process.env.DBPORT) || 5432,
  username: process.env.DBUSER || "postgres",
  password: process.env.PASS || "yassine",
  database: process.env.DATABASE || "QuizNight",
  entities: [__dirname + "/../models/*.ts"], 
  synchronize: true,
  ssl: process.env.SSL === "true" ? { rejectUnauthorized: false } : false,
});

export default appDataSource;
