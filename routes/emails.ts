import { Router } from "express";
import EmailController from "../controllers/emailController";
import { authenticate } from "../middleware/authMiddleware";
import { query, param } from "express-validator";
import { validate } from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Sync emails from Gmail
router.post(
  "/sync",
  validate([
    query("folder").optional().isString(),
    query("limit").optional().isInt({ min: 1, max: 500 }),
  ]),
  EmailController.syncEmails,
);

// Get emails with pagination
router.get(
  "/",
  validate([
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("folder").optional().isString(),
  ]),
  EmailController.getEmails,
);

// Search emails
router.get(
  "/search",
  validate([
    query("q").notEmpty().isString(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ]),
  EmailController.searchEmails,
);

// Get email statistics
router.get("/stats", EmailController.getStats);

// Get available folders
router.get("/folders", EmailController.getFolders);

// Get email by ID
router.get(
  "/:id",
  validate([param("id").isInt()]),
  EmailController.getEmailById,
);

export default router;
