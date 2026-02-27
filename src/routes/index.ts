import { Router } from "express";
import authRoutes from "./auth.routes.js";
import driversRoutes from "./drivers.routes.js";
import violationTypesRoutes from "./violationTypes.routes.js";
import penaltiesRoutes from "./penalties.routes.js";


export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/drivers", driversRoutes);
routes.use("/violationTypes", violationTypesRoutes);
routes.use("/penalties", penaltiesRoutes);

