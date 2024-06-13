import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import {
  checkEmailorUsername,
  createJwtToken,
  hashPassword,
  verifyPassword,
} from "~/utils"
import { sendErrorResponse } from "~/errors/responseError"

const db = new PrismaClient()

// Register User
export const registerHandler = async (req: Request, res: Response) => {
  const { email, username, password } = req.body

  if (!email || !password) {
    return sendErrorResponse(res, 400, "Email and password are required")
  }

  try {
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return sendErrorResponse(res, 409, "User already registered")
    }

    const hashedPassword = await hashPassword(password)
    const user = await db.user.create({
      data: { email, username, password: hashedPassword },
    })

    return res.status(201).json({
      status: "OK",
      message: "User registered successfully",
      user: { id: user.id, email: user.email, username: user.username },
    })
  } catch (error) {
    return sendErrorResponse(res, 500, "Internal server error")
  }
}

// Login User
export const loginHandler = async (req: Request, res: Response) => {
  const { identifier, password } = req.body

  if (!identifier || !password) {
    return sendErrorResponse(
      res,
      400,
      "Email/username and password are required"
    )
  }

  try {
    const user = await checkEmailorUsername(identifier)

    if (!user) {
      return sendErrorResponse(res, 403, "Invalid credentials")
    }

    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return sendErrorResponse(res, 403, "Invalid credentials")
    }

    const payload = { id: user.id, email: user.email, username: user.username }
    const accessToken = createJwtToken(
      payload,
      process.env.JWT_ACCESS_SECRET!,
      "1h"
    )
    const refreshToken = createJwtToken(
      payload,
      process.env.JWT_REFRESH_SECRET!,
      "7d"
    )

    return res.status(200).json({
      status: "OK",
      message: "User logged in successfully",
      data: { id: user.id, email: user.email, username: user.username },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    return sendErrorResponse(res, 500, "Internal server error")
  }
}

// Request for a new Access Token
export const refreshTokenHandler = async (req: Request, res: Response) => {
  const { token } = req.body

  if (!token) {
    return sendErrorResponse(res, 403, "Refresh token is required")
  }

  jwt.verify(token, process.env.JWT_REFRESH_SECRET!, (err: any, user: any) => {
    if (err) {
      return sendErrorResponse(res, 403, "Refresh token verification failed")
    }

    const accessToken = createJwtToken(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_ACCESS_SECRET!,
      "1h"
    )

    return res.status(200).json({
      status: "OK",
      message: "New access token created successfully.",
      accessToken,
    })
  })
}

// Request a reset token for resetting password
export const resetTokenHandler = async (req: Request, res: Response) => {
  const { email, username } = req.body

  if (!email || !username) {
    return sendErrorResponse(res, 400, "Email and username are required")
  }

  try {
    const user = await db.user.findUnique({
      where: { email, username },
    })

    if (!user) {
      return sendErrorResponse(res, 404, "User not found")
    }

    const resetToken = createJwtToken(
      { id: user.id, email: user.email, username: user.username },
      process.env.RESET_PASSWORD_TOKEN_SECRET!,
      "30m"
    )

    return res.status(200).json({
      status: "OK",
      message: "Reset token generated successfully.",
      resetToken,
    })
  } catch (error) {
    return sendErrorResponse(res, 500, "Internal server error")
  }
}

// Reset Password
export const resetPasswordHandler = async (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body

  if (!newPassword) {
    return sendErrorResponse(res, 400, "New password is required")
  } else if (!resetToken) {
    return sendErrorResponse(res, 400, "Reset token is required")
  }

  try {
    const decodedToken = jwt.verify(
      resetToken,
      process.env.RESET_PASSWORD_TOKEN_SECRET!
    ) as jwt.JwtPayload

    if (
      !decodedToken ||
      typeof decodedToken !== "object" ||
      !decodedToken.email
    ) {
      return sendErrorResponse(res, 403, "Reset token verification failed")
    }

    const hashedNewPassword = await hashPassword(newPassword)

    const user = await db.user.update({
      where: { email: decodedToken.email },
      data: { password: hashedNewPassword },
    })

    if (!user) {
      return sendErrorResponse(res, 404, "User not found")
    }

    return res.status(200).json({
      status: "OK",
      message: "Password reset successfully.",
    })
  } catch (error) {
    return sendErrorResponse(res, 500, "Internal server error")
  }
}
