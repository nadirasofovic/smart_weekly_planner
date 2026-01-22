import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { prisma } from "../prisma/client";
import { hashPassword, comparePassword } from "../utils/password";
import { generateAccessToken, generateRefreshToken, TokenPayload } from "../utils/jwt";
import { authenticate, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { loginLimiter } from "../middleware/rateLimit";

const router = Router();

// Register
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("name").optional().trim(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError("User already exists", 409);
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: name || null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          themePreference: true,
          createdAt: true,
        },
      });

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      res.status(201).json({
        user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      throw error;
    }
  }
);

// Login
router.post(
  "/login",
  loginLimiter,
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new AppError("Invalid credentials", 401);
      }

      // Verify password
      const isValid = await comparePassword(password, user.passwordHash);

      if (!isValid) {
        throw new AppError("Invalid credentials", 401);
      }

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          themePreference: user.themePreference,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      throw error;
    }
  }
);

// Refresh token
router.post("/refresh", async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token required" });
  }

  try {
    const { verifyRefreshToken, generateAccessToken } = await import("../utils/jwt");
    const payload = verifyRefreshToken(refreshToken);
    
    const newAccessToken = generateAccessToken(payload);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

// Get current user
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        email: true,
        name: true,
        themePreference: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json({ user });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    throw error;
  }
});

// Update preferences
router.put(
  "/preferences",
  authenticate,
  [
    body("themePreference").optional().isIn(["light", "dark"]),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { themePreference } = req.body;

      const user = await prisma.user.update({
        where: { id: req.userId! },
        data: {
          ...(themePreference && { themePreference }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          themePreference: true,
        },
      });

      res.json({ user });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      throw error;
    }
  }
);

export default router;

