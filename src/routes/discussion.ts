import { Router } from "express";
import {
  createDiscussionHandler,
  createDiscussionReplyHandler,
  getDiscussionRepliesHandler,
} from "~/handlers/discussion";

const discussionRouter = Router();

discussionRouter.post("/", createDiscussionHandler);
discussionRouter.post("/:discussionId", createDiscussionReplyHandler);
discussionRouter.get("/:discussionId", getDiscussionRepliesHandler);

export default discussionRouter;
