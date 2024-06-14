import { Request, Response } from "express";
import { sendErrorResponse } from "~/errors/responseError";
import { db } from "~/utils/db";

export const createDiscussionHandler = async (req: Request, res: Response) => {
  const { locationId, title, content } = req.body;
  const { id: creatorId } = req.user;

  if (!locationId || !title || !content) {
    return sendErrorResponse(res, 400, "Bad request data: missing fields");
  }

  const location = await db.location.findUnique({
    where: {
      id: locationId,
    },
  });

  if (!location) {
    return sendErrorResponse(
      res,
      404,
      `Location with ID ${locationId} not found`
    );
  }

  try {
    const discussion = await db.discussion.create({
      data: {
        location: {
          connect: {
            id: locationId,
          },
        },
        creator: {
          connect: {
            id: creatorId,
          },
        },
        title,
        content,
      },
    });

    return res.status(201).send({
      status: "OK",
      message: "Discussion created successfully",
      discussion,
    });
  } catch (e) {
    return sendErrorResponse(res, 500, "Error while creating discussion");
  }
};

export const createDiscussionReplyHandler = async (
  req: Request,
  res: Response
) => {
  const { discussionId } = req.params;
  const { content } = req.body;
  const { id: creatorId } = req.user;

  if (!content) {
    return sendErrorResponse(res, 400, "Bad request: missing content");
  }

  const discussion = await db.discussion.findUnique({
    where: {
      id: discussionId,
    },
  });

  if (!discussion) {
    return sendErrorResponse(
      res,
      404,
      `Discussion with ID ${discussionId} not found`
    );
  }

  try {
    const reply = await db.discussionReply.create({
      data: {
        creator: {
          connect: {
            id: creatorId,
          },
        },
        discussion: {
          connect: {
            id: discussionId,
          },
        },
        content,
      },
    });

    return res.status(201).send({
      status: "OK",
      message: "Reply created successfully",
      reply,
    });
  } catch (e) {
    return sendErrorResponse(res, 500, "Error while creating discussion reply");
  }
};

export const getDiscussionRepliesHandler = async (
  req: Request,
  res: Response
) => {
  const { discussionId } = req.params;

  const discussion = await db.discussion.findUnique({
    where: {
      id: discussionId,
    },
  });

  if (!discussion) {
    return sendErrorResponse(
      res,
      404,
      `Discussion with ID ${discussionId} not found`
    );
  }

  const replies = await db.discussionReply.findMany({
    where: {
      discussionId,
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  return res.send({
    status: "OK",
    message: "Replies fetched successfully",
    replies,
  });
};
