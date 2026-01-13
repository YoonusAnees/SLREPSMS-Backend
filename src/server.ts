import "reflect-metadata";
import { app } from "./app.js";
import { env } from "./config/env.js";
import AppDataSource from "./config/data-source.js"; // default import

async function bootstrap() {
  await AppDataSource.initialize();
  console.log("✅ DB connected");

  app.listen(env.PORT, () =>
    console.log(`✅ API running http://localhost:${env.PORT}`)
  );
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
