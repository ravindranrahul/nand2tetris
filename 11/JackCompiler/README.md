# SYMBOL TABLE

Symbol table is used to map the variables of a class or subroutine to their corresponding VM Memory segments. Two symbol tables are maintained per class:

## 1. Class level sybmol table

An instance of this symbol table created for each class and reset after its compilation.

| Variable | VM Segment |
| :------: | :--------: |
|  Static  |   static   |
|  Field   |    this    |

## 2. Subroutine level symbol table

An instance of this symbol table maintained for each subroutine and reset after its compilation. Class variables are also in scope for subroutines. Hence, each subroutines has also access to class symbol table.

| Variable | VM Segment |
| :------: | :--------: |
| argument |  argument  |
|  local   |   local    |
