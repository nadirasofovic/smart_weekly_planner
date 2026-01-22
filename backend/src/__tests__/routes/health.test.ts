import request from "supertest";
import { app } from "../../index";

// Mock Prisma for tests
jest.mock("../../prisma/client", () => ({
  prisma: {
    $disconnect: jest.fn(),
  },
}));

describe("Health Check", () => {
  it("should return 200 and health status", async () => {
    const response = await request(app)
      .get("/api/health")
      .expect(200);

    expect(response.body).toHaveProperty("status", "ok");
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("uptime");
  });
});

