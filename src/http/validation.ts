import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny, z } from "zod";

type RequestSchemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

type ValidatedRequest<TSchemas extends RequestSchemas> = Request & {
  validated: {
    body: TSchemas["body"] extends ZodTypeAny ? z.infer<TSchemas["body"]> : undefined;
    query: TSchemas["query"] extends ZodTypeAny ? z.infer<TSchemas["query"]> : undefined;
    params: TSchemas["params"] extends ZodTypeAny ? z.infer<TSchemas["params"]> : undefined;
  };
};

export function validateRequest<TSchemas extends RequestSchemas>(schemas: TSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const validated = {
      body: schemas.body ? schemas.body.parse(req.body) : undefined,
      query: schemas.query ? schemas.query.parse(req.query) : undefined,
      params: schemas.params ? schemas.params.parse(req.params) : undefined
    };

    Object.assign(req, { validated });
    next();
  };
}

export function getValidatedRequest<TSchemas extends RequestSchemas>(req: Request) {
  return req as ValidatedRequest<TSchemas>;
}

