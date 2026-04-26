import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validate(schema: z.ZodType<any, any, any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: z.treeifyError(result.error),
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
