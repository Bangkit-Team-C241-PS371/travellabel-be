import { Router } from "express";
import {
  createLocationHandler,
  getDiscussionPerLocationHandler,
  getLocationHandler,
} from "~/handlers/location";
import { getReviewPerLocationHandler } from "~/handlers/review";

const locationRouter = Router();

locationRouter.post("/", createLocationHandler);
locationRouter.get("/", getLocationHandler);

locationRouter.get("/:locationId/discussion", getDiscussionPerLocationHandler);
locationRouter.get("/:locationId/review", getReviewPerLocationHandler);

export default locationRouter;
