import { Router } from "express"
import sampleRouter from "./sample"
import authRouter from "./auth"

const APIRouter = Router()

APIRouter.use("/sample", sampleRouter)
APIRouter.use("/auth", authRouter)

const mainRouter = Router()

mainRouter.use("/api/v1", APIRouter)

export default mainRouter
