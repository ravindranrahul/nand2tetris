const fs = require("fs");
const {
  CONSTANT_KEYWORDS,
  KEYWORD,
  VM_MEMORY_SEGMENT,
} = require("./constants");

module.exports = class VMWritter {
  constructor(outputFile) {
    this.outputStream = fs.createWriteStream(outputFile);
    this.labelCounter = 0;
  }

  write(text) {
    // console.log("writing " + text);
    this.outputStream.write(`${text}\n`);
  }

  writePush(segment, index) {
    this.write(`push ${segment} ${index}`);
  }

  writePop(segment, index) {
    this.write(`pop ${segment} ${index}`);
  }

  writeArithmetic(command) {
    this.write(`${command}`);
  }

  writeLabel(label) {
    this.write(`label ${label}`);
  }

  writeGoto(label) {
    this.write(`goto ${label}`);
  }

  writeIf(label) {
    this.write(`if-goto ${label}`);
  }

  writeFunctionCall(name, nArgs) {
    this.write(`call ${name} ${nArgs}`);
  }

  writeFunction(name, nVars) {
    this.write(`function ${name} ${nVars}`);
  }

  writeReturn() {
    this.write(`return`);
  }

  writeConstantKeyword(keyword) {
    switch (keyword) {
      case KEYWORD.TRUE:
        this.writePush(VM_MEMORY_SEGMENT.CONSTANT, 1);
        this.writeArithmetic("neg");
        break;

      case KEYWORD.NULL:
      case KEYWORD.FALSE:
        this.writePush(VM_MEMORY_SEGMENT.CONSTANT, 0);
        break;

      case KEYWORD.THIS:
        this.writePush(VM_MEMORY_SEGMENT.POINTER, 0);
        break;

      default:
        break;
    }
  }

  getUniqueLabel(label) {
    return `${label}_${this.labelCounter++}`;
  }

  close() {
    this.outputStream.end();
  }
};
