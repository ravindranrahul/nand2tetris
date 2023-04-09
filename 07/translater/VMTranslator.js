const fs = require('fs');
const Parser = require('./Parser');
const CodeWriter = require('./CodeWriter');
const constants = require('./constants');

let vmFilePath = process.argv[2];

const parser = new Parser(vmFilePath);
const codeWriter = new CodeWriter(vmFilePath.replace('.vm','.asm'));


while(parser.advance()){
   let command = parser.currentInstruction;
   let arg1 = parser.arg1();
   let arg2 = parser.arg2();
   if(parser.commandType()==constants.C_PUSH) codeWriter.writePushPop(constants.C_PUSH,arg1,arg2);
   if(parser.commandType()==constants.C_POP) codeWriter.writePushPop(constants.C_POP,arg1,arg2);
   if(parser.commandType()==constants.C_ARITHMETIC) codeWriter.writeArithmetic(command);
}

codeWriter.close();
