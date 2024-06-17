import { Router } from "express";
import {
  createReviewHandler,
  deleteReviewHandler,
  interactionReviewHandler,
  updateReviewHandler,
} from "~/handlers/review";

const reviewRouter = Router();

reviewRouter.post("/", createReviewHandler);
reviewRouter.put("/:reviewId", updateReviewHandler);
reviewRouter.delete("/:reviewId", deleteReviewHandler);
reviewRouter.post("/:reviewId/interact", interactionReviewHandler);

export default reviewRouter;
