@256
D=A
@SP
M=D
@400
D=A
@LCL
M=D
@500
D=A
@ARG
M=D
@600
D=A
@THIS
M=D
@700
D=A
@THAT
M=D
@$ret.0
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@5
D=A
@SP
D=M-D
@0
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Sys.init
0;JMP
//writing label
($ret.0)
@ARG
A=M
A=A+1
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
A=M
D=M
@3
A=A+1
M=D
@0
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
A=M
D=M
@THAT
A=M
M=D
@1
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
A=M
D=M
@THAT
A=M
A=A+1
M=D
@ARG
A=M
D=M
@SP
A=M
M=D
@SP
M=M+1
@2
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
D=M-D
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
A=M
D=M
@ARG
A=M
M=D
//writing label
(MAIN_LOOP_START)
@ARG
A=M
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
A=M
D=M
@COMPUTE_ELEMENT
D;JNE
@END_PROGRAM
0;JMP
//writing label
(COMPUTE_ELEMENT)
@THAT
A=M
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
A=M
A=A+1
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
D=M+D
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
A=M
D=M
@THAT
A=M
A=A+1
A=A+1
M=D
@3
A=A+1
D=M
@SP
A=M
M=D
@SP
M=M+1
@1
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
D=M+D
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
A=M
D=M
@3
A=A+1
M=D
@ARG
A=M
D=M
@SP
A=M
M=D
@SP
M=M+1
@1
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
D=M-D
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
A=M
D=M
@ARG
A=M
M=D
@MAIN_LOOP_START
0;JMP
//writing label
(END_PROGRAM)
(END)
@END
0;JMP
