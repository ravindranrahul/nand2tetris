const JackTokenizer = require("./JackTokenizer");
const fs = require("fs");
const path = require("path");
const { create } = require("xmlbuilder2");
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

for (file of jackFiles) {
  const tokenizer = new JackTokenizer(file);
  //   writeTokenizedFile(tokenizer, file);
  writeCompiledFile(tokenizer, file);
}

function writeTokenizedFile(tokenizer, file) {
  const root = create();
  const tokens = root.ele("tokens");

  while (tokenizer.hasMoreTokens()) {
    tokenizer.advance();
    tokens.ele(tokenizer.tokenType()).txt(tokenizer.getToken());
  }

  const xml = root.end({ prettyPrint: true, headless: true });
  fs.writeFileSync(file.replace(".jack", ".compiledT.xml"), xml);
}

function writeCompiledFile(tokenizer, file) {
  const compilationEngine = new CompilationEngine(tokenizer);
  const xml = compilationEngine.compileClass();
  fs.writeFileSync(file.replace(".jack", ".compiled.xml"), xml);
}
