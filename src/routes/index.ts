import { Router } from "express";
import sampleRouter from "./sample";

// Create a new Router instance
const router = Router();

// Mount the routers
router.use("/sample", sampleRouter);

export default router;
