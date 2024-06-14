import { Request, Response } from "express";
import { sendErrorResponse } from "~/errors/responseError";
import { db } from "~/utils/db";

export const createBookmarkHandler = async (req: Request, res: Response) => {
  const { locationId } = req.body;
  const { id: userId } = req.user;

  if (!locationId) {
    return sendErrorResponse(res, 400, "Missing locationId");
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
    const initialUser = await db.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        bookmarkedLocations: true,
      },
    });

    const isLocationBookmarked = initialUser.bookmarkedLocations.some(
      (bookmark) => bookmark.id === locationId
    );

    if (!isLocationBookmarked) {
      await db.user.update({
        where: {
          id: userId,
        },
        data: {
          bookmarkedLocations: {
            connect: {
              id: locationId,
            },
          },
        },
        include: {
          bookmarkedLocations: true,
        },
      });
    }

    return res.status(201).send({
      status: "OK",
      message: "Location bookmarked successfully",
      location,
    });
  } catch (e) {
    return sendErrorResponse(res, 500, "Error while bookmarking location");
  }
};

export const getBookmarkedLocationsHandler = async (
  req: Request,
  res: Response
) => {
  const { id: userId } = req.user;

  const bookmarkedLocations = await db.user
    .findUniqueOrThrow({
      where: {
        id: userId,
      },
    })
    .bookmarkedLocations();

  return res.status(200).send({
    status: "OK",
    message: "Bookmarks fetched successfully",
    bookmarkedLocations,
  });
};

export const removeBookmarkHandler = async (req: Request, res: Response) => {
  const { locationId } = req.body;
  const { id: userId } = req.user;

  if (!locationId) {
    return sendErrorResponse(res, 400, "Missing locationId");
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

  const initialUser = await db.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      bookmarkedLocations: true,
    },
  });

  const isLocationBookmarked = initialUser.bookmarkedLocations.some(
    (bookmark) => bookmark.id === locationId
  );

  if (!isLocationBookmarked) {
    return sendErrorResponse(
      res,
      400,
      "Location has not been bookmarked by the user"
    );
  }

  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      bookmarkedLocations: {
        disconnect: {
          id: locationId,
        },
      },
    },
    include: {
      bookmarkedLocations: true,
    },
  });

  return res.status(201).send({
    status: "OK",
    message: "Location removed from bookmark successfully",
    location,
  });
};
