import { Request, Response } from "express";
import axios, { AxiosError } from "axios";
import { sendErrorResponse } from "~/errors/responseError";
import { StatusCodes } from "http-status-codes";

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

    const predictions = predResponse.data.predictions;

    res.send({
      status: "OK",
      message: "Predictions inferred successfully",
      predictions,
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
