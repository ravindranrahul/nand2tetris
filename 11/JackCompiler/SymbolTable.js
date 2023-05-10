module.exports = class SymbolTable {
  constructor() {
    this.table = new Map();
    this.varCount = new Map();
  }

  reset() {
    this.table.clear();
    this.varCount.clear();
  }

  define(name, dataType, kind) {
    let index = this.varCount.get(kind) || 0;
    this.table.set(name, { dataType, kind, index });
    this.varCount.set(kind, ++index);
  }

  varCount(kind) {
    return this.varCount.get(kind);
  }

  kindOf(name) {
    return this.table.get(name)?.kind;
  }

  dataTypeof(name) {
    return this.table.get(name)?.dataType;
  }

  indexOf(name) {
    return this.table.get(name)?.index;
  }
};
