import express from "express";
import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import router from "./src/route/index";
import { AppDataSource } from "./src/config/ormConfig";
import { globalErrorHandler } from "./src/utilis";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import AppError from "./src/utilis/customError";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// User sessions tracking (socket id -> user id)
let userSessions: { [userId: string]: string[] } = {};

// Setup Socket.IO events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (userId: number) => {
    socket.join(userId.toString());
    console.log(`User ${userId} joined room ${userId}`);

    if (!userSessions[userId]) {
      userSessions[userId] = [];
    }
    userSessions[userId].push(socket.id);
  });

  socket.on("sendMessage", (data) => {
    console.log("Received message:", data);
    io.to(data.userId.toString()).emit("receiveMessage", data);
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Clean up sessions (remove this socket.id from userSessions)
    for (const userId in userSessions) {
      const sessionIndex = userSessions[userId].indexOf(socket.id);
      if (sessionIndex !== -1) {
        userSessions[userId].splice(sessionIndex, 1); // Remove socket id from the list
        console.log(
          `Socket id ${socket.id} removed from user ${userId}'s sessions`
        );
        break;
      }
    }
  });
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Logging middleware in development
}

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err: any) => {
    console.error("Database connection error:", err);
  });

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Router
app.use("/api", router);

// 404 Route handler
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find route ${req.originalUrl} on this server`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

const PORT = process.env.PORT || 9001;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
