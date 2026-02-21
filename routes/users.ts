import { Router } from "express";
import { body } from "express-validator";
import UserController from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";
import { validate } from "../middleware/validation";

const router = Router();

router.use(authenticate);

router.get("/preferences", UserController.getPreferences);
router.put(
  "/preferences",
  validate([
    body("defaultFolder").optional().isString(),
    body("pageSize").optional().isInt({ min: 5, max: 100 }),
  ]),
  UserController.updatePreferences,
);

export default router;
