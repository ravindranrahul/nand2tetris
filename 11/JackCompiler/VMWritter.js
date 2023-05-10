const fs = require("fs");

module.exports = class VMWritter {
  constructor(outputFile) {
    this.outputStream = fs.createWriteStream(outputFile);
  }

  write(text) {
    // console.log("writing " + text);
    this.outputStream.write(`${text}\n`);
  }

  writeArithmetic(command) {
    this.write(`${command}`);
  }

  writePush(segment, index) {
    this.write(`push ${segment} ${index}`);
  }

  writePop(segment, index) {
    this.write(`pop ${segment} ${index}`);
  }

  writeLabel(label) {
    this.write(label);
  }

  writeFunction(name, nVars) {
    this.write(`function ${name} ${nVars}`);
  }

  writeFunctionCall(name, nArgs) {
    this.write(`call ${name} ${nArgs}`);
  }

  writeReturn() {
    this.write(`return`);
  }
  close() {
    this.outputStream.end();
  }
};
