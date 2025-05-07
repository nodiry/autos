import "bun";
import express from "express";
import type { AuthRequest } from "../type";
import { check } from "../middleware/auth";
import { serverError, success } from "../utils/responder";

const router = express.Router();

router.post("/", check, async (req: AuthRequest, res) => {
  try {
    const { text } = req.body;
    success(res, { answer: "here is your question: " + text });
  } catch (error) {
    serverError(res, "error while making call to ai api");
  }
});

export default router;
