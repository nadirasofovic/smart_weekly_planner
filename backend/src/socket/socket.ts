import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function setupSocketIO(io: Server) {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return next(new Error("JWT_SECRET not configured"));
      }

      const decoded = jwt.verify(token, secret) as { userId: string };
      socket.userId = decoded.userId;

      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;

    // Join user's room
    socket.join(`user:${userId}`);

    console.log(`User ${userId} connected`);

    // Handle task events
    socket.on("task:create", async (taskData) => {
      try {
        // Emit to all user's devices
        io.to(`user:${userId}`).emit("task:created", taskData);
      } catch (error) {
        socket.emit("error", { message: "Failed to create task" });
      }
    });

    socket.on("task:update", async (data) => {
      try {
        io.to(`user:${userId}`).emit("task:updated", data);
      } catch (error) {
        socket.emit("error", { message: "Failed to update task" });
      }
    });

    socket.on("task:delete", async (taskId) => {
      try {
        io.to(`user:${userId}`).emit("task:deleted", taskId);
      } catch (error) {
        socket.emit("error", { message: "Failed to delete task" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
    });
  });
}

