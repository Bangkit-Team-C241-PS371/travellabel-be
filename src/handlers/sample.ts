import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export const sampleHandler = async (req: Request, res: Response)=> {
  res.send("Hello World from Sample Routes!");
};

export const pingHandler = async (req: Request, res: Response) => {
  res.send({
    status: "OK",
    message: await db.user.findMany(),
  });
};
