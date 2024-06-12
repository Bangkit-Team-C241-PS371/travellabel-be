import { Router } from "express";
import { pingHandler, sampleHandler, sampleWithNameHandler } from "~/handlers/sample";

// New Router instance
const sampleRouter = Router();

// Home routes
sampleRouter.get("/", sampleHandler);
sampleRouter.get("/ping", pingHandler);
sampleRouter.get("/:name", sampleWithNameHandler);

export default sampleRouter;
