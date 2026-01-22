import request from "supertest";
import { app } from "../../index";
import { cleanupDatabase, createTestUser, createTestTask, getAuthToken } from "../utils/testHelpers";

describe("Statistics API", () => {
  let userId: string;
  let authToken: string;

  beforeEach(async () => {
    await cleanupDatabase();
    const user = await createTestUser("stats@example.com");
    userId = user.id;
    authToken = getAuthToken(user.id, user.email);
  });

  describe("GET /api/stats", () => {
    it("should return statistics for user", async () => {
      await createTestTask(userId, { title: "Task 1", status: "done" });
      await createTestTask(userId, { title: "Task 2", status: "todo" });
      await createTestTask(userId, { title: "Task 3", priority: "high" });

      const response = await request(app)
        .get("/api/stats")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("total_tasks", 3);
      expect(response.body).toHaveProperty("completed_tasks", 1);
      expect(response.body).toHaveProperty("completion_percentage");
      expect(response.body).toHaveProperty("by_priority");
      expect(response.body).toHaveProperty("by_day");
      expect(response.body).toHaveProperty("most_productive_day");
    });

    it("should return zero stats for new user", async () => {
      const response = await request(app)
        .get("/api/stats")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total_tasks).toBe(0);
      expect(response.body.completed_tasks).toBe(0);
      expect(response.body.completion_percentage).toBe(0);
    });

    it("should filter by date range", async () => {
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      
      await createTestTask(userId, { date: dateStr, title: "Today Task" });

      const response = await request(app)
        .get(`/api/stats?date_from=${dateStr}&date_to=${dateStr}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total_tasks).toBeGreaterThanOrEqual(1);
    });
  });
});

