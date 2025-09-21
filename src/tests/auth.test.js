import request from "supertest";
import app from "../../server";

describe("POST /api/register", () => {
  it("registers a new user", async () => {
    const res = await request(app).post("/api/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).not.toHaveProperty("password");
  });
});

describe("POST /api/login", () => {
  it("fails with invalid credentials", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ username: "wronguser", password: "wrongpass" });
    expect(res.statusCode).toBe(401);
  });

  it("logs in with valid credentials", async () => {
    // First register a user (reuse registration route)
    await request(app).post("/api/register").send({
      username: "testlogin",
      email: "testlogin@example.com",
      password: "password123",
    });

    // Now login
    const res = await request(app)
      .post("/api/login")
      .send({ username: "testlogin", password: "password123" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("username", "testlogin");
  });

  it("rejects duplicate user", async () => {
    const res = await request(app).post("/api/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(403);
  });
});

describe("POST /api/forgot-password", () => {
  it("generates reset token", async () => {
    const res = await request(app)
      .post("/api/forgot-password")
      .send({ email: "test@example.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});

describe("POST /api/reset-password", () => {
  it("resets password with valid token", async () => {
    // first request token
    const { body } = await request(app)
      .post("/api/forgot-password")
      .send({ email: "test@example.com" });

    const token = body.token;

    // reset password
    const res = await request(app)
      .post("/api/reset-password")
      .send({ token, newPassword: "newPass123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Password updated successfully");
  });
});
