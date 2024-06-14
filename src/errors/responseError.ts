import { Response } from "express"
import { StatusCodes, getReasonPhrase } from "http-status-codes"

export const sendErrorResponse = (
  res: Response,
  statusCode: StatusCodes,
  message: string
) => {
  return res
    .status(statusCode)
    .json({ status: getReasonPhrase(statusCode), message })
}
