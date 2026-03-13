const eventBus = require('./event-bus');
const logger = require('../infrastructure/logger');

/**
 * PluginManager — microkernel core.
 * Loads, initialises, and tears down plugins.
 * Plugins expose: { name, version, register(app, container) }
 */
class PluginManager {
  constructor() {
    this._plugins = new Map();
  }

  async register(plugin, app, container) {
    if (this._plugins.has(plugin.name)) {
      logger.warn(`[PluginManager] Plugin "${plugin.name}" already registered`);
      return;
    }

    try {
      await plugin.register(app, container);
      this._plugins.set(plugin.name, { ...plugin, registeredAt: Date.now() });
      eventBus.publish('plugin:registered', { name: plugin.name, version: plugin.version });
      logger.info(`[PluginManager] Plugin "${plugin.name}@${plugin.version}" loaded`);
    } catch (err) {
      logger.error(`[PluginManager] Failed to load plugin "${plugin.name}": ${err.message}`);
      throw err;
    }
  }

  async registerAll(plugins, app, container) {
    for (const plugin of plugins) {
      await this.register(plugin, app, container);
    }
  }

  list() {
    return Array.from(this._plugins.values());
  }

  get(name) {
    return this._plugins.get(name);
  }
}

module.exports = new PluginManager();
