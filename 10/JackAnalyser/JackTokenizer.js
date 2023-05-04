const { readFileSync } = require("fs");
const { KEYWORDS, TOKEN_TYPE, SYMBOLS, PATTERN } = require("./constants");

module.exports = class JackTokenizer {
  tokens = [];
  currentToken = null;

  constructor(filePath) {
    let input = new readFileSync(filePath).toString();

    // Remove single-line comments (// ...)
    input = input.replace(/\/\/.*$/gm, "");

    // Remove multi-line comments (/* ... */)
    input = input.replace(/\/\*[\s\S]*?\*\//gm, "");

    // Tokenize the input
    let patternToken = new RegExp(
      `${PATTERN.KEYWORD}|${PATTERN.SYMBOL}|${PATTERN.INTEGER_CONSTANT}|${PATTERN.STRING_CONSTANT}|${PATTERN.IDENTIFIER}`,
      "g"
    );
    this.tokens = input.match(patternToken) || [];
  }

  hasMoreTokens() {
    return this.tokens.length > 0;
  }

  advance() {
    this.currentToken = this.tokens.shift();
  }

  tokenType() {
    if (Object.keys(KEYWORDS).includes(this.currentToken.toUpperCase()))
      return TOKEN_TYPE.KEYWORD;
    if (SYMBOLS.includes(this.currentToken)) return TOKEN_TYPE.SYMBOL;
    if (this.currentToken.match(new RegExp(PATTERN.INTEGER_CONSTANT)))
      return TOKEN_TYPE.INT_CONST;
    if (this.currentToken.match(new RegExp(PATTERN.STRING_CONSTANT)))
      return TOKEN_TYPE.STRING_CONST;
    return TOKEN_TYPE.IDENTIFIER;
  }

  keyword() {
    return Object.keys(KEYWORDS).find(
      (key) => KEYWORDS[key] === this.currentToken
    );
  }

  symbol() {
    return SYMBOLS.find((symbol) => this.currentToken === symbol);
  }

  identifier() {
    return this.currentToken;
  }

  intval() {
    return parseInt(this.currentToken);
  }

  stringVal() {
    return String(this.currentToken);
  }

  getToken() {
    let token = this.currentToken;
    if (this.tokenType() == TOKEN_TYPE.STRING_CONST)
      token = token.replaceAll('"', "");
    return token;
  }
};
