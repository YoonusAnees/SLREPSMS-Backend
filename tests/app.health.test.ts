import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { app } from "../src/app.js";

describe("Health endpoint", () => {
  it("GET /health should return ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});