const comp = {
   '0' : '101010',
   '1' : '111111',
   '-1' : '111010',
   'D' : '001100',
   '@' : '110000',
   '!D' : '001101',
   '!@' : '110001',
   '-D' : '001111',
   '-@' : '110011',
   'D+1' : '011111',
   '@+1' : '110111',
   'D-1' : '001110',
   '@-1' : '110010',
   'D+@' : '000010',
   'D-@' : '010011',
   '@-D' : '000111',
   'D&@' : '000000',
   'D|@' : '010101'
};

const jump = {
   '':'000',
   'JGT':'001',
   'JEQ':'010',
   'JGE':'011',
   'JLT':'100',
   'JNE':'101',
   'JLE':'110',
   'JMP':'111'
};
   
module.exports.comp = function (i){
      let msb = i.includes('M') ? '1': '0';
      i = i.replace('A','@').replace('M','@');
      return msb+comp[i];
}

module.exports.dest = function(d){
   let output = "";
   output+= d.includes('A') ? '1' : '0'; 
   output+= d.includes('D') ? '1' : '0'; 
   output+= d.includes('M') ? '1' : '0'; 
   return output;
}

module.exports.jump = function (j){
   return jump[j];
}
