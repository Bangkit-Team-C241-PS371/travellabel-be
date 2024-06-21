import { Request, Response } from "express";
import { sendErrorResponse } from "~/errors/responseError";
import { db } from "~/utils/db";
import { Prisma } from "@prisma/client";
import {
  checkReviewInteraction,
  findLocationById,
  findReviewById,
  getReviewWithInteractionCounts,
  updateRatingRatersLocation,
} from "~/services/review";

export const createReviewHandler = async (req: Request, res: Response) => {
  const { locationId, rating, content } = req.body;
  const { id: userId } = req.user;

  if (!locationId || !rating || !content) {
    return sendErrorResponse(res, 400, "Bad request data: missing fields");
  }

  const location = await findLocationById(locationId, res);
  if (!location) return;

  try {
    // Create a new Review instance
    const review = await db.review.create({
      data: {
        location: { connect: { id: locationId } },
        user: { connect: { id: userId } },
        rating: new Prisma.Decimal(rating),
        content,
      },
      include: { location: true },
    });

    // Update rating and raters data in Location
    const updatedLocation = updateRatingRatersLocation(review.location, rating);
    if (!updatedLocation) {
      return sendErrorResponse(res, 500, "Error while updating Location data");
    }

    return res.status(201).send({
      status: "OK",
      message: "Review created successfully",
      review,
    });
  } catch (e) {
    return sendErrorResponse(res, 500, "Error while creating review");
  }
};

export const updateReviewHandler = async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { rating, content } = req.body;
  const { id: userId } = req.user;

  if (!rating || !content) {
    return sendErrorResponse(res, 400, "Bad request data: missing fields");
  }

  const review = await findReviewById(reviewId!, res);
  if (!review) return;
  if (review.id !== userId) {
    return sendErrorResponse(
      res,
      403,
      "You do not have permission to update this review"
    );
  }

  try {
    // Update review data
    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: { rating: new Prisma.Decimal(rating), content },
      include: {
        location: true,
      },
    });

    // Update rating and raters data in Location
    const updatedLocation = updateRatingRatersLocation(
      updatedReview.location,
      rating
    );
    if (!updatedLocation) {
      return sendErrorResponse(res, 500, "Error while updating Location data");
    }

    return res.status(200).send({
      status: "OK",
      message: "Review updated successfully",
      updatedReview,
    });
  } catch (e) {
    return sendErrorResponse(res, 500, "Error while updating review");
  }
};

export const deleteReviewHandler = async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { id: userId } = req.user;

  const review = await findReviewById(reviewId!, res);
  if (!review) return;
  if (review.userId !== userId) {
    return sendErrorResponse(
      res,
      403,
      "You do not have permission to delete this review"
    );
  }

  try {
    await db.review.delete({ where: { id: reviewId } });

    // Update rating and raters data in Location
    const updatedLocation = updateRatingRatersLocation(
      review.location,
      review.rating.neg()
    );
    if (!updatedLocation) {
      return sendErrorResponse(res, 500, "Error while updating Location data");
    }
    return res.status(200).send({
      status: "OK",
      message: "Review deleted successfully",
    });
  } catch (error) {
    return sendErrorResponse(res, 500, "Error while deleting review");
  }
};

export const getReviewPerLocationHandler = async (
  req: Request,
  res: Response
) => {
  const { locationId } = req.params;

  const location = await findLocationById(locationId!, res);
  if (!location) return;

  try {
    const reviews = await db.review.findMany({
      where: {
        locationId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      }
    });

    const allReviews = await Promise.all(
      reviews.map((review) => getReviewWithInteractionCounts(review.id))
    );

    return res.status(200).send({
      status: "OK",
      message: "Reviews fetched successfully",
      allReviews,
    });
  } catch (e) {
    return sendErrorResponse(res, 500, "Error while querying reviews");
  }
};

export const interactionReviewHandler = async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { isLike, isDislike } = req.body;
  const { id: userId } = req.user;

  if (typeof isLike === "undefined" || typeof isDislike === "undefined") {
    return sendErrorResponse(res, 400, "Bad request data: missing fields");
  }

  // Checking for initial state can't be all true
  if (isLike && isDislike) {
    return sendErrorResponse(
      res,
      400,
      "Bad request data: both fields can't be all true"
    );
  }

  const review = await findReviewById(reviewId!, res);
  if (!review) return;

  // Checking if interaction already exists to prevent duplicate instances
  const interaction = await checkReviewInteraction(userId!, reviewId!);
  if (!interaction) {
    // Checking for initial state can't be all false
    if (!isLike && !isDislike) {
      return sendErrorResponse(
        res,
        400,
        "Bad request data: both fields can't be all false for initial state"
      );
    }

    // Create a new interaction instance
    try {
      const reviewInteraction = await db.reviewInteraction.create({
        data: {
          review: { connect: { id: reviewId } },
          user: { connect: { id: userId } },
          type: isLike ? "LIKE" : "DISLIKE",
        },
      });

      const reviewData = await getReviewWithInteractionCounts(
        reviewInteraction.reviewId
      );
      return res.status(201).send({
        status: "OK",
        message: `${isLike ? "Like" : "Dislike"} added successfully`,
        reviewData,
      });
    } catch (error) {
      return sendErrorResponse(res, 500, "Error while creating interaction");
    }
  }

  // Update interaction that already exists
  if (isLike || isDislike) {
    try {
      const updateInteraction = await db.reviewInteraction.update({
        where: { id: interaction.id },
        data: { type: isLike ? "LIKE" : "DISLIKE" },
      });

      const reviewData = await getReviewWithInteractionCounts(
        updateInteraction.reviewId
      );
      return res.status(200).send({
        status: "OK",
        message: `${isLike ? "Like" : "Dislike"} added successfully`,
        reviewData,
      });
    } catch (error) {
      return sendErrorResponse(res, 500, "Error while updating interaction");
    }
  }

  // Delete interaction that already exists
  try {
    const deleteInteraction = await db.reviewInteraction.delete({
      where: { id: interaction.id },
    });
    const reviewData = await getReviewWithInteractionCounts(
      deleteInteraction.reviewId
    );
    return res.status(200).send({
      status: "OK",
      message: "Interaction removed successfully",
      reviewData,
    });
  } catch (error) {
    return sendErrorResponse(res, 500, "Error while deleting interaction");
  }
};
