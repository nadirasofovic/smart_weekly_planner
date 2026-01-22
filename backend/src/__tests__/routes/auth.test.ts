import request from "supertest";
import { app } from "../../index";
import { cleanupDatabase, createTestUser, getAuthToken } from "../utils/testHelpers";

describe("Authentication", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "newuser@example.com",
          password: "password123",
          name: "New User",
        })
        .expect(201);

      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.user.email).toBe("newuser@example.com");
    });

    it("should reject duplicate email", async () => {
      await createTestUser("duplicate@example.com");

      await request(app)
        .post("/api/auth/register")
        .send({
          email: "duplicate@example.com",
          password: "password123",
        })
        .expect(409);
    });

    it("should validate email format", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          email: "invalid-email",
          password: "password123",
        })
        .expect(400);
    });

    it("should validate password length", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: "12345", // Too short
        })
        .expect(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await createTestUser("login@example.com", "password123");
    });

    it("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("should reject invalid credentials", async () => {
      await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "wrongpassword",
        })
        .expect(401);
    });

    it("should reject non-existent user", async () => {
      await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        })
        .expect(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user with valid token", async () => {
      const user = await createTestUser("me@example.com");
      const token = getAuthToken(user.id, user.email);

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.user.email).toBe("me@example.com");
    });

    it("should reject request without token", async () => {
      await request(app)
        .get("/api/auth/me")
        .expect(401);
    });
  });
});

