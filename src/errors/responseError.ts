import { Response } from "express"
import { getReasonPhrase } from "http-status-codes"

export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string
) => {
  return res
    .status(statusCode)
    .json({ status: getReasonPhrase(statusCode), message })
}
