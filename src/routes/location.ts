import { Router } from "express";
import {
    createLocationHandler,
    getLocationHandler
} from "~/handlers/location";

const locationRouter = Router();

locationRouter.post("/", createLocationHandler);
locationRouter.get("/", getLocationHandler);

export default locationRouter;
