const fs = require('fs');
const readFile = require('n-readlines');
const Symbol = require('./symbol');
   
const A_INSTRUCTION = 'A_INSTRUCTION';
const C_INSTRUCTION = 'C_INSTRUCTION';
const L_INSTRUCTION = 'L_INSTRUCTION';

const rgComment = /^\/\//
const rgWhiteSpace = /^[\s]*$/
const gAInstruction = /^@/
const gLInstruction = /^\(.*\)$/
const gNumber = /^\d+$/

module.exports.Parser =  class Parser{
  constructor(filePath){
    this.filePath = filePath;
    this.currentInstruction = "";
    this.currentLine = 0;   
    this.baseMemoryAddress=16;
    this.buffer = new readFile(filePath);
    this.symbolTable = new Symbol();
    this.labels = [];
    this.populateLabels();
   }

   isInstruction(lineBuffer){
     let isComment = rgComment.test(lineBuffer);
     let isWhiteSpace= rgWhiteSpace.test(lineBuffer);
     return !isComment && !isWhiteSpace;
   }

   formatInstruction(lineBuffer){
      return lineBuffer.toString().split('//')[0].trim();
   }

   formatLabel(instruction){
     return instruction.replace('(','').replace(')','');
   }

   populateLabels(){
     let file = new readFile(this.filePath);
     let line;
     let lineNumber=-1;
     while (line = file.next()){
          if(!this.isInstruction(line)) continue;

          let instruction = this.formatInstruction(line);

          if(!gLInstruction.test(instruction)) 
          {
            lineNumber++;
            continue;
          }

          let label = this.formatLabel(instruction);
          if(this.symbolTable.contains(label)) continue;

          this.symbolTable.addEntry(label,lineNumber+1);

      }
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

   instructionType(){
      if(gAInstruction.test(this.currentInstruction)) return A_INSTRUCTION;
      if(gLInstruction.test(this.currentInstruction)) return L_INSTRUCTION;
      return C_INSTRUCTION;
   }

   symbol(){
      let symbol = "";
      if(this.instructionType()==L_INSTRUCTION) {
         symbol = this.formatLabel(this.currentInstruction);
      }

      if(this.instructionType()==A_INSTRUCTION) {
          symbol = this.currentInstruction.substring(1);
          let isNotConstant = !gNumber.test(symbol);
          let isNotAlreadyMapped = !this.symbolTable.contains(symbol);
          if(isNotConstant && isNotAlreadyMapped ){
            this.symbolTable.addEntry(symbol,this.baseMemoryAddress); 
            this.baseMemoryAddress++;
          }
      }

      return symbol;
   }

   dest(){
      if(this.instructionType()!=C_INSTRUCTION || !this.currentInstruction.includes("=")) return "";
      return this.currentInstruction.split("=")[0];
   }

   comp(){
      if(this.instructionType()!=C_INSTRUCTION) return "";
      return this.currentInstruction
         .replace("=","")
         .replace(";","")
         .replace(this.dest(),"")
         .replace(this.jump(),"");
   }

   jump(){
      if(this.instructionType()!=C_INSTRUCTION || !this.currentInstruction.includes(";")) return "";
      return this.currentInstruction.split(";")[1];
   }
}

module.exports.A_INSTRUCTION = A_INSTRUCTION;
module.exports.L_INSTRUCTION = L_INSTRUCTION;
module.exports.gNumber = gNumber;
