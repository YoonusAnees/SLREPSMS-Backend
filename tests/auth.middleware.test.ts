import { jest, describe, it, expect } from "@jest/globals";
import request from "supertest";
import express from "express";

const mockVerifyAccessToken = jest.fn();

jest.unstable_mockModule("../src/utils/jwt.js", () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

const authModule = await import("../src/middleware/auth.js");
const { auth } = authModule;

describe("Auth middleware", () => {
  it("should allow valid bearer token and attach req.user", async () => {
    const app = express();

    mockVerifyAccessToken.mockReturnValue({
      sub: "u1",
      role: "ADMIN",
      typ: "access",
    });

    app.get("/protected", auth, (req: any, res) => {
      res.json({
        ok: true,
        user: req.user,
      });
    });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.user).toEqual({
      sub: "u1",
      role: "ADMIN",
      typ: "access",
    });
  });

  it("should reject when authorization header is missing", async () => {
    const app = express();

    app.get("/protected", auth, (_req, res) => {
      res.json({ ok: true });
    });

    const res = await request(app).get("/protected");

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it("should reject when authorization format is invalid", async () => {
    const app = express();

    app.get("/protected", auth, (_req, res) => {
      res.json({ ok: true });
    });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Token abc123");

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it("should reject invalid token", async () => {
    const app = express();

    mockVerifyAccessToken.mockImplementation(() => {
      throw Object.assign(new Error("Invalid token"), { status: 401 });
    });

    app.get("/protected", auth, (_req, res) => {
      res.json({ ok: true });
    });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer bad-token");

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });
});