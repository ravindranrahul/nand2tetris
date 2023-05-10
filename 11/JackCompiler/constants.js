// Terminal constant types
module.exports.TOKEN_TYPE = {
  KEYWORD: "keyword",
  SYMBOL: "symbol",
  IDENTIFIER: "identifier",
  INT_CONST: "integerConstant",
  STRING_CONST: "stringConstant",
};

module.exports.KEYWORD = {
  CLASS: "class",
  CONSTRUCTOR: "constructor",
  FUNCTION: "function",
  METHOD: "method",
  FIELD: "field",
  STATIC: "static",
  VAR: "var",
  INT: "int",
  CHAR: "char",
  BOOLEAN: "boolean",
  VOID: "void",
  TRUE: "true",
  FALSE: "false",
  NULL: "null",
  THIS: "this",
  LET: "let",
  DO: "do",
  IF: "if",
  ELSE: "else",
  WHILE: "while",
  RETURN: "return",
};

module.exports.SYMBOL = {
  LEFT_CURLY_BRACKET: "{",
  RIGHT_CURLY_BRACKET: "}",
  LEFT_ROUND_BRACKET: "(",
  RIGHT_ROUND_BRACKET: ")",
  LEFT_SQUARE_BRACKET: "[",
  RIGHT_SQUARE_BRACKET: "]",
  DOT: ".",
  COMMA: ",",
  SEMI_COLON: ";",
  PLUS: "+",
  MINUS: "-",
  MULTIPLY: "*",
  DIVISION: "/",
  AND: "&",
  OR: "|",
  GREATER_THAN: "<",
  LESS_THAN: ">",
  EQUAL: "=",
  TILDE: "~",
};

module.exports.PATTERN = {
  SYMBOL: "[\\{\\}\\(\\)\\[\\]\\.,;\\+\\-\\*\\/&\\|<>=~]",
  INTEGER_CONSTANT: "[\\d\\.]+",
  STRING_CONSTANT: '".+"',
  KEYWORD: Object.values(module.exports.KEYWORD).join("|"),
  IDENTIFIER: "[a-zA-Z0-9_]+",
};

module.exports.STATEMENT_KEYWORDS = [
  module.exports.KEYWORD.LET,
  module.exports.KEYWORD.IF,
  module.exports.KEYWORD.WHILE,
  module.exports.KEYWORD.DO,
  module.exports.KEYWORD.RETURN,
];

module.exports.SUBROUTINE_KEYWORDS = [
  module.exports.KEYWORD.CONSTRUCTOR,
  module.exports.KEYWORD.FUNCTION,
  module.exports.KEYWORD.METHOD,
];

module.exports.CLASS_VARIABLE_KEYWORDS = [
  module.exports.KEYWORD.STATIC,
  module.exports.KEYWORD.FIELD,
];

module.exports.OPERANDS = [
  module.exports.SYMBOL.PLUS,
  module.exports.SYMBOL.MINUS,
  module.exports.SYMBOL.MULTIPLY,
  module.exports.SYMBOL.DIVISION,
  module.exports.SYMBOL.AND,
  module.exports.SYMBOL.OR,
  module.exports.SYMBOL.GREATER_THAN,
  module.exports.SYMBOL.LESS_THAN,
  module.exports.SYMBOL.EQUAL,
];

module.exports.UNARY_OPERANDS = [
  module.exports.SYMBOL.MINUS,
  module.exports.SYMBOL.TILDE,
];

module.exports.CONSTANT_KEYWORDS = [
  module.exports.KEYWORD.TRUE,
  module.exports.KEYWORD.FALSE,
  module.exports.KEYWORD.NULL,
  module.exports.KEYWORD.THIS,
];

module.exports.TYPE_KEYWORDS = [
  module.exports.KEYWORD.INT,
  module.exports.KEYWORD.CHAR,
  module.exports.KEYWORD.BOOLEAN,
];

module.exports.SYMBOL_TYPE = {
  ARGUMENT: "argument",
  LOCAL: "local",
  STATIC: "static",
  FIELD: "this",
};

module.exports.VM_MEMORY_SEGMENT = {
  ARGUMENT: "argument",
  LOCAL: "local",
  STATIC: "static",
  CONSTANT: "constant",
  THIS: "this",
  THAT: "that",
  THAT: "that",
  POINTER: "pointer",
  TEMP: "temp",
};

module.exports.VM_OPERAND_MAPPING = {
  "+": "add",
  "-": "sub",
  "*": "call Math.multiply 2",
  "/": "call Math.divide 2",
  "&": "and",
  "|": "or",
  "~": "not",
  ">": "gt",
  "<": "lt",
  "=": "eq",
};
