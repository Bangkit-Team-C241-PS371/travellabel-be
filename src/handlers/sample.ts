import { Request, Response } from "express";
import { db } from "~/utils/db";

export const sampleHandler = async (req: Request, res: Response) => {
  res.send({
    status: "OK",
    message: "Hello world!",
  });
};

export const sampleWithNameHandler = async (req: Request, res: Response) => {
  res.send({
    status: "OK",
    message: `Hello, ${req.params.name}`,
  });
}

export const pingHandler = async (req: Request, res: Response) => {
  res.send({
    status: "OK",
    message: await db.user.findMany(),
  });
};
