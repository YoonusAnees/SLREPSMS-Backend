import { Router } from "express";
import authRoutes from "./auth.routes.js";
import driversRoutes from "./drivers.routes.js";


export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/drivers", driversRoutes);

