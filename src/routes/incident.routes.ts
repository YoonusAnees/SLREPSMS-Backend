import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { create, list, my, review, resolve } from "../controllers/incident.controller.js";
import { upload } from "../middleware/upload.js";

const r = Router();

r.post(
  "/upload",
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fullUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ url: fullUrl });
  }
);

r.post("/",  create);
r.get("/my", auth, rbac(["DRIVER", "OFFICER"]), my);
r.get("/", list);
r.patch("/:id/review", auth, rbac(["OFFICER"]), review);
r.patch("/:id/resolve", auth, rbac(["OFFICER"]), resolve);

export default r;