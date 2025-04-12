// SWeb language parser

export type TokenType =
  | 'MODEL'
  | 'FIELD'
  | 'FORM'
  | 'VIEW'
  | 'LIST'
  | 'PAGE'
  | 'IDENTIFIER'
  | 'STRING'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'TEXT'
  | 'DATE'
  | 'OPEN_BRACE'
  | 'CLOSE_BRACE'
  | 'OPEN_PAREN'
  | 'CLOSE_PAREN'
  | 'COLON'
  | 'SEMICOLON'
  | 'COMMA'
  | 'EQUALS'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  col: number;
}

export interface Field {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string | number | boolean;
}

export interface Model {
  name: string;
  fields: Field[];
}

export interface Form {
  name: string;
  model: string;
  fields: string[];
}

export interface View {
  name: string;
  model: string;
  fields: string[];
}

export interface List {
  name: string;
  model: string;
  fields: string[];
}

export interface Page {
  name: string;
  title: string;
  components: string[];
}

export interface ParsedApp {
  models: Model[];
  forms: Form[];
  views: View[];
  lists: List[];
  pages: Page[];
}

export class Lexer {
  private code: string;
  private position: number = 0;
  private line: number = 1;
  private col: number = 1;
  private keywords: Record<string, TokenType> = {
    'model': 'MODEL',
    'field': 'FIELD',
    'form': 'FORM',
    'view': 'VIEW',
    'list': 'LIST',
    'page': 'PAGE',
    'text': 'TEXT',
    'number': 'NUMBER',
    'boolean': 'BOOLEAN',
    'date': 'DATE',
  };

  constructor(code: string) {
    this.code = code;
  }

  private isEOF(): boolean {
    return this.position >= this.code.length;
  }

  private char(): string {
    return this.isEOF() ? '' : this.code[this.position];
  }

  private next(): string {
    const char = this.char();
    this.position++;
    
    if (char === '\n') {
      this.line++;
      this.col = 1;
    } else {
      this.col++;
    }
    
    return char;
  }

  private peek(n: number = 1): string {
    return this.position + n < this.code.length ? this.code[this.position + n] : '';
  }

  private skipWhitespace(): void {
    while (!this.isEOF() && /\s/.test(this.char())) {
      this.next();
    }
  }

  private skipComments(): void {
    if (this.char() === '/' && this.peek() === '/') {
      while (!this.isEOF() && this.char() !== '\n') {
        this.next();
      }
    }
  }

  private readIdentifier(): string {
    let identifier = '';
    while (!this.isEOF() && /[a-zA-Z0-9_]/.test(this.char())) {
      identifier += this.next();
    }
    return identifier;
  }

  private readString(): string {
    let str = '';
    this.next(); // Skip opening quote
    
    while (!this.isEOF() && this.char() !== '"') {
      if (this.char() === '\\' && this.peek() === '"') {
        this.next(); // Skip backslash
      }
      str += this.next();
    }
    
    if (this.char() === '"') {
      this.next(); // Skip closing quote
    }
    
    return str;
  }

  private readNumber(): string {
    let num = '';
    let hasDot = false;
    
    while (!this.isEOF() && (/\d/.test(this.char()) || (this.char() === '.' && !hasDot))) {
      if (this.char() === '.') hasDot = true;
      num += this.next();
    }
    
    return num;
  }

  public nextToken(): Token {
    this.skipWhitespace();
    this.skipComments();
    
    if (this.isEOF()) {
      return { type: 'EOF', value: '', line: this.line, col: this.col };
    }

    const line = this.line;
    const col = this.col;
    const char = this.char();

    switch (char) {
      case '{': return { type: 'OPEN_BRACE', value: this.next(), line, col };
      case '}': return { type: 'CLOSE_BRACE', value: this.next(), line, col };
      case '(': return { type: 'OPEN_PAREN', value: this.next(), line, col };
      case ')': return { type: 'CLOSE_PAREN', value: this.next(), line, col };
      case ':': return { type: 'COLON', value: this.next(), line, col };
      case ';': return { type: 'SEMICOLON', value: this.next(), line, col };
      case ',': return { type: 'COMMA', value: this.next(), line, col };
      case '=': return { type: 'EQUALS', value: this.next(), line, col };
      case '"': {
        const value = this.readString();
        return { type: 'STRING', value, line, col };
      }
      default: {
        if (/[a-zA-Z_]/.test(char)) {
          const value = this.readIdentifier();
          const type = this.keywords[value] || 'IDENTIFIER';
          return { type, value, line, col };
        } else if (/\d/.test(char)) {
          const value = this.readNumber();
          return { type: 'NUMBER', value, line, col };
        } else {
          throw new Error(`Unexpected character: ${char} at line ${line}, column ${col}`);
        }
      }
    }
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    let token = this.nextToken();
    
    while (token.type !== 'EOF') {
      tokens.push(token);
      token = this.nextToken();
    }
    
    tokens.push(token); // Add EOF token
    return tokens;
  }
}

export class Parser {
  private tokens: Token[];
  private position: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private currentToken(): Token {
    return this.tokens[this.position];
  }

  private nextToken(): Token {
    return this.tokens[++this.position];
  }

  private expectToken(type: TokenType): Token {
    const token = this.currentToken();
    
    if (token.type !== type) {
      throw new Error(`Expected token type ${type}, got ${token.type} at line ${token.line}, column ${token.col}`);
    }
    
    return token;
  }

  private parseIdentifier(): string {
    const token = this.expectToken('IDENTIFIER');
    this.nextToken();
    return token.value;
  }

