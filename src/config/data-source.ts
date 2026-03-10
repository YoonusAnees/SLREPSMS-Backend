import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env.js";
import { User } from "../entities/User.js";
import { RefreshToken } from "../entities/RefreshToken.js";
import { Driver } from "../entities/Driver.js";
import { ViolationType } from "../entities/ViolationType.js";
import { Penalty } from "../entities/Penalty.js";
import { Vehicle } from "../entities/Vehicle.js";
import { Payment } from "../entities/Payment.js";
import { Incident } from "../entities/Incident.js";
import { RescueTeam } from "../entities/RescueTeam.js";
import { Dispatch } from "../entities/Dispatch.js";

const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [
    User,
    RefreshToken,
    Driver,
    ViolationType,
    Penalty,
    Vehicle,
    Payment,
    Incident,
    RescueTeam,
    Dispatch,
  ],
  migrations: ["dist/db/migrations/*.js"],
  synchronize: false,
  logging: true,
});

export default AppDataSource;