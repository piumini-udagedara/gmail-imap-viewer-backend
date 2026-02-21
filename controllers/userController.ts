import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import UserPreferences from "../models/UserPreferences";

class UserController {
  // Returns user preferences, creating a default row on first access.
  async getPreferences(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const preferences = await UserPreferences.findOrCreate({
        where: { userId: req.user!.id },
        defaults: {
          userId: req.user!.id,
          defaultFolder: "INBOX",
          pageSize: 20,
        },
      });

      res.json({ preferences: preferences[0] });
    } catch (error) {
      next(error);
    }
  }

  // Applies partial preference updates and persists the latest values.
  async updatePreferences(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Both fields are optional so clients can update one setting at a time.
      const { defaultFolder, pageSize } = req.body as {
        defaultFolder?: string;
        pageSize?: number;
      };

      const [preferences] = await UserPreferences.findOrCreate({
        where: { userId: req.user!.id },
        defaults: {
          userId: req.user!.id,
          defaultFolder: "INBOX",
          pageSize: 20,
        },
      });

      if (defaultFolder) {
        preferences.defaultFolder = defaultFolder;
      }
      // Page size updates are applied only when a value is provided.
      if (pageSize) {
        preferences.pageSize = pageSize;
      }

      await preferences.save();

      res.json({ preferences });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
