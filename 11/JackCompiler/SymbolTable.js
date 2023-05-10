module.exports = class SymbolTable {
  constructor() {
    this.table = new Map();
  }

  reset() {
    this.table.clear();
  }

  define(name, dataType, kind) {
    let index = this.varCount(kind) + 1;
    this.table.set(name, { dataType, kind, index });
  }

  varCount(kind) {
    let count = 0;
    this.table.forEach((row) => {
      if (row.kind == kind) count++;
    });
    return count;
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
