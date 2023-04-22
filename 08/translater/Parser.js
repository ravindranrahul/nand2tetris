const fs = require('fs');
const readFile = require('n-readlines');
const constants = require('./constants');
   
const reComment = /^\/\//
const reWhiteSpace = /^[\s]*$/
const reNumber = /^\d+$/

const commandRegex = {
 C_PUSH: /push (?<arg1>\w+) (?<arg2>\w+)/,
 C_POP: /pop (?<arg1>\w+) (?<arg2>\w+)/,
 C_ARITHMETIC: /^(?<operand>add|sub|neg|eq|gt|lt|and|or|not)$/,
 C_LABEL: /^label (?<arg1>.+)/,
 C_GOTO: /^goto (?<arg1>.+)/,
 C_IF: /^if-goto (?<arg1>\w+)/,
 C_FUNCTION: /^function (?<arg1>[\w.]+) (?<arg2>\w+)/,
 C_CALL: /^call (?<arg1>[\w.]+) (?<arg2>\w+)/,
 C_RETURN: /^return/
}

module.exports =  class Parser{

  constructor(filePath){
    this.filePath = filePath;
    this.buffer = new readFile(filePath);
    this.currentInstruction = "";
    this.currentLine = 0;   
   }

   isInstruction(lineBuffer){
     let isComment = reComment.test(lineBuffer);
     let isWhiteSpace= reWhiteSpace.test(lineBuffer);
     return !isComment && !isWhiteSpace;
   }

   formatInstruction(lineBuffer){
      return lineBuffer.toString().split('//')[0].trim();
   }

   advance(){
     let line = this.buffer.next();
     if(!this.isInstruction(line)) {
        this.advance();
     }else{
        this.currentLine++;
        this.currentInstruction=this.formatInstruction(line);
     }
     return line!==false
   }

   commandType(){
    let type;
    Object.keys(commandRegex).forEach(command=>{
      if(commandRegex[command].test(this.currentInstruction)){
         type = constants[command];
      }
    });
    return type;
   }

   arg1(){
    if(this.commandType()==constants.C_ARITHMETIC) return this.currentInstruction;
    let regex = commandRegex[this.commandType()];
    return this.currentInstruction.match(regex).groups.arg1 ?? "";
   }

   arg2(){
    let regex = commandRegex[this.commandType()];
    return this.currentInstruction.match(regex).groups.arg2 ?? "";
   }
   
}

