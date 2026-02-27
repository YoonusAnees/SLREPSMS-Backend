import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env.js";
import { User } from "../entities/User.js";
import { RefreshToken } from "../entities/RefreshToken.js";
import { Driver } from "../entities/Driver.js";
import { ViolationType } from "../entities/ViolationType.js";
import { Penalty } from "../entities/Penalty.js";
import { Vehicle } from "../entities/Vehicle.js";

const AppDataSource = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  entities: [User, RefreshToken ,Driver, ViolationType, Penalty,Vehicle],
  migrations: ["src/db/migrations/*.ts"],
  synchronize: false,
  logging: false,
});

export default AppDataSource;
