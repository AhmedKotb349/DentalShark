/**
 * SINGLETON PATTERN
 * -------------------------------------------------------------------------
 * Guarantees a single, shared data-access instance for the whole backend
 * process. Every route (auth, orders, users, suppliers, the CheckoutFacade,
 * OrderBuilder, etc.) talks to the database exclusively through
 * `Database.getInstance()` — never by re-requiring the low-level jsonDb
 * module directly. This is exactly the problem Singleton solves: many
 * different modules need the *same* connection/cache, not one each.
 *
 * Node's require() cache would already give us a de-facto singleton for
 * jsonDb.js, but that's an accident of the module system, not a guarantee
 * enforced by the class itself. Database wraps that module behind an
 * explicit `getInstance()` gate and a private constructor guard, so the
 * pattern is real and inspectable, and a call counter demonstrates that
 * the same object is reused on every call.
 */
const jsonDb = require('../jsonDb');

class Database {
  constructor(enforcer) {
    if (enforcer !== SINGLETON_ENFORCER) {
      throw new Error('Database is a Singleton — use Database.getInstance() instead of "new Database()"');
    }
    this._store = jsonDb; // delegate actual persistence to the existing json-file store
    this._accessCount = 0;
    this._createdAt = new Date().toISOString();
  }

  static getInstance() {
    if (!Database._instance) {
      Database._instance = new Database(SINGLETON_ENFORCER);
    }
    Database._instance._accessCount += 1;
    return Database._instance;
  }

  get users() { return this._store.users; }
  get products() { return this._store.products; }
  get orders() { return this._store.orders; }
  get suppliers() { return this._store.suppliers; }

  stats() {
    return { createdAt: this._createdAt, accessCount: this._accessCount };
  }
}

const SINGLETON_ENFORCER = Symbol('SINGLETON_ENFORCER');
Database._instance = null;

module.exports = Database;
