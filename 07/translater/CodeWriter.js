const fs = require('fs');
const constants = require('./constants');

const segmentBasePointers = {
 local: 'LCL',
 argument : 'ARG',
 this: 'THIS',
 that: 'THAT',
 temp: '5',
 pointer: '3',
 static: '16'
}

let staticVariables = [];

module.exports = class CodeWriter{
  
  constructor(filePath){
   this.fs = fs.createWriteStream(filePath);
   this.labelCount=0;
  }

  writeLine(output){
    this.fs.write(output+"\n");
  }

  /**
  * Pushes the value of D register on top of the stack
  */ 
  push(){
    this.writeLine("@SP");
    this.writeLine("A=M");
    this.writeLine("M=D");

    this.writeLine("@SP");
    this.writeLine("M=M+1");
  }

  /**
  * Pops the top of the stack on to M register
  */
  pop(){
    this.writeLine("@SP");
    this.writeLine("M=M-1");
    this.writeLine("A=M");
  }

  writeArithmetic (command){
    switch(command){
     case 'add':
        this.writeBinaryOperation("+");
     break;

     case 'sub':
        this.writeBinaryOperation("-");
     break;
    
     case 'neg':
        this.writeUnaryOperation("-");
     break;

     case 'eq':
     this.writeCondition("JEQ"); 
     break;

     case 'lt':
     this.writeCondition("JLT"); 
     break;
    
     case 'gt':
     this.writeCondition("JGT"); 
     break;

     case 'and':
        this.writeBinaryOperation("&");
     break;

     case 'or':
        this.writeBinaryOperation("|");
     break;
    
     case 'not':
        this.writeUnaryOperation("!");
     break;
    }
  }

  writePushPop(mode,segment,index){
   if(mode==constants.C_PUSH){
      switch(segment){
         case 'constant':
            this.writeLine(`@${index}`);
            this.writeLine("D=A");
            this.push(); 
         break;
         default:
            this.readFromSegmentPushToStack(segment,index);
         break;
      }
   }
   
   if(mode==constants.C_POP) {
      this.popFromStackWriteToSegment(segment,index);
   }
  }
  
  writeBinaryOperation(operand){
     this.pop();
     this.writeLine("D=M");
     this.pop();
     this.writeLine(`D=M${operand}D`);
     this.push();
  }

  writeUnaryOperation(operand){
     this.pop();
     this.writeLine(`D=${operand}M`);
     this.push();
  }

  writeCondition(JMP){
     this.pop();
     this.writeLine("D=M");
     this.pop();
     this.writeLine(`D=M-D`);
     this.writeLine(`@true${this.labelCount}`);
     this.writeLine(`D;${JMP}`);
     this.writeLine("D=0");
     this.writeLine(`@resume${this.labelCount}`);
     this.writeLine("0;JMP");
    
     this.writeLine(`(true${this.labelCount})`);
     this.writeLine("D=-1");

     this.writeLine(`(resume${this.labelCount})`);
     this.push();

     this.labelCount++;
  }

  selectSegmentIndexAddress(segment,index){
      let pointerBasedSegments=["local","argument","this","that"];
   
      this.writeLine(`@${segmentBasePointers[segment]}`);
      
      if(pointerBasedSegments.includes(segment)) this.writeLine('A=M');

      if(segment=="static"){
         if(!staticVariables.includes(index)) staticVariables.push(index);
         index = staticVariables.indexOf(index);
      }

      for(let i=0; i<index; i++){
         this.writeLine('A=A+1');
      }
  }

  readFromSegmentPushToStack(segment,index){
      this.selectSegmentIndexAddress(segment,index);
      this.writeLine('D=M');
      this.push();
  }

  popFromStackWriteToSegment(segment,index){
    this.pop();
    this.writeLine('D=M');
    this.selectSegmentIndexAddress(segment,index);
    this.writeLine('M=D');
  }

  close(){
    this.writeLine("(END)");
    this.writeLine("@END");
    this.writeLine("0;JMP");
    this.fs.close();
  }
}
