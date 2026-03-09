import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { routes } from "./routes/index.js";
import { errorHandler } from "./middleware/error.js";

export const app = express();

app.use(
  pinoHttp({
    enabled: process.env.NODE_ENV !== "test",
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, 
  })
);app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/uploads", express.static("uploads", {
  setHeaders: (res, path) => {
    if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
      res.setHeader("Content-Type", "image/jpeg");
    }
    if (path.endsWith(".png")) {
      res.setHeader("Content-Type", "image/png");
    }
  }
}));
app.use("/api", routes);

app.use(errorHandler);
