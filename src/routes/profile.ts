import { Router } from "express";
import {
  getUserProfileHandler,
  updateUserProfileHandler
} from "~/handlers/profile";

const profileRouter = Router();

profileRouter.get("/:username", getUserProfileHandler);
profileRouter.put("/:username", updateUserProfileHandler);

export default profileRouter;
