import { Router } from "express";
import {
    createBookmarkHandler,
    getBookmarkedLocationsHandler,
    removeBookmarkHandler,
} from "~/handlers/bookmark";

const bookmarkRouter = Router();

bookmarkRouter.post("/", createBookmarkHandler);
bookmarkRouter.get("/", getBookmarkedLocationsHandler);
bookmarkRouter.delete("/", removeBookmarkHandler);

export default bookmarkRouter;
