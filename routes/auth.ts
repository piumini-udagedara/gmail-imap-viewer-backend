import { Router } from "express";
import AuthController from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.get("/google", AuthController.getAuthUrl);
router.get("/google/callback", AuthController.handleCallback);

// Protected routes
router.get("/me", authenticate, AuthController.getCurrentUser);
router.post("/logout", authenticate, AuthController.logout);

export default router;
