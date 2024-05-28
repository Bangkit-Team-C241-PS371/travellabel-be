import { Router } from "express";
import { pingHandler, sampleHandler } from "~/handlers/sample";

// New Router instance
const sampleRouter = Router();

// Home routes
sampleRouter.get("/", sampleHandler);
sampleRouter.get("/ping", pingHandler);

export default sampleRouter;
