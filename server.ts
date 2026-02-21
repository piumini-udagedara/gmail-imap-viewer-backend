import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import routes from "./routes";
import { errorHandler, notFound } from "./middleware/errorHandle";
import sequelize from "./config/database";
import logger from "./utils/logger";
import "./models";

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting (more lenient in development)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS ||
      (process.env.NODE_ENV === "development" ? "1000" : "100"),
  ),
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// CORS configuration
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN ||
      process.env.FRONTEND_URL ||
      "http://localhost:5173",
    credentials: true,
  }),
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root and API root - prevent "Route not found" for common requests
app.get("/", (_req, res) => {
  res.json({ message: "Gmail IMAP Viewer API", health: "/api/health" });
});
app.get("/api", (_req, res) => {
  res.json({ message: "API root", health: "/api/health" });
});

// Routes
app.use("/api", routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database connection and server start
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info("Database connection established successfully.");

    // Sync database models
    await sequelize.sync();
    logger.info("Database models synchronized.");

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    logger.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
