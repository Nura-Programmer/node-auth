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
