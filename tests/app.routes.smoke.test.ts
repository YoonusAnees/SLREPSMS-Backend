import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { app } from "../src/app.js";

describe("Basic API smoke tests", () => {
  it("GET /health should respond with 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });

  it("Unknown route should not return 200", async () => {
    const res = await request(app).get("/unknown-route");
    expect(res.status).not.toBe(200);
  });
});