  private parseModel(): Model {
    this.expectToken('MODEL');
    this.nextToken();
    
    const name = this.parseIdentifier();
    
    this.expectToken('OPEN_BRACE');
    this.nextToken();
    
    const fields: Field[] = [];
    
    while (this.currentToken().type !== 'CLOSE_BRACE') {
      if (this.currentToken().type === 'FIELD') {
        fields.push(this.parseField());
      } else {
        this.nextToken();
      }
    }
    
    this.expectToken('CLOSE_BRACE');
    this.nextToken();
    
    return { name, fields };
  }

  private parseField(): Field {
    this.expectToken('FIELD');
    this.nextToken();
    
    const name = this.parseIdentifier();
    
    this.expectToken('COLON');
    this.nextToken();
    
    const type = this.parseIdentifier();
    
    // Check for required flag
    let required = false;
    let defaultValue: string | number | boolean | undefined = undefined;
    
    while (this.currentToken().type === 'IDENTIFIER') {
      const modifier = this.currentToken().value;
      this.nextToken();
      
      if (modifier === 'required') {
        required = true;
      } else if (modifier === 'default') {
        this.expectToken('EQUALS');
        this.nextToken();
        
        const token = this.currentToken();
        switch (token.type) {
          case 'STRING':
            defaultValue = token.value;
            break;
          case 'NUMBER':
            defaultValue = parseFloat(token.value);
            break;
          case 'BOOLEAN':
            defaultValue = token.value === 'true';
            break;
          default:
            throw new Error(`Expected default value at line ${token.line}, column ${token.col}`);
        }
        
        this.nextToken();
      }
    }
    
    this.expectToken('SEMICOLON');
    this.nextToken();
    
    return { name, type, required, defaultValue };
  }

  private parseForm(): Form {
    this.expectToken('FORM');
    this.nextToken();
    
    const name = this.parseIdentifier();
    
    this.expectToken('OPEN_PAREN');
    this.nextToken();
    
    const model = this.parseIdentifier();
    
    this.expectToken('CLOSE_PAREN');
    this.nextToken();
    
    this.expectToken('OPEN_BRACE');
    this.nextToken();
    
    const fields: string[] = [];
    
    while (this.currentToken().type === 'IDENTIFIER') {
      fields.push(this.parseIdentifier());
      
      if (this.currentToken().type === 'COMMA') {
        this.nextToken();
      }
    }
    
    this.expectToken('CLOSE_BRACE');
    this.nextToken();
    
    return { name, model, fields };
  }

  private parseView(): View {
    this.expectToken('VIEW');
    this.nextToken();
    
    const name = this.parseIdentifier();
    
    this.expectToken('OPEN_PAREN');
    this.nextToken();
    
    const model = this.parseIdentifier();
    
    this.expectToken('CLOSE_PAREN');
    this.nextToken();
    
    this.expectToken('OPEN_BRACE');
    this.nextToken();
    
    const fields: string[] = [];
    
    while (this.currentToken().type === 'IDENTIFIER') {
      fields.push(this.parseIdentifier());
      
      if (this.currentToken().type === 'COMMA') {
        this.nextToken();
      }
    }
    
    this.expectToken('CLOSE_BRACE');
    this.nextToken();
    
    return { name, model, fields };
  }

  private parseList(): List {
    this.expectToken('LIST');
    this.nextToken();
    
    const name = this.parseIdentifier();
    
    this.expectToken('OPEN_PAREN');
    this.nextToken();
    
    const model = this.parseIdentifier();
    
    this.expectToken('CLOSE_PAREN');
    this.nextToken();
    
    this.expectToken('OPEN_BRACE');
    this.nextToken();
    
    const fields: string[] = [];
    
    while (this.currentToken().type === 'IDENTIFIER') {
      fields.push(this.parseIdentifier());
      
      if (this.currentToken().type === 'COMMA') {
        this.nextToken();
      }
    }
    
    this.expectToken('CLOSE_BRACE');
    this.nextToken();
    
    return { name, model, fields };
  }

  private parsePage(): Page {
    this.expectToken('PAGE');
    this.nextToken();
    
    const name = this.parseIdentifier();
    
    this.expectToken('OPEN_PAREN');
    this.nextToken();
    
    this.expectToken('STRING');
    const title = this.currentToken().value;
    this.nextToken();
    
    this.expectToken('CLOSE_PAREN');
    this.nextToken();
    
    this.expectToken('OPEN_BRACE');
    this.nextToken();
    
    const components: string[] = [];
    
    while (this.currentToken().type === 'IDENTIFIER') {
      components.push(this.parseIdentifier());
      
      if (this.currentToken().type === 'COMMA') {
        this.nextToken();
      }
    }
    
    this.expectToken('CLOSE_BRACE');
    this.nextToken();
    
    return { name, title, components };
  }

  public parse(): ParsedApp {
    const models: Model[] = [];
    const forms: Form[] = [];
    const views: View[] = [];
    const lists: List[] = [];
    const pages: Page[] = [];
    
    while (this.currentToken().type !== 'EOF') {
      switch (this.currentToken().type) {
        case 'MODEL':
          models.push(this.parseModel());
          break;
        case 'FORM':
          forms.push(this.parseForm());
          break;
        case 'VIEW':
          views.push(this.parseView());
          break;
        case 'LIST':
          lists.push(this.parseList());
          break;
        case 'PAGE':
          pages.push(this.parsePage());
          break;
        default:
          this.nextToken();
      }
    }
    
    return { models, forms, views, lists, pages };
  }
}

// Parse SWeb code into an AST
export function parseSWebCode(code: string): ParsedApp {
  const lexer = new Lexer(code);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}
