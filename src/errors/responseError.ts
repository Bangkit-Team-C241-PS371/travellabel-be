import { Response } from "express"

export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string
) => {
  return res.status(statusCode).json({ status: "ERROR", message })
}
