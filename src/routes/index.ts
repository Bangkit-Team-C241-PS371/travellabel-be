import { Router } from "express"
import sampleRouter from "./sample"
import authRouter from "./auth"

// Create a new Router instance
const router = Router()

// Mount the routers
router.use("/sample", sampleRouter)
router.use("/api/v1", authRouter)

export default router
