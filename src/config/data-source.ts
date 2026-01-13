import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env.js";
import { User } from "../entities/User.js";
import { RefreshToken } from "../entities/RefreshToken.js";

const AppDataSource = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  entities: [User, RefreshToken],
  migrations: ["src/db/migrations/*.ts"],
  synchronize: false,
  logging: false,
});

export default AppDataSource;
