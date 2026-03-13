/**
 * IoC Container — registers and resolves dependencies.
 * Keeps modules loosely coupled.
 */
class Container {
  constructor() {
    this._registry = new Map();
    this._instances = new Map();
  }

  register(name, factory, { singleton = true } = {}) {
    this._registry.set(name, { factory, singleton });
  }

  resolve(name) {
    if (!this._registry.has(name)) {
      throw new Error(`[Container] Dependency "${name}" not registered`);
    }

    const { factory, singleton } = this._registry.get(name);

    if (singleton) {
      if (!this._instances.has(name)) {
        this._instances.set(name, factory(this));
      }
      return this._instances.get(name);
    }

    return factory(this);
  }

  has(name) {
    return this._registry.has(name);
  }
}

module.exports = new Container(); // singleton
