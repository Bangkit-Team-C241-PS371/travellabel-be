import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { sendErrorResponse } from "~/errors/responseError";
import { db } from "~/utils/db";

export const createLocationHandler = async (req: Request, res: Response) => {
  const { label, description, lat, lon } = req.body;

  if (!label || !description || !lat || !lon) {
    return sendErrorResponse(res, 400, "Bad request data");
  }

  const decimalLon = new Prisma.Decimal(lon);
  const decimalLat = new Prisma.Decimal(lat);

  // validate geographical constraints
  // lon is -180 <= x <= 180
  if (decimalLon.lt(-180) || decimalLon.gt(180)) {
    return sendErrorResponse(res, 400, "Bad request data: invalid longitude value");
  }

  // lat is -90 <= x <= 90
  if (decimalLat.lt(-90) || decimalLat.gt(90)) {
    return sendErrorResponse(res, 400, "Bad request data: invalid latitude value");
  }

  try {
    const createdLocation = await db.location.create({
      data: {
        label,
        description,
        lat: decimalLat,
        lon: decimalLon,
      },
    });

    res.status(201).send({
      status: "OK",
      message: "Label created successfully",
      location: createdLocation,
    });
  } catch (e) {
    return sendErrorResponse(res, 500, "Error while creating location");
  }
};

export const getLocationHandler = async (req: Request, res: Response) => {
  const { searchQuery, minLat, minLon, maxLat, maxLon } = req.body;

  // validate min-max constraints if both min and max are specified
  if (minLon && maxLon && minLon > maxLon) {
    return sendErrorResponse(
      res,
      400,
      "maxLon must be greater than or equal to minLon"
    );
  }

  if (minLat && maxLat && minLat > maxLat) {
    return sendErrorResponse(
      res,
      400,
      "maxLat must be greater than or equal to minLat"
    );
  }

  // create own custom queryFilter type with all the possible combinations
  const queryFilter: {
    label?: {
      contains: string;
      mode: Prisma.QueryMode;
    };
    lat?: {
      gte: number | undefined;
      lte: number | undefined;
    };
    lon?: {
      gte: number | undefined;
      lte: number | undefined;
    };
  } = {}; // initially empty: fetch all

  // add label filter (case insensitive)
  if (searchQuery) {
    queryFilter["label"] = { contains: searchQuery, mode: "insensitive" };
  }

  // add lat filter
  if (minLat || maxLat) {
    queryFilter["lat"] = {
      gte: minLat,
      lte: maxLat,
    };
  }

  // add lon filter
  if (minLon || maxLon) {
    queryFilter["lon"] = {
      gte: minLon,
      lte: maxLon,
    };
  }

  try {
    const locations = await db.location.findMany({
      where: queryFilter,
    });

    res.status(200).send({
      status: "OK",
      message: "Locations retrieved successfully",
      locations,
    });
  } catch (e) {
    return sendErrorResponse(res, 500, "Error while querying location");
  }
};

export const getDiscussionPerLocationHandler = async (
  req: Request,
  res: Response
) => {
  const { locationId } = req.params;

  const location = await db.location.findUnique({
    where: {
      id: locationId,
    },
  });

  if (!location) {
    return sendErrorResponse(
      res,
      404,
      `location with ID ${locationId} not found`
    );
  }

  const discussions = await db.discussion.findMany({
    where: {
      locationId,
    },
  });

  return res.send({
    status: "OK",
    message: "Discussions fetched successfully",
    discussions,
  });
};
