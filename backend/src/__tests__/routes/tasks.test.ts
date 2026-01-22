import request from "supertest";
import { app } from "../../index";
import { cleanupDatabase, createTestUser, createTestTask, getAuthToken } from "../utils/testHelpers";

describe("Tasks API", () => {
  let userId: string;
  let authToken: string;

  beforeEach(async () => {
    await cleanupDatabase();
    const user = await createTestUser("tasks@example.com");
    userId = user.id;
    authToken = getAuthToken(user.id, user.email);
  });

  describe("GET /api/tasks", () => {
    it("should return empty array for new user", async () => {
      const response = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toEqual([]);
    });

    it("should return user's tasks", async () => {
      await createTestTask(userId, { title: "Task 1" });
      await createTestTask(userId, { title: "Task 2" });

      const response = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(2);
    });

    it("should filter by day", async () => {
      await createTestTask(userId, { title: "Monday Task", day: "mon" });
      await createTestTask(userId, { title: "Tuesday Task", day: "tue" });

      const response = await request(app)
        .get("/api/tasks?day=mon")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].day).toBe("mon");
    });

    it("should filter by priority", async () => {
      await createTestTask(userId, { title: "High Priority", priority: "high" });
      await createTestTask(userId, { title: "Low Priority", priority: "low" });

      const response = await request(app)
        .get("/api/tasks?priority=high")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].priority).toBe("high");
    });

    it("should filter by status", async () => {
      await createTestTask(userId, { title: "Todo Task", status: "todo" });
      await createTestTask(userId, { title: "Done Task", status: "done" });

      const response = await request(app)
        .get("/api/tasks?status=done")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].status).toBe("done");
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "New Task",
          day: "mon",
          priority: "high",
          status: "todo",
        })
        .expect(201);

      expect(response.body.task).toHaveProperty("id");
      expect(response.body.task.title).toBe("New Task");
      expect(response.body.task.day).toBe("mon");
    });

    it("should require authentication", async () => {
      await request(app)
        .post("/api/tasks")
        .send({
          title: "New Task",
          day: "mon",
        })
        .expect(401);
    });

    it("should validate required fields", async () => {
      await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          day: "mon",
          // Missing title
        })
        .expect(400);
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("should return task by id", async () => {
      const task = await createTestTask(userId, { title: "Specific Task" });

      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.task.id).toBe(task.id);
      expect(response.body.task.title).toBe("Specific Task");
    });

    it("should return 404 for non-existent task", async () => {
      await request(app)
        .get("/api/tasks/non-existent-id")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update task", async () => {
      const task = await createTestTask(userId, { title: "Original Title" });

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
          day: "tue",
          priority: "high",
          status: "inprogress",
        })
        .expect(200);

      expect(response.body.task.title).toBe("Updated Title");
      expect(response.body.task.day).toBe("tue");
      expect(response.body.task.priority).toBe("high");
    });
  });

  describe("PATCH /api/tasks/:id/status", () => {
    it("should update task status", async () => {
      const task = await createTestTask(userId, { status: "todo" });

      const response = await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ status: "done" })
        .expect(200);

      expect(response.body.task.status).toBe("done");
    });

    it("should validate status value", async () => {
      const task = await createTestTask(userId);

      await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ status: "invalid" })
        .expect(400);
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete task", async () => {
      const task = await createTestTask(userId);

      await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      // Verify task is deleted
      await request(app)
        .get(`/api/tasks/${task.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

