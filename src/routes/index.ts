import { Router } from "express"
import { authMiddleware } from "~/middleware/authMiddleware";
import sampleRouter from "./sample"
import authRouter from "./auth"
import locationRouter from "./location";

const APIRouter = Router()

APIRouter.use("/sample", sampleRouter)
APIRouter.use("/auth", authRouter)
APIRouter.use("/location", authMiddleware, locationRouter)

const mainRouter = Router()

mainRouter.use("/api/v1", APIRouter)

export default mainRouter
