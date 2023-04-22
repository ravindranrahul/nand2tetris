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
let callStack = [];
let functionReturnCount = new Map();

module.exports = class CodeWriter{
  
  constructor(filePath){
   this.fs = fs.createWriteStream(filePath);
   this.labelCount=0;
   this.init();
  }
 
  init(){
   this.setPointerValue('SP',256);
   this.setPointerValue('LCL',400);
   this.setPointerValue('ARG',500);
   this.setPointerValue('THIS',600);
   this.setPointerValue('THAT',700);
   this.writeCall('Sys.init',0);
   }

  setPointerValue(pointer,value){
   this.writeLine(`@${value}`);
   this.writeLine('D=A');
   this.writeLine(`@${pointer}`);
   this.writeLine('M=D');
  }
  setFileName(fileName){
   this.sourceFileName=fileName;
  }

  writeLine(output){
    this.fs.write(output+"\n");
  }

  writeComment(comment){
   this.writeLine('//'+comment);
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
      if(segment=="static"){
       return this.writeLine(`@${this.sourceFileName}.${index}`);
      }
       
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
  
  writeLabel(label){
   this.writeLine('//writing label');
   this.writeLine(`(${label})`);
  }

  writeGoto(label){
   this.writeLine(`@${label}`);
   this.writeLine('0;JMP');
  }

  writeIf(label){
   this.pop();
   this.writeLine('D=M');
   this.writeLine(`@${label}`);
   this.writeLine('D;JNE');
  }

  getFunctionScope(functionName){
      return `${this.sourceFileName}.${functionName}`;
  }
   
  writeFunction(functionName,nVars){
   callStack.push(functionName);
   this.writeLabel(functionName,false);
   for(let i=0; i<nVars; i++){
      this.writePushPop(constants.C_PUSH,'constant',0);
   }
  }

  getCurrentFunctionName(){
    return callStack[callStack.length-1] ?? "";
  }

  getReturnCount(){
      let currentFunctionName = this.getCurrentFunctionName();
      if(!functionReturnCount.has(currentFunctionName)) functionReturnCount.set(currentFunctionName,0);
      let returnCount = functionReturnCount.get(currentFunctionName);
      functionReturnCount.set(currentFunctionName,returnCount+1);

      return returnCount;
  }

  savePointerToStackFrame(pointer){
      this.writeLine(`@${pointer}`);
      this.writeLine('D=M');
      this.push();
  }


  writeCall(functionName,nArgs){

   let returnCount = this.getReturnCount();
   let currentFunctionName = this.getCurrentFunctionName();
   let returnLabel = `${currentFunctionName}$ret.${returnCount}`;
   this.writePushPop(constants.C_PUSH,'constant',returnLabel);

   this.savePointerToStackFrame('LCL');
   this.savePointerToStackFrame('ARG');
   this.savePointerToStackFrame('THIS');
   this.savePointerToStackFrame('THAT');


   this.writeLine('@5');
   this.writeLine('D=A');
   this.writeLine('@SP');
   this.writeLine('D=M-D');
   this.writeLine(`@${nArgs}`);
   this.writeLine('D=D-A');
   this.writeLine('@ARG');
   this.writeLine('M=D');

   this.writeLine('@SP');
   this.writeLine('D=M');
   this.writeLine('@LCL');
   this.writeLine('M=D');

   this.writeGoto(functionName,false);
   this.writeLabel(returnLabel,false);


  }

 
  copyFromBaseFrameOffsetToSymbol(offset,addressLabel){
    this.writeLine(`@${offset}`);
    this.writeLine('D=A');
    this.writeLine('@R13');
    this.writeLine('D=M-D');

    this.writeLine('A=D');
    this.writeLine('D=M');
    this.writeLine(`@${addressLabel}`);
    this.writeLine('M=D');
  }
  
  writeReturn(){

    // R13 = Base frame
    this.writeLine("@LCL");
    this.writeLine("D=M");
    this.writeLine("@R13");
    this.writeLine("M=D");

    //Save return address to R14
    this.copyFromBaseFrameOffsetToSymbol(5,'R14');
   
    this.writePushPop(constants.C_POP,'argument',0);

    // SP = @ARG + 1
    this.writeLine('@1');
    this.writeLine('D=A');
    this.writeLine('@ARG');
    this.writeLine('D=M+D');
    this.writeLine('@SP');
    this.writeLine('M=D');

    this.copyFromBaseFrameOffsetToSymbol(1,'THAT');
    this.copyFromBaseFrameOffsetToSymbol(2,'THIS');
    this.copyFromBaseFrameOffsetToSymbol(3,'ARG');
    this.copyFromBaseFrameOffsetToSymbol(4,'LCL');

    // Jump to return
    this.writeLine('@R14');
    this.writeLine('A=M');
    this.writeLine('0;JMP');

    callStack.pop();
  }

  close(){
    this.writeLine("(END)");
    this.writeLine("@END");
    this.writeLine("0;JMP");
    this.fs.close();
  }
}
