const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('../config/default');
const container = require('./kernel/container');
const pluginManager = require('./kernel/plugin-manager');
const routes = require('./routes');
const errorHandler = require('./middleware/error-handler');
const logger = require('./infrastructure/logger');

// Services
const userService = require('./modules/users/service');
const contentService = require('./modules/content/service');

async function createApp() {
  const app = express();

  // ─── Security & Parsing ───────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev', { stream: { write: (msg) => logger.http(msg.trim()) } }));

  // ─── Rate limiting ────────────────────────────────────────────────────────
  app.use('/api', rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
  }));

  // ─── Static files ─────────────────────────────────────────────────────────
  app.use('/uploads', express.static(path.resolve(config.upload.dir)));

  // ─── IoC Container ────────────────────────────────────────────────────────
  container.register('userService', () => userService);
  container.register('contentService', () => contentService);

  // ─── Core API routes ──────────────────────────────────────────────────────
  app.use('/api', routes);

  // ─── Load plugins (microkernel) ───────────────────────────────────────────
  const plugins = [];
  if (config.plugins.seo.enabled)    plugins.push(require('./plugins/seo'));
  if (config.plugins.search.enabled) plugins.push(require('./plugins/search'));
  await pluginManager.registerAll(plugins, app, container);

  // ─── Plugin info endpoint ─────────────────────────────────────────────────
  app.get('/api/plugins', (req, res) => {
    res.json({ success: true, data: pluginManager.list() });
  });

  // ─── 404 ──────────────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
  });

  // ─── Error handler ────────────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
