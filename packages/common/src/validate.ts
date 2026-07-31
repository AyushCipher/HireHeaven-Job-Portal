import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

type RequestSource = "body" | "params" | "query";

/**
 * Validates req[source] against the schema and stores the parsed (and
 * coerced/defaulted) result on res.locals.validated[source]. We deliberately
 * avoid writing back to req.query — Express 5 exposes req.query as a
 * getter-only accessor and assigning to it throws at runtime.
 */
export const validate = (schema: ZodTypeAny, source: RequestSource = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    if (!res.locals.validated) {
      res.locals.validated = {};
    }

    res.locals.validated[source] = result.data;

    if (source !== "query") {
      req[source] = result.data;
    }

    next();
  };
};
