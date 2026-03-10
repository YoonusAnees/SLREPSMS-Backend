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
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  entities: [User, RefreshToken ,Driver, ViolationType, Penalty,Vehicle,Payment,Incident,RescueTeam,Dispatch],
  migrations: ["src/db/migrations/*.ts"],
  synchronize: false,
  logging: false,
  ssl: {
    rejectUnauthorized: false, // If you need to skip verification of the server's certificate
  },
});

export default AppDataSource;
