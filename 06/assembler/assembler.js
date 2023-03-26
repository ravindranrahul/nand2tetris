const fs = require('fs');
const Parser =  require('./parser').Parser;
const Code =  require('./code');
const A_INSTRUCTION =  require('./parser').A_INSTRUCTION;
const L_INSTRUCTION =  require('./parser').L_INSTRUCTION;
const gNumber =  require('./parser').gNumber;
const Symbol = require('./symbol');

let assemblyFilePath = process.argv[2];
const parser = new Parser(assemblyFilePath);
const symbol = new Symbol();

const hackFile = fs.createWriteStream(assemblyFilePath.replace('.asm','.hack'));

while(parser.advance()){
   let  instruction =     {
         input: parser.currentInstruction,
         type: parser.instructionType(),
         symbol: parser.symbol(),
         dest: parser.dest(),
         comp: parser.comp(),
         jump: parser.jump()
      };
   let output = '';

   if(instruction.type==A_INSTRUCTION){
      output = '0';
      //digits
      if(gNumber.test(instruction.symbol)){
         output += stringToBinary(instruction.symbol)
      }else{
         output += stringToBinary(symbol.getAddress(instruction.symbol))
      }
   }else if(instruction.type==L_INSTRUCTION){
   }else{
      output = '111';
      output+= Code.comp(instruction.comp);
      output+= Code.dest(instruction.dest);
      output+= Code.jump(instruction.jump);
   }

   if(!output) continue;
   
   hackFile.write(output+'\r\n');
}


function stringToBinary(string){
   return parseInt(string).toString(2).padStart(15,"0");
}

hackFile.close();
