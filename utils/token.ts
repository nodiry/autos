// utils/token.ts
import jwt from "jsonwebtoken";
const SAUCE = process.env.SAUCE || "chubingo";

export const signToken = (payload: object) => jwt.sign(payload, SAUCE, { expiresIn: "7d" });

export const verifyToken = (token: string) => jwt.verify(token, SAUCE);