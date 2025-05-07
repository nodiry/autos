import "bun";
import express, { urlencoded } from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import dashboard from "./routes/dash";
import sale from "./routes/sales";
import auth from "./routes/auth";
import org from "./routes/org";
import chat from "./routes/chat";

import config from "./config/config";
import logger from "./middleware/logger";
import path from "path";

const app = express();
const port = process.env.PORT || 3033;
const db = config.db || "";
const allowedOrigins = config.origin;

app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(morgan(config.morgan));

mongoose
  .connect(db)
  .then(() => logger.info("db connected"))
  .catch((err) => logger.error(err.message));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use("/auth", auth);
app.use("/dash", dashboard);
app.use("/sales", sale);
app.use("/chat", chat);
app.use("/org", org);

app.listen(port, () => logger.info(`Server is running on ${port}`));
