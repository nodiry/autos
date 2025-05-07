// utils/responder.ts
import type { Response } from "express";
import logger from "../middleware/logger";
import { HttpStatus } from "./status";

export const serverError = (res: Response, context = "", error?: any) => {
  if (error) logger.error(`${context}:`, error);
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
};

export const success = (res: Response, data: any = {}, code: number = HttpStatus.OK) => {
  res.status(code).json(data);
};

export const badRequest = (res: Response, msg: string = "Bad request") => {
  res.status(HttpStatus.BAD_REQUEST).json({ error: msg });
};
