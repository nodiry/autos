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

import { createServer } from "http";
import { Server } from "socket.io";
import { addUser, findUser, removeUser } from "./middleware/cache";
import { Message } from "./model/message";

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const chatNamespace = io.of("/chat");

chatNamespace.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  if (!userId) {
    socket.disconnect();
    return;
  }

  addUser(userId, socket.id);

  console.log(`User ${userId} connected via socket ${socket.id}`);

  socket.on("send", async (data) => {
    const { carId, sender, receiver, content } = data;

    // Save to DB
    const msg = await Message.create({ car: carId, sender, receiver, content });

    // Try to emit to the receiver
    try {
      const receiverSocketId = await findUser(receiver);
      if (receiverSocketId) {
        chatNamespace.to(receiverSocketId).emit("receive", msg);
      }
    } catch (err) {
      console.error("Error delivering message:", err);
    }
  });

  socket.on("disconnect", async () => {
    console.log(`User ${userId} disconnected`);
    await removeUser(userId);
  });
});

server.listen(port, () => logger.info(`Server is running on ${port}`));
