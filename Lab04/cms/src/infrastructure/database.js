const mongoose = require('mongoose');
const config = require('../../config/default');
const logger = require('./logger');

class Database {
  constructor() {
    this._connected = false;
  }

  async connect() {
    try {
      await mongoose.connect(config.db.uri, config.db.options);
      this._connected = true;
      logger.info(`[Database] Connected to MongoDB: ${config.db.uri}`);

      mongoose.connection.on('disconnected', () => {
        logger.warn('[Database] MongoDB disconnected');
        this._connected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('[Database] MongoDB reconnected');
        this._connected = true;
      });
    } catch (err) {
      logger.error(`[Database] Connection failed: ${err.message}`);
      throw err;
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    this._connected = false;
    logger.info('[Database] Disconnected from MongoDB');
  }

  isConnected() {
    return this._connected;
  }
}

module.exports = new Database();
