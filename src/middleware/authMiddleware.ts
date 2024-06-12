import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string
        email: string
        username: string
      }
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(403).json({
      message: "Access token is required",
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!)
    if (isUserPayload(decoded)) {
      req.user = decoded
      next()
    } else {
      return res.status(403).json({
        message: "Invalid access token",
      })
    }
  } catch (error) {
    return res.status(403).json({
      message: "Invalid access token",
    })
  }
}

// Type guard to check if the decoded token is of the expected type
const isUserPayload = (
  decoded: any
): decoded is { id: string; email: string; username: string } => {
  return (
    typeof decoded === "object" &&
    decoded !== null &&
    "id" in decoded &&
    "email" in decoded &&
    "username" in decoded
  )
}
