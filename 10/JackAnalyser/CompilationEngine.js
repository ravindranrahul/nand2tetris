const {
  KEYWORD,
  TOKEN_TYPE,
  SYMBOL,
  CLASS_VARIABLE_KEYWORDS,
  STATEMENT_KEYWORDS,
  TYPE_KEYWORDS,
  SUBROUTINE_KEYWORDS,
  CONSTANT_KEYWORDS,
  OPERANDS,
  UNARY_OPERANDS,
} = require("./constants");

module.exports = class CompilationEngine {
  constructor(tokenizer) {
    this.tokenizer = tokenizer;
    this.tokenizer.advance();
    this.xml = "";
  }

  compileClass() {
    this.openTag("class");
    this.compile(KEYWORD.CLASS);
    this.compileIdentifier();
    this.compile(SYMBOL.LEFT_CURLY_BRACKET);
    while (this.tokenizer.currentTokenIncludes(CLASS_VARIABLE_KEYWORDS))
      this.compileClassVarDec();
    while (this.tokenizer.currentTokenIncludes(SUBROUTINE_KEYWORDS))
      this.compileSubroutineDec();
    this.compile(SYMBOL.RIGHT_CURLY_BRACKET);
    this.closeTag("class");
    return this.xml;
  }

  compileIdentifier = () => this.compileTokenType(TOKEN_TYPE.IDENTIFIER);

  compileType() {
    if (this.tokenizer.currentTokenIncludes(TYPE_KEYWORDS))
      this.compile(TYPE_KEYWORDS);
    else if (this.tokenizer.tokenType() == TOKEN_TYPE.IDENTIFIER)
      this.compileIdentifier();
  }

  compileClassVarDec() {
    this.openTag("classVarDec");
    this.compile(CLASS_VARIABLE_KEYWORDS);
    this.compileType();
    this.compileIdentifier();
    while (this.tokenizer.currentTokenIncludes(SYMBOL.COMMA)) {
      this.compile(SYMBOL.COMMA);
      this.compileIdentifier();
    }
    this.compile(SYMBOL.SEMI_COLON);
    this.closeTag("classVarDec");
  }

  compileSubroutineDec() {
    this.openTag("subroutineDec");
    this.compile(SUBROUTINE_KEYWORDS);
    if (this.tokenizer.currentTokenIncludes([KEYWORD.VOID]))
      this.compile(KEYWORD.VOID);
    else this.compileType();
    this.compileIdentifier();
    this.compile(SYMBOL.LEFT_ROUND_BRACKET);
    this.compileParameterList();
    this.compile(SYMBOL.RIGHT_ROUND_BRACKET);
    this.compileSubroutineBody();
    this.closeTag("subroutineDec");
  }

  compileParameterList() {
    this.openTag("parameterList");
    let primitive = this.tokenizer.currentTokenIncludes(TYPE_KEYWORDS);
    let className = this.tokenizer.tokenType == TOKEN_TYPE.IDENTIFIER;
    let isType = primitive || className;
    if (isType) {
      this.compileType();
      this.compileIdentifier();
    }
    while (this.tokenizer.currentToken.includes(SYMBOL.COMMA)) {
      this.compile(SYMBOL.COMMA);
      this.compileType();
      this.compileIdentifier();
    }
    this.closeTag("parameterList");
  }

  compileSubroutineBody() {
    this.openTag("subroutineBody");
    this.compile(SYMBOL.LEFT_CURLY_BRACKET);
    while (this.tokenizer.currentTokenIncludes([KEYWORD.VAR]))
      this.compileVarDec();
    this.compileStatements();
    this.compile(SYMBOL.RIGHT_CURLY_BRACKET);
    this.closeTag("subroutineBody");
  }

  compileVarDec() {
    this.openTag("varDec");
    this.compile(KEYWORD.VAR);
    this.compileType();
    this.compileIdentifier();
    while (this.tokenizer.currentTokenIncludes([SYMBOL.COMMA])) {
      this.compile(SYMBOL.COMMA);
      this.compileIdentifier();
    }
    this.compile(SYMBOL.SEMI_COLON);
    this.closeTag("varDec");
  }

  compileStatements() {
    this.openTag("statements");
    while (this.tokenizer.currentTokenIncludes(STATEMENT_KEYWORDS)) {
      let currentToken = this.tokenizer.getToken();
      let capitalizedTokenName =
        currentToken.charAt(0).toUpperCase() + currentToken.slice(1);
      let compilerMethodName = `compile${capitalizedTokenName}`;
      this[compilerMethodName]();
    }
    this.closeTag("statements");
  }

  compileLet() {
    this.openTag("letStatement");
    this.compile(KEYWORD.LET);
    this.compileVariableOrArrayExpression();
    this.compile(SYMBOL.EQUAL);
    this.compileExpression();
    this.compile(SYMBOL.SEMI_COLON);
    this.closeTag("letStatement");
  }

  compileVariableOrArrayExpression() {
    this.compileIdentifier();
    if (this.tokenizer.currentTokenIncludes(SYMBOL.LEFT_SQUARE_BRACKET)) {
      this.compile(SYMBOL.LEFT_SQUARE_BRACKET);
      this.compileExpression();
      this.compile(SYMBOL.RIGHT_SQUARE_BRACKET);
    }
  }

  compileIf() {
    this.openTag("ifStatement");
    this.compile(KEYWORD.IF);
    this.compileEnclosedExpression();
    this.compileEnclosedStatements();
    if (this.tokenizer.currentTokenIncludes(KEYWORD.ELSE)) {
      this.compile(KEYWORD.ELSE);
      this.compileEnclosedStatements();
    }
    this.closeTag("ifStatement");
  }

  compileEnclosedStatements() {
    this.compile(SYMBOL.LEFT_CURLY_BRACKET);
    this.compileStatements();
    this.compile(SYMBOL.RIGHT_CURLY_BRACKET);
  }

  compileEnclosedExpression() {
    this.compile(SYMBOL.LEFT_ROUND_BRACKET);
    this.compileExpression();
    this.compile(SYMBOL.RIGHT_ROUND_BRACKET);
  }

  compileWhile() {
    this.openTag("whileStatement");
    this.compile(KEYWORD.WHILE);
    this.compileEnclosedExpression();
    this.compileEnclosedStatements();
    this.closeTag("whileStatement");
  }

  compileDo() {
    this.openTag("doStatement");
    this.compile(KEYWORD.DO);
    this.compileSubroutineCall();
    this.compile(SYMBOL.SEMI_COLON);
    this.closeTag("doStatement");
  }

  compileSubroutineCall() {
    this.compileIdentifier();
    if (this.tokenizer.currentTokenIncludes(SYMBOL.DOT)) {
      this.compile(SYMBOL.DOT);
      this.compileIdentifier();
    }
    this.compile(SYMBOL.LEFT_ROUND_BRACKET);
    this.compileExpressionList();
    this.compile(SYMBOL.RIGHT_ROUND_BRACKET);
  }

  compileReturn() {
    this.openTag("returnStatement");
    this.compile(KEYWORD.RETURN);
    if (!this.tokenizer.currentTokenIncludes(SYMBOL.SEMI_COLON))
      this.compileExpression();
    this.compile(SYMBOL.SEMI_COLON);
    this.closeTag("returnStatement");
  }

  compileExpression() {
    this.openTag("expression");
    this.compileTerm();
    while (this.tokenizer.currentTokenIncludes(OPERANDS)) {
      this.compile(OPERANDS);
      this.compileTerm();
    }
    this.closeTag("expression");
  }

  compileTerm() {
    this.openTag("term");
    if (this.tokenizer.tokenType() == TOKEN_TYPE.INT_CONST)
      this.compileTokenType(TOKEN_TYPE.INT_CONST);
    else if (this.tokenizer.tokenType() == TOKEN_TYPE.STRING_CONST)
      this.compileTokenType(TOKEN_TYPE.STRING_CONST);
    else if (this.tokenizer.currentTokenIncludes(CONSTANT_KEYWORDS))
      this.compile(CONSTANT_KEYWORDS);
    else if (this.tokenizer.tokenType() == TOKEN_TYPE.IDENTIFIER)
      if (this.tokenizer.peek() == SYMBOL.DOT) this.compileSubroutineCall();
      else this.compileVariableOrArrayExpression();
    else if (this.tokenizer.currentTokenIncludes(SYMBOL.LEFT_ROUND_BRACKET)) {
      this.compileEnclosedExpression();
    } else {
      this.compile(UNARY_OPERANDS);
      this.compileTerm();
    }
    this.closeTag("term");
  }

  compileExpressionList() {
    this.openTag("expressionList");
    if (!this.tokenizer.currentTokenIncludes(SYMBOL.RIGHT_ROUND_BRACKET))
      this.compileExpression();
    while (!this.tokenizer.currentTokenIncludes(SYMBOL.RIGHT_ROUND_BRACKET)) {
      this.compile(SYMBOL.COMMA);
      this.compileExpression();
    }
    this.closeTag("expressionList");
  }

  compile(expected, type = "token") {
    let currentToken = this.tokenizer.getToken();
    let currentType = this.tokenizer.tokenType();
    let compareString = type == "token" ? currentToken : currentType;
    let condition =
      typeof expected == "string"
        ? expected == compareString
        : expected.includes(compareString);

    if (condition) {
      this.writeTag(currentType, currentToken);
      this.tokenizer.advance();
    } else {
      throw console.error(
        `Comparison mismatch. Expecting "${expected}" found "${compareString}"`
      );
    }
  }

  compileTokenType(type) {
    this.compile(type, type);
  }

  write = (string) => (this.xml = this.xml.concat(string));
  openTag = (tag) => this.write(`<${tag}>\n`);
  closeTag = (tag) => this.write(`</${tag}>\n`);
  escapeCharacters = (string) => {
    return string
      .replaceAll("&", "&amp;")
      .replaceAll(">", "&gt;")
      .replaceAll("<", "&lt;");
  };
  writeTag = (tag, text) =>
    this.write(`<${tag}>${this.escapeCharacters(text)}</${tag}>\n`);
};
