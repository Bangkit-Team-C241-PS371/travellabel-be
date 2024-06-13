import { Router } from "express"
import {
  loginHandler,
  refreshTokenHandler,
  registerHandler,
  resetPasswordHandler,
  resetTokenHandler,
} from "~/handlers/auth"

// New Router instance
const authRouter = Router()

authRouter.post("/register", registerHandler)
authRouter.post("/login", loginHandler)
authRouter.post("/refresh", refreshTokenHandler)
authRouter.post("/reset-token", resetTokenHandler)
authRouter.put("/reset-password", resetPasswordHandler)

export default authRouter
