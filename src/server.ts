import "reflect-metadata";
import { app } from "./app.js";
import AppDataSource from "./config/data-source.js";
import { env } from "./config/env.js";

const PORT = env.PORT || 10000;
const HOST = "0.0.0.0";

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log("✅ DB connected");

    app.listen(PORT, HOST, () => {
      console.log(`✅ API running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Startup failed:", error);
    process.exit(1);
  }
}

bootstrap();