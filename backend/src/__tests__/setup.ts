import { prisma } from "../prisma/client";

// Clean up database after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.DATABASE_URL = "file:./test.db";

