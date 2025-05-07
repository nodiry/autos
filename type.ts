import express from "express";
export interface AuthRequest extends express.Request {
  user?: { id: string; username: string };
}
