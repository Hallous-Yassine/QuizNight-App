import express from "express"

import { healthy } from "../handlers/health"
const healthRouter = express.Router()

healthRouter.get("/", healthy)

export default healthRouter