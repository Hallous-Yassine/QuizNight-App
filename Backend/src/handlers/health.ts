import { RequestHandler } from "express"

interface HealthResponse {
    status: string
    message: string
}

const healthy: RequestHandler = async (req, res) => {
  const response: HealthResponse = {
    status: "Healthy",
    message: "The server is healthy",
  }
  res.status(200).send(response)
}

export { healthy }