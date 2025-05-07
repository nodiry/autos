// ./middleware/auth.js
import "bun";
import { type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../type";

const SAUCE = process.env.SAUCE || "chubingo";

// Middleware to check JWT token from Authorization header or cookies
export const check = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // ✅ Try Authorization header first
    let token = req.headers.authorization?.split(" ")[1];

    // ✅ If no token in header, check cookies
    if (!token && req.cookies?.Authorization) {
      token = req.cookies.Authorization.replace("Bearer ", "");
    }

    // 🛑 No token found
    if (!token) {
      res.status(401).json({ error: "Access denied. No token provided." });
      return;
    }

    // ✅ Decode token
    const decoded = jwt.verify(token, SAUCE);

    // 💡 Attach user to request for next middlewares/routes
    req.user = {
      id: decoded.id,
      username: decoded.username,
    };

    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
};
