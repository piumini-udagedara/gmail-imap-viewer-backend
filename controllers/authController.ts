import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import { createOAuthClient, oauthScopes } from "../config/passport";
import User from "../models/User";
import UserPreferences from "../models/UserPreferences";
import { AppError } from "../middleware/errorHandle";
import { AuthRequest } from "../middleware/authMiddleware";

class AuthController {
  // Returns Google OAuth URL for client-side sign-in redirect.
  getAuthUrl(_req: Request, res: Response): void {
    const oauthClient = createOAuthClient();
    const url = oauthClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: oauthScopes,
    });

    res.json({ url });
  }

  async handleCallback(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Google sends an authorization code which is exchanged for tokens.
      const { code } = req.query;
      if (!code || typeof code !== "string") {
        throw new AppError("Authorization code is missing", 400);
      }

      const oauthClient = createOAuthClient();
      const tokenResponse = await oauthClient.getToken(code);
      oauthClient.setCredentials(tokenResponse.tokens);

      const oauth2 = google.oauth2({ version: "v2", auth: oauthClient });
      const profileResponse = await oauth2.userinfo.get();
      const profile = profileResponse.data;

      if (!profile.id || !profile.email) {
        throw new AppError("Google profile information is incomplete", 400);
      }

      // Create first-time users from Google profile data.
      const [user] = await User.findOrCreate({
        where: { googleId: profile.id },
        defaults: {
          googleId: profile.id,
          email: profile.email,
          displayName: profile.name || profile.email,
          avatarUrl: profile.picture || null,
          accessToken: tokenResponse.tokens.access_token || "",
          refreshToken: tokenResponse.tokens.refresh_token || null,
          tokenExpiry: tokenResponse.tokens.expiry_date
            ? new Date(tokenResponse.tokens.expiry_date)
            : null,
        },
      });

      user.email = profile.email;
      user.displayName = profile.name || profile.email;
      user.avatarUrl = profile.picture || null;
      // Persist fresh OAuth tokens when Google rotates or returns new ones.
      if (tokenResponse.tokens.access_token) {
        user.accessToken = tokenResponse.tokens.access_token;
      }
      if (tokenResponse.tokens.refresh_token) {
        user.refreshToken = tokenResponse.tokens.refresh_token;
      }
      if (tokenResponse.tokens.expiry_date) {
        user.tokenExpiry = new Date(tokenResponse.tokens.expiry_date);
      }
      await user.save();

      // Ensure each authenticated user has persisted UI/email preferences.
      await UserPreferences.findOrCreate({
        where: { userId: user.id },
        defaults: {
          userId: user.id,
          defaultFolder: "INBOX",
          pageSize: 20,
        },
      });

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new AppError("JWT secret is not configured", 500);
      }

      // Issue app session token consumed by frontend API requests.
      const token = jwt.sign({ userId: user.id }, jwtSecret, {
        expiresIn: "7d",
      });

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      // Return token to frontend callback route for client-side storage.
      const redirectUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`;

      // Optional JSON mode simplifies local/API testing without browser redirect.
      if (req.query.mode === "json") {
        res.json({ token, user });
        return;
      }

      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // `req.user` is populated by `authenticate` middleware.
      const user = req.user!;
      const preferences = await UserPreferences.findOne({
        where: { userId: user.id },
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
        preferences,
      });
    } catch (error) {
      next(error);
    }
  }

  // Stateless logout for JWT auth; client is responsible for discarding token.
  logout(_req: AuthRequest, res: Response): void {
    res.json({
      message: "Logged out successfully. Remove token on client side.",
    });
  }
}

export default new AuthController();
