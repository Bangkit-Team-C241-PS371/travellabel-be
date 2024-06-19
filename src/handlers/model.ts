import { Request, Response } from "express";
import axios, { AxiosError } from "axios";
import { sendErrorResponse } from "~/errors/responseError";
import { StatusCodes } from "http-status-codes";
import { db } from "~/utils/db";

const PREDICTIONS_ENDPOINT = process.env.RECSYS_COLLAB_ENDPOINT!;

export const getRecommendationHandler = async (req: Request, res: Response) => {
  const { placeName } = req.body;

  if (!placeName) {
    return sendErrorResponse(res, StatusCodes.BAD_REQUEST, "placeName missing from request");
  }

  try {
    const predResponse = await axios.post(
      PREDICTIONS_ENDPOINT,
      {
        place_name: placeName,
      },
      {
        headers: {
          Authorization: `Bearer ${req.token}`,
        },
      }
    );

    const predictions: string[] = predResponse.data.predictions;
    // correlate predictions (label string) to the corresponding location data in db
    const predictionLocations = await db.location.findMany({
      where: {
        label: {
          in: predictions
        }
      },
    });

    // sort locations data according to the initial predictions data that has been sorted by score from the model
    predictionLocations.sort((a, b) => {
      const indexA = predictions.indexOf(a.label);
      const indexB = predictions.indexOf(b.label);
      return indexA - indexB;
    });

    res.send({
      status: "OK",
      message: "Predictions inferred successfully",
      recommendations: predictionLocations,
    });
  } catch (error: any) {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError;

      const axiosStatusCode = axiosError.response?.status ?? 500;

      res.status(500).json({
        status: "Internal Server Error",
        error: `While fetching prediction, prediction server gave ${axiosStatusCode} error`,
      });
    } else {
      res.status(500).json({
        status: "Internal Server Error",
        error: `Failed to fetch predictions`,
      });
    }
  }
};
