import { Router } from "express"
import { authMiddleware } from "~/middleware/authMiddleware";
import sampleRouter from "./sample"
import authRouter from "./auth"
import locationRouter from "./location";
import bookmarkRouter from "./bookmark";
import discussionRouter from "./discussion";

const APIRouter = Router()

APIRouter.use("/sample", sampleRouter)
APIRouter.use("/auth", authRouter)
APIRouter.use("/location", authMiddleware, locationRouter)
APIRouter.use("/bookmark", authMiddleware, bookmarkRouter)
APIRouter.use("/discussion", authMiddleware, discussionRouter)

const mainRouter = Router()

mainRouter.use("/api/v1", APIRouter)

export default mainRouter
