import express from "express"

import { healthy , checkusertoken } from "../handlers/health"
import auth from "../middleware/auth"
const healthRouter = express.Router()

healthRouter.get("/", healthy)
healthRouter.get("/checkusertoken", auth , checkusertoken)

export default healthRouter