const fs = require('fs');
const path = require('path');
const Parser = require('./Parser');
const CodeWriter = require('./CodeWriter');
const constants = require('./constants');


let sourcePath = process.argv[2];

const parsedPath = path.parse(sourcePath);
const outputFile = path.join(sourcePath,`${parsedPath.base}.asm`);
const sourceFiles = [];

let commandsWithArg2 = [constants.C_PUSH, constants.C_POP, constants.C_FUNCTION, constants.C_CALL];

const pathIsFile = parsedPath.ext;
if(pathIsFile){
   sourceFiles.push(sourcePath);
}else{
   let vmFiles = fs.readdirSync(sourcePath)
                   .filter(filePath => filePath.endsWith(".vm"))
                   .map(vmFile => path.join(sourcePath,vmFile));
   sourceFiles.push(...vmFiles);
}
   

const codeWriter = new CodeWriter(outputFile);


sourceFiles.forEach((sourceFilePath) => {
   const parser = new Parser(sourceFilePath);
   codeWriter.setFileName(path.basename(sourceFilePath,".vm"));

   while(parser.advance()){
    let command = parser.currentInstruction;
    let arg1, arg2;
    if(parser.commandType()!=constants.C_RETURN) arg1 = parser.arg1();
    if(commandsWithArg2.includes(parser.commandType())) arg2 = parser.arg2();
      
    switch(parser.commandType()) {
         case constants.C_PUSH:
         case constants.C_POP:
            codeWriter.writePushPop(parser.commandType(), arg1, arg2);
            break;
         case constants.C_ARITHMETIC:
            codeWriter.writeArithmetic(command);
            break;
         case constants.C_LABEL:
            codeWriter.writeLabel(arg1);
            break;
         case constants.C_GOTO:
            codeWriter.writeGoto(arg1);
            break;
         case constants.C_IF:
            codeWriter.writeIf(arg1);
            break;
         case constants.C_FUNCTION:
            codeWriter.writeFunction(arg1,arg2);
            break;
         case constants.C_CALL:
            codeWriter.writeCall(arg1,arg2);
            break;
         case constants.C_RETURN:
            codeWriter.writeReturn();
            break;
    }

   }
});

codeWriter.close();
