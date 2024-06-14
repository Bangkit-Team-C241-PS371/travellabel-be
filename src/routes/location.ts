import { Router } from "express";
import {
    createLocationHandler,
    getDiscussionPerLocationHandler,
    getLocationHandler
} from "~/handlers/location";

const locationRouter = Router();

locationRouter.post("/", createLocationHandler);
locationRouter.get("/", getLocationHandler);

locationRouter.get("/:locationId/discussion", getDiscussionPerLocationHandler);

export default locationRouter;
