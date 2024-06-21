import { db } from "~/utils/db";
import { Response } from "express";
import { sendErrorResponse } from "~/errors/responseError";
import { Location, Prisma } from "@prisma/client";

export const findLocationById = async (locationId: string, res: Response) => {
  const location = await db.location.findUnique({ where: { id: locationId } });
  if (!location) {
    sendErrorResponse(res, 404, `Location with ID ${locationId} not found`);
    return null;
  }
  return location;
};

export const findReviewById = async (reviewId: string, res: Response) => {
  const review = await db.review.findUnique({
    where: { id: reviewId },
    include: { location: true },
  });
  if (!review) {
    sendErrorResponse(res, 404, `Review with ID ${reviewId} not found`);
    return null;
  }
  return review;
};

export const updateRatingRatersLocation = async (
  location: Location,
  rating: Prisma.Decimal
) => {
  const { rating: oldAverage, raters: count } = location;

  const totalRating = oldAverage.mul(new Prisma.Decimal(count)).add(rating);
  const newAverage = totalRating.div(
    new Prisma.Decimal(rating < new Prisma.Decimal(0.0) ? count - 1 : count + 1)
  );

  return await db.location.update({
    where: {
      id: location.id,
    },
    data: {
      raters: rating < new Prisma.Decimal(0.0) ? count - 1 : count + 1,
      rating: newAverage,
    },
  });
};

export const checkReviewInteraction = async (
  userId: string,
  reviewId: string
) => {
  return await db.reviewInteraction.findFirst({
    where: { userId, reviewId },
  });
};

export const getReviewWithInteractionCounts = async (reviewId: string) => {
  // Fetch the review along with its interactions
  const review = await db.review.findUnique({
    where: {
      id: reviewId,
    },
    include: {
      interactions: true,
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  // Aggregate counts for LIKE and DISLIKE interactions
  const [likeCount, dislikeCount] = await Promise.all([
    db.reviewInteraction.count({
      where: {
        reviewId: reviewId,
        type: "LIKE",
      },
    }),
    db.reviewInteraction.count({
      where: {
        reviewId: reviewId,
        type: "DISLIKE",
      },
    }),
  ]);

  return {
    ...review,
    totalLike: likeCount,
    totalDislike: dislikeCount,
  };
};
