import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import express from "express";
import { rbac } from "../src/middleware/rbac.js";

describe("RBAC middleware", () => {
  it("should allow access for permitted role", async () => {
    const app = express();

    app.get(
      "/protected",
      (req: any, _res, next) => {
        req.user = { sub: "u1", role: "ADMIN" };
        next();
      },
      rbac(["ADMIN"]),
      (_req, res) => {
        res.json({ ok: true });
      }
    );

    const res = await request(app).get("/protected");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("should reject access for non-permitted role", async () => {
    const app = express();

    app.get(
      "/protected",
      (req: any, _res, next) => {
        req.user = { sub: "u1", role: "DRIVER" };
        next();
      },
      rbac(["ADMIN"]),
      (_req, res) => {
        res.json({ ok: true });
      }
    );

    const res = await request(app).get("/protected");

    expect(res.status).toBe(403);
    expect(res.body.message).toBeDefined();
  });

  it("should reject when req.user is missing", async () => {
    const app = express();

    app.get(
      "/protected",
      rbac(["ADMIN"]),
      (_req, res) => {
        res.json({ ok: true });
      }
    );

    const res = await request(app).get("/protected");

    expect(res.status).toBe(403);
  });
});