import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendErrorResponse } from "~/errors/responseError";
import { db } from "~/utils/db";

export const getUserProfileHandler = async (req: Request, res: Response) => {
  const { username: queryUsername } = req.params;

  try {
    const queriedUser = await db.user.findUnique({
      where: {
        username: queryUsername,
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    if (!queriedUser) {
      return sendErrorResponse(
        res,
        StatusCodes.NOT_FOUND,
        `User with username ${queryUsername} not found`
      );
    }

    return res.send({
      status: "OK",
      message: "User profile fetched successfully",
      user: queriedUser,
    });
  } catch (e) {
    return sendErrorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error while querying user profile"
    );
  }
};

export const updateUserProfileHandler = async (req: Request, res: Response) => {
  const { username: queryUsername } = req.params;
  const { id: authenticatedUserId } = req.user
  const { email: newEmail, username: newUsername } = req.body;

  try {
    const userToUpdate = await db.user.findUnique({
      where: {
        username: queryUsername,
      },
      select: {
        id: true,
        email: true,
        username: true,
      }
    });

    if (!userToUpdate) {
      return sendErrorResponse(
        res,
        StatusCodes.NOT_FOUND,
        `User with username ${queryUsername} not found`
      );
    }

    if (authenticatedUserId !== userToUpdate.id) {
      return sendErrorResponse(
        res,
        StatusCodes.FORBIDDEN,
        "Forbidden"
      );
    }

    if (newUsername || newEmail) {
      const dupUsername = newUsername
        ? await db.user.findUnique({
            where: {
              username: newUsername,
            },
          })
        : null;

      const dupEmail = newEmail
        ? await db.user.findUnique({
            where: {
              email: newEmail,
            },
          })
        : null;

      if (dupUsername) {
        return sendErrorResponse(
          res,
          StatusCodes.CONFLICT,
          `Another user with username ${newUsername} has already been registered`
        );
      }

      if (dupEmail) {
        return sendErrorResponse(
          res,
          StatusCodes.CONFLICT,
          `Another user with email ${newEmail} has already been registered`
        );
      }

      const updateData = {
        ...(newUsername && { username: newUsername }),
        ...(newEmail && { email: newEmail }),
      };

      const updateUserTrx = await db.user.update({
        where: {
          id: userToUpdate.id,
        },
        data: updateData,
        select: {
          id: true,
          email: true,
          username: true,
        },
      });

      return res.send({
        status: "OK",
        message: "User profile updated successfully",
        user: updateUserTrx,
      });

    } else {
      return res.send({
        status: "OK",
        message: "User profile not updated",
        user: userToUpdate,
      });
    }
  } catch (e) {
    return sendErrorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error while querying user profile"
    );
  }
};
