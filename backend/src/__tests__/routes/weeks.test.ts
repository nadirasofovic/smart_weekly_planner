import request from "supertest";
import { app } from "../../index";
import { cleanupDatabase, createTestUser, createTestTask, getAuthToken } from "../utils/testHelpers";

describe("Weeks API", () => {
  let userId: string;
  let authToken: string;

  beforeEach(async () => {
    await cleanupDatabase();
    const user = await createTestUser("weeks@example.com");
    userId = user.id;
    authToken = getAuthToken(user.id, user.email);
  });

  describe("GET /api/weeks/current", () => {
    it("should return current week info", async () => {
      const response = await request(app)
        .get("/api/weeks/current")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("year");
      expect(response.body).toHaveProperty("week");
      expect(response.body).toHaveProperty("start_date");
      expect(response.body).toHaveProperty("end_date");
      expect(response.body).toHaveProperty("days");
      expect(response.body.days).toHaveLength(7);
    });
  });

  describe("GET /api/weeks/:year/:week", () => {
    it("should return specific week info", async () => {
      const response = await request(app)
        .get("/api/weeks/2024/3")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.year).toBe(2024);
      expect(response.body.week).toBe(3);
      expect(response.body).toHaveProperty("start_date");
      expect(response.body).toHaveProperty("end_date");
    });

    it("should reject invalid week number", async () => {
      await request(app)
        .get("/api/weeks/2024/54")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe("GET /api/weeks/:year/:week/tasks", () => {
    it("should return tasks for specific week", async () => {
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      
      await createTestTask(userId, { date: dateStr, title: "Week Task" });

      const year = today.getFullYear();
      const week = getISOWeek(today);

      const response = await request(app)
        .get(`/api/weeks/${year}/${week}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toBeInstanceOf(Array);
    });
  });
});

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

