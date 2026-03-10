import "reflect-metadata";
import { app } from "./app.js";
import AppDataSource from "./config/data-source.js";
import { env } from "./config/env.js";


async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log("✅ DB connected");

    app.listen( () => {
      console.log(`✅ API running on ${env.PORT} `);
    });
  } catch (error) {
    console.error("❌ Startup failed:", error);
    process.exit(1);
  }
}

bootstrap();