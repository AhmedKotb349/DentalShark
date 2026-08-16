/**
 * COMMAND PATTERN
 * -------------------------------------------------------------------------
 * Every cart mutation (add item, remove item, change quantity) is wrapped
 * in a Command object with execute()/undo() instead of the UI calling
 * setState functions directly. CommandManager keeps a history stack, so
 * the cart sidebar's "Undo Last Action" button just calls
 * `commandManager.undoLast()` without knowing what kind of action it was
 * undoing — the command itself remembers how to reverse itself.
 *
 * `cartApi` passed into each command is the small slice of CartContext
 * (addItem/removeItem/updateQty/findQty) the command needs — this keeps
 * the pattern decoupled from React itself so it's testable in isolation.
 */

class CartCommand {
  execute() { throw new Error('execute() not implemented'); }
  undo() { throw new Error('undo() not implemented'); }
}

class AddItemCommand extends CartCommand {
  constructor(cartApi, product, qty = 1) {
    super();
    this.cartApi = cartApi;
    this.product = product;
    this.qty = qty;
  }
  execute() { this.cartApi.addItem(this.product, this.qty); }
  undo() { this.cartApi.decrementOrRemove(this.product.id, this.qty); }
  get label() { return `Add "${this.product.name}" x${this.qty}`; }
}

class RemoveItemCommand extends CartCommand {
  constructor(cartApi, product) {
    super();
    this.cartApi = cartApi;
    this.product = product; // full cart line snapshot (id, qty, price, ...) so we can restore it
  }
  execute() { this.cartApi.removeItem(this.product.id); }
  undo() { this.cartApi.restoreItem(this.product); }
  get label() { return `Remove "${this.product.name}"`; }
}

class UpdateQtyCommand extends CartCommand {
  constructor(cartApi, productId, prevQty, newQty) {
    super();
    this.cartApi = cartApi;
    this.productId = productId;
    this.prevQty = prevQty;
    this.newQty = newQty;
  }
  execute() { this.cartApi.updateQty(this.productId, this.newQty); }
  undo() { this.cartApi.updateQty(this.productId, this.prevQty); }
  get label() { return `Change quantity`; }
}

class CommandManager {
  constructor() {
    this.history = [];
  }
  run(command) {
    command.execute();
    this.history.push(command);
    return command;
  }
  undoLast() {
    const command = this.history.pop();
    if (command) command.undo();
    return command || null;
  }
  get canUndo() { return this.history.length > 0; }
  get lastLabel() { return this.history.length ? this.history[this.history.length - 1].label : null; }
}

export { CartCommand, AddItemCommand, RemoveItemCommand, UpdateQtyCommand, CommandManager };
