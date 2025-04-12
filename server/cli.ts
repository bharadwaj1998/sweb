#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import { compileSWebCode } from '../client/src/lib/sweb-compiler';
import { parseSWebCode } from '../client/src/lib/sweb-parser';

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('No command provided.');
  printHelp();
  process.exit(1);
}

// Process commands
const command = args[0];

switch (command) {
  case 'compile':
    compileCommand(args.slice(1));
    break;
  case 'parse':
    parseCommand(args.slice(1));
    break;
  case 'help':
    printHelp();
    break;
  default:
    console.log(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
}

// Print help information
function printHelp() {
  console.log(`
SWeb CLI - Command Line Interface for SWeb

Usage:
  sweb [command] [options]

Commands:
  compile <file>            Compile a .sweb file to HTML, JS, and CSS
  parse <file>              Parse a .sweb file and output its AST
  help                      Show this help message

Options:
  --out <directory>         Output directory for compiled files (default: ./dist)
  --format <format>         Output format for parse command: json or text (default: text)

Examples:
  sweb compile app.sweb --out ./dist
  sweb parse app.sweb --format json
  `);
}

// Compile command implementation
function compileCommand(args: string[]) {
  if (args.length === 0) {
    console.log('No file specified for compilation.');
    process.exit(1);
  }

  const filePath = args[0];
  let outDir = './dist';

  // Check for output directory option
  const outDirIndex = args.indexOf('--out');
  if (outDirIndex !== -1 && args.length > outDirIndex + 1) {
    outDir = args[outDirIndex + 1];
  }

  try {
    // Read the file
    const code = fs.readFileSync(filePath, 'utf-8');
    
    // Compile the code
    const { html, js, css } = compileSWebCode(code);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    
    // Determine base filename without extension
    const baseName = path.basename(filePath, path.extname(filePath));
    
    // Write output files
    fs.writeFileSync(path.join(outDir, `${baseName}.html`), html);
    fs.writeFileSync(path.join(outDir, `${baseName}.js`), js);
    fs.writeFileSync(path.join(outDir, `${baseName}.css`), css);
    
    // Create an index.html file that includes everything
    const indexHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${baseName} - SWeb Application</title>
  <style>
  ${css}
  </style>
</head>
<body>
  ${html}
  <script>
  ${js}
  </script>
</body>
</html>
`;
    
    fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);
    
    console.log(`Successfully compiled ${filePath}`);
    console.log(`Output files written to ${outDir}`);
  } catch (error) {
    console.error('Compilation failed:', error);
    process.exit(1);
  }
}

// Parse command implementation
function parseCommand(args: string[]) {
  if (args.length === 0) {
    console.log('No file specified for parsing.');
    process.exit(1);
  }

  const filePath = args[0];
  let format = 'text';

  // Check for format option
  const formatIndex = args.indexOf('--format');
  if (formatIndex !== -1 && args.length > formatIndex + 1) {
    format = args[formatIndex + 1];
  }

  try {
    // Read the file
    const code = fs.readFileSync(filePath, 'utf-8');
    
    // Parse the code
    const ast = parseSWebCode(code);
    
    // Output the AST in the specified format
    if (format === 'json') {
      console.log(JSON.stringify(ast, null, 2));
    } else {
      console.log('Parsed AST:');
      console.log('Models:', ast.models.length);
      console.log('Forms:', ast.forms.length);
      console.log('Views:', ast.views.length);
      console.log('Lists:', ast.lists.length);
      console.log('Pages:', ast.pages.length);
      
      // Print models
      console.log('\nModels:');
      ast.models.forEach(model => {
        console.log(`- ${model.name} (${model.fields.length} fields)`);
        model.fields.forEach(field => {
          console.log(`  - ${field.name}: ${field.type}${field.required ? ' (required)' : ''}${field.defaultValue !== undefined ? ` (default: ${field.defaultValue})` : ''}`);
        });
      });
      
      // Print forms
      console.log('\nForms:');
      ast.forms.forEach(form => {
        console.log(`- ${form.name} (model: ${form.model}, fields: ${form.fields.join(', ')})`);
      });
      
      // Print lists
      console.log('\nLists:');
      ast.lists.forEach(list => {
        console.log(`- ${list.name} (model: ${list.model}, fields: ${list.fields.join(', ')})`);
      });
      
      // Print pages
      console.log('\nPages:');
      ast.pages.forEach(page => {
        console.log(`- ${page.name} ("${page.title}", components: ${page.components.join(', ')})`);
      });
    }
  } catch (error) {
    console.error('Parsing failed:', error);
    process.exit(1);
  }
}
