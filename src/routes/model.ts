import { Router } from "express";
import {
    getRecommendationHandler
} from "~/handlers/model";

const modelRouter = Router()

modelRouter.post("/recommend", getRecommendationHandler);

export default modelRouter
