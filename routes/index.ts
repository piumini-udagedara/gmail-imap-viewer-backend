import { Router } from "express";
import authRoutes from "./auth";
import emailRoutes from "./emails";
import userRoutes from "./users";

const router = Router();

router.use("/auth", authRoutes);
router.use("/emails", emailRoutes);
router.use("/users", userRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
