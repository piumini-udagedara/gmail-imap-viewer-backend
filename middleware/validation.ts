import { NextFunction, Request, Response } from "express";
import { ValidationChain, validationResult } from "express-validator";

// Builds middleware that runs provided validation rules and rejects invalid requests.
export const validate = (rules: ValidationChain[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    // Execute all rules against the incoming request.
    await Promise.all(rules.map((rule) => rule.run(req)));
    const errors = validationResult(req);

    // Return structured validation details for client-side error handling.
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    next();
  };
};
