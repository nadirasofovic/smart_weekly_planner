import helmet from "helmet";
import { Request, Response, NextFunction } from "express";

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (req.headers["content-length"] && parseInt(req.headers["content-length"]) > maxSize) {
    return res.status(413).json({ error: "Request too large" });
  }
  next();
};

