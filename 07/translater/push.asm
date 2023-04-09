@256
D=A
@SP
M=D

// RAM[SP] = 7
//D=7
@7
D=A

//RAM[SP]=D
@SP
A=M
M=D

// S++
@SP
M=M+1
