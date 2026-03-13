const { EventEmitter } = require('events');

/**
 * EventBus — decouples modules via publish/subscribe.
 * Plugins and modules emit/listen without direct dependencies.
 */
class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
    this._history = [];
  }

  publish(event, payload) {
    this._history.push({ event, payload, ts: Date.now() });
    this.emit(event, payload);
  }

  subscribe(event, handler) {
    this.on(event, handler);
    return () => this.off(event, handler); // returns unsubscribe fn
  }

  subscribeOnce(event, handler) {
    this.once(event, handler);
  }

  getHistory(event) {
    return event
      ? this._history.filter((h) => h.event === event)
      : this._history;
  }
}

module.exports = new EventBus(); // singleton
