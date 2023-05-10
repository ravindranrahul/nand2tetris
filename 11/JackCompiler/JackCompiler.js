const JackTokenizer = require("./JackTokenizer");
const fs = require("fs");
const path = require("path");
const CompilationEngine = require("./CompilationEngine");

let jackFiles = [];

let sourcePath = process.argv[2];
if (sourcePath.endsWith(".jack")) {
  jackFiles.push(sourcePath);
} else {
  let files = fs
    .readdirSync(sourcePath)
    .filter((filePath) => filePath.endsWith(".jack"))
    .map((f) => path.join(sourcePath, f));
  jackFiles.push(...files);
}

for (inputFile of jackFiles) {
  let outputFile = inputFile.replace(".jack", ".vm");
  const compilationEngine = new CompilationEngine(inputFile, outputFile);
  compilationEngine.compileClass();
}
