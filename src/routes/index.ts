import { Router } from "express";
import authRoutes from "./auth.routes.js";
import driversRoutes from "./drivers.routes.js";
import violationTypesRoutes from "./violationTypes.routes.js";
import penaltiesRoutes from "./penalties.routes.js";
import vehiclesRoutes from "./vehicles.routes.js";
import paymentsRoutes from "./payments.routes.js";
import dispatcherRoutes from "./dispatcher.routes.js";
import incidentsRoutes from "./incident.routes.js";
import rescueRoutes from "./rescue.routes.js";
import adminRoutes from "./admin.routes.js";
import officerRoutes from "./officer.routes.js";
import publicRoutes from "./public.routes.js"



export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/drivers", driversRoutes);
routes.use("/violationTypes", violationTypesRoutes);
routes.use("/penalties", penaltiesRoutes);
routes.use("/vehicles", vehiclesRoutes);
routes.use("/payments", paymentsRoutes);
routes.use("/incidents", incidentsRoutes);
routes.use("/dispatch", dispatcherRoutes);
routes.use("/rescue", rescueRoutes);
routes.use("/admin", adminRoutes);
routes.use("/officer", officerRoutes);
routes.use("/public",publicRoutes)

