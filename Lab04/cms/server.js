require('dotenv').config();
const config = require('./config/default');
const createApp = require('./src/app');
const database = require('./src/infrastructure/database');
const logger = require('./src/infrastructure/logger');

async function bootstrap() {
  try {
    // 1. Connect to database
    await database.connect();

    // 2. Build Express app (registers plugins)
    const app = await createApp();

    // 3. Start server
    const server = app.listen(config.port, () => {
      logger.info(`\n🚀 CMS Server running`);
      logger.info(`   → http://localhost:${config.port}/api`);
      logger.info(`   → ENV: ${config.env}`);
    });

    // ─── Graceful shutdown ───────────────────────────────────────────────────
    const shutdown = async (signal) => {
      logger.info(`\n[Server] Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        await database.disconnect();
        logger.info('[Server] Goodbye.');
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10_000); // force after 10s
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));
    process.on('uncaughtException', (err) => {
      logger.error(`[Server] Uncaught Exception: ${err.stack}`);
      process.exit(1);
    });
    process.on('unhandledRejection', (reason) => {
      logger.error(`[Server] Unhandled Rejection: ${reason}`);
      process.exit(1);
    });

  } catch (err) {
    logger.error(`[Server] Failed to start: ${err.message}`);
    process.exit(1);
  }
}

bootstrap();
