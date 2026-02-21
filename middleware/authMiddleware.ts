import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface JwtPayload {
  userId: number;
}

// Extend Express Request so downstream handlers can access the authenticated user.
export interface AuthRequest extends Request {
  user?: User;
}

// Verifies bearer token, resolves the user, and attaches it to req.user.
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    // Expect the Authorization header in the format: Bearer <token>
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : undefined;

    if (!token) {
      res.status(401).json({ message: "Authentication token is missing" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    // Fail fast if JWT secret is not configured on the server.
    if (!jwtSecret) {
      res.status(500).json({ message: "Server JWT configuration is missing" });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    // Ensure token points to an existing user account.
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      res.status(401).json({ message: "User no longer exists" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
