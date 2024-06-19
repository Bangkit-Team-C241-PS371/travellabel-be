import { Router } from "express";
import {
  addLocationImageHandler,
  createLocationHandler,
  getDiscussionPerLocationHandler,
  getLocationHandler,
} from "~/handlers/location";
import { getReviewPerLocationHandler } from "~/handlers/review";
import { uploadMiddleware } from "~/utils/storage";

const locationRouter = Router();

locationRouter.post("/", createLocationHandler);
locationRouter.get("/", getLocationHandler);
locationRouter.post("/:locationId/image", uploadMiddleware.single('file'), addLocationImageHandler);

locationRouter.get("/:locationId/discussion", getDiscussionPerLocationHandler);
locationRouter.get("/:locationId/review", getReviewPerLocationHandler);

export default locationRouter;
