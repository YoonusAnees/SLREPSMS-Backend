import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import express from "express";
import authRoutes from "../src/routes/auth.routes.js";
import { errorHandler } from "../src/middleware/error.js";

describe("Auth validation tests", () => {
  const app = express();

  app.use(express.json());
  app.use("/auth", authRoutes);
  app.use(errorHandler);

  it("POST /auth/register should fail for invalid body", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "A",
      email: "bad-email",
      role: "DRIVER",
      password: "123"
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("POST /auth/login should fail for invalid body", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "bad-email",
      password: ""
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("POST /auth/refresh should fail for invalid body", async () => {
    const res = await request(app).post("/auth/refresh").send({
      refreshToken: "123"
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("POST /auth/logout should fail for invalid body", async () => {
    const res = await request(app).post("/auth/logout").send({
      refreshToken: "123"
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});