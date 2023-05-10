const JackTokenizer = require("./JackTokenizer");
const path = require("path");
const VMWritter = require("./VMWritter");
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
  VM_MEMORY_SEGMENT,
  SYMBOL_TYPE,
  VM_OPERAND_MAPPING,
} = require("./constants");
const SymbolTable = require("./SymbolTable");

module.exports = class CompilationEngine {
  constructor(inputFile, outputFile) {
    this.writer = new VMWritter(outputFile);
    this.tokenizer = new JackTokenizer(inputFile);
    this.filename = path.parse(inputFile).name;

    this.classSymbolTable = new SymbolTable();
    this.subroutineSymbolTable = new SymbolTable();
    this.subroutineMeta = new Map();
    this.xml = "";
    this.className = "";
  }

  compileClass() {
    this.compile(KEYWORD.CLASS);
    this.className = this.compileIdentifier();
    this.compile(SYMBOL.LEFT_CURLY_BRACKET);
    while (this.tokenizer.currentTokenIncludes(CLASS_VARIABLE_KEYWORDS))
      this.compileClassVarDec();
    while (this.tokenizer.currentTokenIncludes(SUBROUTINE_KEYWORDS))
      this.compileSubroutine();
    this.compile(SYMBOL.RIGHT_CURLY_BRACKET);
  }

  compileIdentifier = () => this.compile(TOKEN_TYPE.IDENTIFIER);

  compileType() {
    if (this.tokenizer.currentTokenIncludes(TYPE_KEYWORDS))
      this.compile(TYPE_KEYWORDS);
    else if (this.tokenizer.tokenType() == TOKEN_TYPE.IDENTIFIER)
      this.compileIdentifier();
  }

  compileClassVarDec() {
    let kind =
      this.compile(CLASS_VARIABLE_KEYWORDS) == "static"
        ? SYMBOL_TYPE.STATIC
        : SYMBOL_TYPE.FIELD;
    let dataType = this.compileType();
    let name = this.compileIdentifier();
    this.classSymbolTable.define(name, dataType, kind);
    while (this.tokenizer.currentTokenIncludes(SYMBOL.COMMA)) {
      this.compile(SYMBOL.COMMA);
      name = this.compileIdentifier();
      this.classSymbolTable.define(name, dataType, kind);
    }
    this.compile(SYMBOL.SEMI_COLON);
  }

  compileSubroutine() {
    this.subroutineSymbolTable.reset();
    this.subroutineMeta.clear();

    let subroutineType = this.compile(SUBROUTINE_KEYWORDS);
    let returnType = this.compile();
    let subroutineName = this.compileIdentifier();

    this.subroutineMeta.set("subroutineType", subroutineType);
    this.subroutineMeta.set("returnType", returnType);
    this.subroutineMeta.set(
      "subroutineName",
      `${this.className}.${subroutineName}`
    );

    this.compile(SYMBOL.LEFT_ROUND_BRACKET);
    this.compileParameterList();
    this.compile(SYMBOL.RIGHT_ROUND_BRACKET);
    this.compileSubroutineBody();
  }

  compileParameterList() {
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
  }

  compileSubroutineBody() {
    this.compile(SYMBOL.LEFT_CURLY_BRACKET);
    while (this.tokenizer.currentTokenIncludes([KEYWORD.VAR]))
      this.compileVarDec();
    let functionName = this.subroutineMeta.get("subroutineName");
    let nVars = this.subroutineSymbolTable.varCount(SYMBOL_TYPE.LOCAL);
    this.writer.writeFunction(functionName, nVars);
    this.compileStatements();
    this.compile(SYMBOL.RIGHT_CURLY_BRACKET);
  }

  compileVarDec() {
    this.compile(KEYWORD.VAR);
    let dataType = this.compileType();
    let name = this.compileIdentifier();
    this.subroutineSymbolTable.define(name, dataType, SYMBOL_TYPE.LOCAL);
    while (this.tokenizer.currentTokenIncludes([SYMBOL.COMMA])) {
      this.compile(SYMBOL.COMMA);
      name = this.compileIdentifier();
      this.subroutineSymbolTable.define(name, dataType, SYMBOL_TYPE.LOCAL);
    }
    this.compile(SYMBOL.SEMI_COLON);
  }

  compileStatements() {
    while (this.tokenizer.currentTokenIncludes(STATEMENT_KEYWORDS)) {
      let currentToken = this.tokenizer.getToken();
      let capitalizedTokenName =
        currentToken.charAt(0).toUpperCase() + currentToken.slice(1);
      let compilerMethodName = `compile${capitalizedTokenName}`;
      this[compilerMethodName]();
    }
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
    this.compile(KEYWORD.DO);
    this.compileSubroutineCall();
    this.compile(SYMBOL.SEMI_COLON);
    this.writer.writePop(VM_MEMORY_SEGMENT.TEMP, 0);
  }

  compileSubroutineCall() {
    let subroutineName = this.compileIdentifier();
    if (this.tokenizer.currentTokenIncludes(SYMBOL.DOT)) {
      this.compile(SYMBOL.DOT);
      subroutineName = `${subroutineName}.${this.compileIdentifier()}`;
    }

    this.compile(SYMBOL.LEFT_ROUND_BRACKET);
    let nArgs = this.compileExpressionList();
    this.compile(SYMBOL.RIGHT_ROUND_BRACKET);
    this.writer.writeFunctionCall(subroutineName, nArgs);
  }

  compileReturn() {
    if (this.subroutineMeta.get("returnType") == KEYWORD.VOID) {
      this.writer.writePush(VM_MEMORY_SEGMENT.CONSTANT, 0);
    }
    this.compile(KEYWORD.RETURN);
    this.writer.writeReturn();
    if (!this.tokenizer.currentTokenIncludes(SYMBOL.SEMI_COLON))
      this.compileExpression();
    this.compile(SYMBOL.SEMI_COLON);
  }

  compileExpression() {
    this.compileTerm();
    while (this.tokenizer.currentTokenIncludes(OPERANDS)) {
      let operand = this.compile(OPERANDS);
      this.compileTerm();
      this.writer.writeArithmetic(VM_OPERAND_MAPPING[operand]);
    }
  }

  compileTerm() {
    this.openTag("term");
    if (this.tokenizer.tokenType() == TOKEN_TYPE.INT_CONST) {
      let constant = this.compile(TOKEN_TYPE.INT_CONST);
      this.writer.writePush(VM_MEMORY_SEGMENT.CONSTANT, constant);
    } else if (this.tokenizer.tokenType() == TOKEN_TYPE.STRING_CONST) {
      this.compile(TOKEN_TYPE.STRING_CONST);
    } else if (this.tokenizer.currentTokenIncludes(CONSTANT_KEYWORDS))
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
    let nArgs = 0;
    if (!this.tokenizer.currentTokenIncludes(SYMBOL.RIGHT_ROUND_BRACKET)) {
      this.compileExpression();
      nArgs++;
    }
    while (!this.tokenizer.currentTokenIncludes(SYMBOL.RIGHT_ROUND_BRACKET)) {
      this.compile(SYMBOL.COMMA);
      this.compileExpression();
      nArgs++;
    }
    return nArgs;
  }

  compile(expected) {
    let currentToken = this.tokenizer.getToken();
    this.tokenizer.advance();
    return currentToken;
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
