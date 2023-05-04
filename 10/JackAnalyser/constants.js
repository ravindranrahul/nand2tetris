// Terminal constant types
module.exports.TOKEN_TYPE = {
  KEYWORD: "keyword",
  SYMBOL: "symbol",
  IDENTIFIER: "identifier",
  INT_CONST: "integerConstant",
  STRING_CONST: "stringConstant",
};

module.exports.KEYWORDS = {
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

module.exports.SYMBOLS = [
  "{",
  "}",
  "(",
  ")",
  "[",
  "]",
  ".",
  ",",
  ";",
  "+",
  "-",
  "*",
  "/",
  "&",
  "|",
  "<",
  ">",
  "=",
  "~",
];

module.exports.PATTERN = {
  SYMBOL: "[\\{\\}\\(\\)\\[\\]\\.,;\\+\\-\\*\\/&\\|<>=~]",
  INTEGER_CONSTANT: "[\\d\\.]+",
  STRING_CONSTANT: '".+"',
  KEYWORD: Object.values(module.exports.KEYWORDS).join("|"),
  IDENTIFIER: "[a-zA-Z0-9_]+",
};
