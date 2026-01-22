import { Router, Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import { prisma } from "../prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

router.use(authenticate);

// Get all tags
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const tags = await prisma.tag.findMany({
      where: {
        OR: [{ userId }, { userId: null }], // User tags and shared tags
      },
      include: {
        _count: {
          select: {
            taskTags: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json({ tags });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    throw error;
  }
});

// Get popular tags
router.get("/popular", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const popularTags = await prisma.tag.findMany({
      where: {
        OR: [{ userId }, { userId: null }],
      },
      include: {
        _count: {
          select: {
            taskTags: true,
          },
        },
      },
      orderBy: {
        taskTags: {
          _count: "desc",
        },
      },
      take: 10,
    });

    res.json({ tags: popularTags });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    throw error;
  }
});

// Create tag
router.post(
  "/",
  [
    body("name").trim().notEmpty(),
    body("color").optional().matches(/^#[0-9A-Fa-f]{6}$/),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, color = "#3b82f6" } = req.body;
      const userId = req.userId!;

      // Check if tag exists
      const existingTag = await prisma.tag.findFirst({
        where: {
          name,
          userId,
        },
      });

      if (existingTag) {
        throw new AppError("Tag already exists", 409);
      }

      const tag = await prisma.tag.create({
        data: {
          name,
          color,
          userId,
        },
      });

      res.status(201).json({ tag });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      throw error;
    }
  }
);

// Update tag
router.put(
  "/:id",
  [
    body("name").optional().trim().notEmpty(),
    body("color").optional().matches(/^#[0-9A-Fa-f]{6}$/),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const userId = req.userId!;
      const { name, color } = req.body;

      const tag = await prisma.tag.findFirst({
        where: { id, userId },
      });

      if (!tag) {
        throw new AppError("Tag not found", 404);
      }

      const updatedTag = await prisma.tag.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(color && { color }),
        },
      });

      res.json({ tag: updatedTag });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      throw error;
    }
  }
);

// Delete tag
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const tag = await prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!tag) {
      throw new AppError("Tag not found", 404);
    }

    await prisma.tag.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    throw error;
  }
});

export default router;

