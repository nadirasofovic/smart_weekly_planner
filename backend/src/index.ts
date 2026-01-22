import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import { securityHeaders, requestSizeLimit } from "./middleware/security";
import { apiLimiter } from "./middleware/rateLimit";
import healthRoutes from "./routes/health";
import taskRoutes from "./routes/tasks";
import authRoutes from "./routes/auth";
import tagRoutes from "./routes/tags";
import statsRoutes from "./routes/stats";
import weekRoutes from "./routes/weeks";
import exportRoutes from "./routes/export";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupSocketIO } from "./socket/socket";
import { setupNotificationCron } from "./services/notifications";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(securityHeaders);
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestSizeLimit);
app.use("/api", apiLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/weeks", weekRoutes);
app.use("/api/export", exportRoutes);

// Setup Socket.IO
setupSocketIO(io);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Setup notification cron jobs
setupNotificationCron();

httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
});

export { app, io, httpServer };

