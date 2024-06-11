import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { checkEmailorUsername } from "~/utils"

const db = new PrismaClient()

// Register User
export const registerHandler = async (req: Request, res: Response) => {
  const { email, username, password } = req.body

  if (!email || !password) {
    res.status(400).json({
      status: "BAD REQUEST",
      message: "Email and password are required",
    })
  }

  try {
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    })

    if (existingUser) {
      return res.status(409).json({
        status: "VALIDATION ERROR",
        message: "User already registered",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    })
    return res.status(201).json({
      status: "OK",
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    })
  } catch (error) {
    res.status(500).json({
      status: "INTERNAL SERVER ERROR",
      message: "Internal server error",
    })
  }
}

// Login User
export const loginHandler = async (req: Request, res: Response) => {
  const { identifier, password } = req.body

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ message: "Email/username and password are required" })
  }

  const user = await checkEmailorUsername(identifier)

  if (!user) {
    return res.status(404).json({
      status: "NOT_FOUND",
      message: "User not found",
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (isPasswordValid) {
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
    }

    const accessSecret = process.env.JWT_ACCESS_SECRET!
    const refreshSecret = process.env.JWT_REFRESH_SECRET!

    const accessToken = jwt.sign(payload, accessSecret, { expiresIn: "1h" })
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: "7d" })

    return res.status(200).json({
      status: "OK",
      message: "User logged in successfully",
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      accessToken,
      refreshToken,
    })
  } else {
    return res.status(403).json({
      message: "Invalid credentials",
    })
  }
}

// Request for a new Access Token
export const refreshTokenHandler = async (req: Request, res: Response) => {
  const { token } = req.body

  if (!token) {
    return res.status(403).json({
      message: "Refresh token is required",
    })
  }

  jwt.verify(token, process.env.JWT_REFRESH_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        message: "Refresh token verification failed",
      })
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "1h" }
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
    return res.status(400).json({ message: "Email and username are required" })
  }

  const user = await db.user.findUnique({
    where: {
      email: email,
      username: username,
    },
  })

  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }

  const resetToken = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.RESET_PASSWORD_TOKEN_SECRET!,
    { expiresIn: "30m" }
  )

  res.status(200).json({
    status: "OK",
    message: "Reset token generated successfully.",
    resetToken,
  })
}

// Reset Password
export const resetPasswordHandler = async (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" })
  }
  const hashedNewPassword = await bcrypt.hash(newPassword, 10)

  const decodedToken = decodeToken(resetToken)

  if (
    decodedToken &&
    typeof decodedToken === "object" &&
    "email" in decodedToken
  ) {
    const user = await db.user.update({
      where: {
        email: decodedToken.email,
      },
      data: {
        password: hashedNewPassword,
      },
    })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
      status: "OK",
      message: "Password reset successfully.",
    })
  } else {
    return res.status(403).json({
      message: "Reset token verification failed",
    })
  }
}

const decodeToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.RESET_PASSWORD_TOKEN_SECRET!)
  } catch (err) {
    console.error("Token verification failed:", err)
    return null
  }
}
