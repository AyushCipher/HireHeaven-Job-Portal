import { NextFunction, Request, Response } from "express";

interface RequestWithRole extends Request {
  user?: { role?: string };
}

/** Restricts a route to callers whose req.user.role is one of the given roles. Must run after an isAuth-style middleware that populates req.user. */
export const requireRole = (...roles: string[]) => {
  return (req: RequestWithRole, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role || "")) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};
