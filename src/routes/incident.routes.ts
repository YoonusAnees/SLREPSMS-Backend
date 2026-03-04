import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { create, list } from "../controllers/incident.controller.js";
import { upload } from "../middleware/upload.js";

const r = Router();

/* ------------------------------
   UPLOAD EVIDENCE (Frontend uses this)
--------------------------------*/
r.post(
  "/upload",
  auth,
  rbac(["DRIVER", "OFFICER", "ADMIN"]),
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fullUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.json({ url: fullUrl });
  }
);


/* ------------------------------
   CREATE INCIDENT
--------------------------------*/
r.post(
  "/",
  auth,
  rbac(["DRIVER", "OFFICER", "ADMIN"]),
  create
);

/* ------------------------------
   LIST INCIDENTS
--------------------------------*/
r.get("/", auth, rbac(["OFFICER", "ADMIN", "DISPATCHER"]), list);

export default r;
