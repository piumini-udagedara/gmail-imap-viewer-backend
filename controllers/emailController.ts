import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import EmailService from "../services/imapService";
import { AppError } from "../middleware/errorHandle";

class EmailController {
  /**
   * Sync emails from Gmail
   */
  async syncEmails(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { folder = "INBOX", limit = 50 } = req.query;

      await EmailService.syncEmails(
        userId,
        folder as string,
        parseInt(limit as string),
      );

      res.json({ message: "Emails synced successfully" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get emails with pagination
   */
  async getEmails(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { page = "1", limit = "20", folder } = req.query;

      const result = await EmailService.getEmails(
        userId,
        parseInt(page as string),
        parseInt(limit as string),
        folder as string | undefined,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search emails
   */
  async searchEmails(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { q, page = "1", limit = "20" } = req.query;

      if (!q || typeof q !== "string") {
        throw new AppError("Search query is required", 400);
      }

      const result = await EmailService.searchEmails(
        userId,
        q,
        parseInt(page as string),
        parseInt(limit as string),
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get email by ID
   */
  async getEmailById(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const email = await EmailService.getEmailById(userId, parseInt(id));

      if (!email) {
        throw new AppError("Email not found", 404);
      }

      res.json({ email });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available folders
   */
  async getFolders(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const folders = await EmailService.getFolders(userId);

      res.json({ folders });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get email statistics
   */
  async getStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await EmailService.getEmailStats(userId);

      res.json({ stats });
    } catch (error) {
      next(error);
    }
  }
}

export default new EmailController();
