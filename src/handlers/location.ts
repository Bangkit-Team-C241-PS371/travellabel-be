import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { sendErrorResponse } from "~/errors/responseError";

const db = new PrismaClient();

export const createLocationHandler = async (req: Request, res: Response) => {
  const { label, description, lat, lon } = req.body;

  if (!label || !description || !lat || !lon) {
    return sendErrorResponse(res, 400, "Bad request data");
  }

  try {
    const createdLocation = await db.location.create({
      data: {
        label,
        description,
        lat: new Prisma.Decimal(lat),
        lon: new Prisma.Decimal(lon),
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
  if ((minLon && maxLon) && minLon > maxLon) {
    return sendErrorResponse(res, 400, "maxLon must be greater than or equal to minLon");
  }

  if ((minLat && maxLat) && minLat > maxLat) {
    return sendErrorResponse(res, 400, "maxLat must be greater than or equal to minLat");
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