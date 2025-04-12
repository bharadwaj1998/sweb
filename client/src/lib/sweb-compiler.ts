import { parseSWebCode, type ParsedApp, type Model, type Field, type Form, type View, type List, type Page } from './sweb-parser';

// Generate HTML/JS/CSS from parsed SWeb code
export class SWebCompiler {
  private parsedApp: ParsedApp;
  
  constructor(parsedApp: ParsedApp) {
    this.parsedApp = parsedApp;
  }

  // Generate the model JavaScript code
  private generateModelCode(model: Model): string {
    const fieldsCode = model.fields.map(field => {
      const defaultValue = field.defaultValue !== undefined 
        ? JSON.stringify(field.defaultValue) 
        : 'undefined';
        
      return `  ${field.name}: { 
    type: "${field.type}", 
    required: ${field.required}, 
    defaultValue: ${defaultValue} 
  }`;
    }).join(',\n');

    return `const ${model.name}Model = {
  name: "${model.name}",
  fields: {
${fieldsCode}
  }
};

// Create model data store
const ${model.name}Data = [];

// Functions for ${model.name}
function get${model.name}s() {
  return ${model.name}Data;
}

function get${model.name}(id) {
  return ${model.name}Data.find(item => item.id === id);
}

function create${model.name}(data) {
  const id = Date.now().toString();
  const newItem = { id, ...data };
  ${model.name}Data.push(newItem);
  return newItem;
}

function update${model.name}(id, data) {
  const index = ${model.name}Data.findIndex(item => item.id === id);
  if (index !== -1) {
    ${model.name}Data[index] = { ...${model.name}Data[index], ...data };
    return ${model.name}Data[index];
  }
  return null;
}

function delete${model.name}(id) {
  const index = ${model.name}Data.findIndex(item => item.id === id);
  if (index !== -1) {
    ${model.name}Data.splice(index, 1);
    return true;
  }
  return false;
}`;
  }

  // Generate the form HTML
  private generateFormHTML(form: Form): string {
    const model = this.parsedApp.models.find(m => m.name === form.model);
    if (!model) {
      throw new Error(`Model ${form.model} not found for form ${form.name}`);
    }

    const fieldsToInclude = form.fields.length > 0 
      ? model.fields.filter(field => form.fields.includes(field.name)) 
      : model.fields;

    const formFields = fieldsToInclude.map(field => {
      const required = field.required ? ' required' : '';
      let inputType = 'text';
      let additionalAttributes = '';
      
      switch (field.type) {
        case 'number':
          inputType = 'number';
          break;
        case 'boolean':
          inputType = 'checkbox';
          break;
        case 'date':
          inputType = 'date';
          break;
        case 'text':
        default:
          inputType = 'text';
          if (field.name.toLowerCase().includes('email')) {
            inputType = 'email';
          } else if (field.name.toLowerCase().includes('password')) {
            inputType = 'password';
          }
          break;
      }

      return `
  <div class="sweb-form-group">
    <label for="${form.name}-${field.name}">${field.name.charAt(0).toUpperCase() + field.name.slice(1)}</label>
    <input type="${inputType}" id="${form.name}-${field.name}" name="${field.name}" class="sweb-input"${required}${additionalAttributes} data-field-type="${field.type}">
  </div>`;
    }).join('');

    return `<div id="${form.name}" class="sweb-form-container">
  <h3>${form.name.charAt(0).toUpperCase() + form.name.slice(1)}</h3>
  <form id="${form.name}-form" class="sweb-form" onsubmit="handleSubmit_${form.name}(event)">
${formFields}
    <div class="sweb-form-actions">
      <button type="submit" class="sweb-button sweb-primary">Submit</button>
      <button type="button" class="sweb-button sweb-secondary" onclick="resetForm_${form.name}()">Reset</button>
    </div>
  </form>
</div>`;
  }

  // Generate form JavaScript
  private generateFormJS(form: Form): string {
    return `
// Form handlers for ${form.name}
function handleSubmit_${form.name}(event) {
  event.preventDefault();
  
  const formData = {};
  const formEl = document.getElementById("${form.name}-form");
  const formElements = formEl.elements;
  
  for (let i = 0; i < formElements.length; i++) {
    const element = formElements[i];
    if (element.name && element.name !== "") {
      const fieldType = element.getAttribute('data-field-type');
      
      switch (fieldType) {
        case 'number':
          formData[element.name] = element.value !== "" ? Number(element.value) : null;
          break;
        case 'boolean':
          formData[element.name] = element.checked;
          break;
        default:
          formData[element.name] = element.value;
      }
    }
  }
  
  // Create new data using the model's create function
  const newItem = create${form.model}(formData);
  
  // Reset the form
  resetForm_${form.name}();
  
  // Refresh any lists that show this model
  refreshLists_${form.model}();
  
  return false;
}

function resetForm_${form.name}() {
  document.getElementById("${form.name}-form").reset();
}`;
  }

  // Generate list HTML
  private generateListHTML(list: List): string {
    const model = this.parsedApp.models.find(m => m.name === list.model);
    if (!model) {
      throw new Error(`Model ${list.model} not found for list ${list.name}`);
    }

    const fieldsToInclude = list.fields.length > 0 
      ? model.fields.filter(field => list.fields.includes(field.name)) 
      : model.fields;

    const headers = fieldsToInclude.map(field => 
      `<th>${field.name.charAt(0).toUpperCase() + field.name.slice(1)}</th>`
    ).join('');

    return `<div id="${list.name}" class="sweb-list-container">
  <h3>${list.name.charAt(0).toUpperCase() + list.name.slice(1)}</h3>
  <table class="sweb-table">
    <thead>
      <tr>
        ${headers}
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="${list.name}-body">
      <!-- Items will be inserted here by JS -->
    </tbody>
  </table>
</div>`;
  }

  // Generate list JavaScript
  private generateListJS(list: List): string {
    const model = this.parsedApp.models.find(m => m.name === list.model);
    if (!model) {
      throw new Error(`Model ${list.model} not found for list ${list.name}`);
    }

    const fieldsToInclude = list.fields.length > 0 
      ? model.fields.filter(field => list.fields.includes(field.name)) 
      : model.fields;

    const fieldRenderCode = fieldsToInclude.map(field => {
      let renderCode = '';
      
      switch (field.type) {
        case 'boolean':
          renderCode = `cell.textContent = item.${field.name} ? 'Yes' : 'No';`;
          break;
        default:
          renderCode = `cell.textContent = item.${field.name};`;
      }
      
      return `    const cell${field.name} = row.insertCell();
    ${renderCode}`;
    }).join('\n');

    return `
// List handlers for ${list.name}
function refreshList_${list.name}() {
  const tbody = document.getElementById("${list.name}-body");
  tbody.innerHTML = ""; // Clear the list
  
  const items = get${list.model}s();
  
  items.forEach(item => {
    const row = tbody.insertRow();
    
${fieldRenderCode}
    
    // Actions cell
    const actionsCell = row.insertCell();
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'sweb-button sweb-small';
    editBtn.onclick = () => editItem_${list.model}(item.id);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'sweb-button sweb-small sweb-danger';
    deleteBtn.onclick = () => deleteItem_${list.model}(item.id);
    
    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
  });
}

// This function will be called when the page loads
document.addEventListener('DOMContentLoaded', () => {
  refreshList_${list.name}();
});

// Edit item handler
function editItem_${list.model}(id) {
  const item = get${list.model}(id);
  
  if (item) {
    // This implementation depends on your form structure
    // In a real app, you'd populate a form with the item data
    console.log('Edit item', item);
    
    // For demo, let's just prompt for each field
    const newData = {};
    ${fieldsToInclude.map(field => `
    if (confirm("Edit ${field.name}? Current value: " + item.${field.name})) {
      const newValue = prompt("Enter new value for ${field.name}:", item.${field.name});
      if (newValue !== null) {
        newData.${field.name} = ${field.type === 'number' ? 'Number(newValue)' : field.type === 'boolean' ? 'newValue === "true"' : 'newValue'};
      }
    }`).join('\n')}
    
    // Update the item
    update${list.model}(id, newData);
    
    // Refresh the list
    refreshLists_${list.model}();
  }
}

// Delete item handler
function deleteItem_${list.model}(id) {
  if (confirm("Are you sure you want to delete this item?")) {
    delete${list.model}(id);
    refreshLists_${list.model}();
  }
}`;
  }

  // Generate a function to refresh all lists for a given model
  private generateRefreshListsFunction(model: Model): string {
    const listsForModel = this.parsedApp.lists.filter(list => list.model === model.name);
    
    if (listsForModel.length === 0) {
      return '';
    }
    
    const refreshCalls = listsForModel.map(list => `  refreshList_${list.name}();`).join('\n');
    
    return `
// Refresh all lists that display ${model.name}
function refreshLists_${model.name}() {
${refreshCalls}
}`;
  }

  // Generate page HTML
  private generatePageHTML(page: Page): string {
    const componentsHTML = page.components.map(componentName => {
      // Find the component by name (could be a form, list, or view)
      const form = this.parsedApp.forms.find(f => f.name === componentName);
      if (form) {
        return `<!-- Form: ${componentName} -->
<div class="sweb-component">
  <div id="${componentName}-container"></div>
</div>`;
      }
      
      const list = this.parsedApp.lists.find(l => l.name === componentName);
      if (list) {
        return `<!-- List: ${componentName} -->
<div class="sweb-component">
  <div id="${componentName}-container"></div>
</div>`;
      }
      
      const view = this.parsedApp.views.find(v => v.name === componentName);
      if (view) {
        return `<!-- View: ${componentName} -->
<div class="sweb-component">
  <div id="${componentName}-container"></div>
</div>`;
      }
      
      return `<!-- Unknown component: ${componentName} -->
<div class="sweb-component">
  <div>Component ${componentName} not found</div>
</div>`;
    }).join('\n');

    return `<div id="page-${page.name}" class="sweb-page">
  <h2 class="sweb-page-title">${page.title}</h2>
  <div class="sweb-page-content">
${componentsHTML}
  </div>
</div>`;
  }

  // Generate page JavaScript
  private generatePageJS(page: Page): string {
    const renderComponentCalls = page.components.map(componentName => {
      // Find the component by name (could be a form, list, or view)
      const form = this.parsedApp.forms.find(f => f.name === componentName);
      if (form) {
        return `  // Render form: ${componentName}
  document.getElementById("${componentName}-container").innerHTML = \`
    ${this.generateFormHTML(form).replace(/\$/g, '\\$').replace(/`/g, '\\`')}
  \`;`;
      }
      
      const list = this.parsedApp.lists.find(l => l.name === componentName);
      if (list) {
        return `  // Render list: ${componentName}
  document.getElementById("${componentName}-container").innerHTML = \`
    ${this.generateListHTML(list).replace(/\$/g, '\\$').replace(/`/g, '\\`')}
  \`;
  // Initialize the list
  setTimeout(() => refreshList_${componentName}(), 0);`;
      }
      
      const view = this.parsedApp.views.find(v => v.name === componentName);
      if (view) {
        return `  // Render view: ${componentName}
  document.getElementById("${componentName}-container").innerHTML = \`
    <!-- View rendering would go here -->
  \`;`;
      }
      
      return `  // Unknown component: ${componentName}
  document.getElementById("${componentName}-container").innerHTML = \`
    <div class="sweb-error">Component ${componentName} not found</div>
  \`;`;
    }).join('\n\n');

    return `
// Page handler for ${page.name}
function renderPage_${page.name}() {
  document.body.innerHTML = \`
    <div class="sweb-app">
      <header class="sweb-header">
        <h1>${page.title}</h1>
      </header>
      <main class="sweb-main">
        ${page.components.map(c => `<div id="${c}-container"></div>`).join('\n        ')}
      </main>
      <footer class="sweb-footer">
        <p>Created with SWeb</p>
      </footer>
    </div>
  \`;

${renderComponentCalls}
}

// Initialize page when the DOM is loaded
document.addEventListener('DOMContentLoaded', renderPage_${page.name});`;
  }

  // Generate global CSS
  private generateCSS(): string {
    return `
/* SWeb Framework CSS */
:root {
  --sweb-primary: #4a6cf7;
  --sweb-primary-dark: #3a56d4;
  --sweb-secondary: #6c757d;
  --sweb-secondary-dark: #5a6268;
  --sweb-success: #28a745;
  --sweb-success-dark: #218838;
  --sweb-danger: #dc3545;
  --sweb-danger-dark: #c82333;
  --sweb-background: #ffffff;
  --sweb-text: #212529;
  --sweb-light-text: #6c757d;
  --sweb-border: #dee2e6;
  --sweb-light-background: #f8f9fa;
  --sweb-shadow: rgba(0, 0, 0, 0.1);
  --sweb-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

.sweb-app {
  font-family: var(--sweb-font);
  line-height: 1.5;
  color: var(--sweb-text);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.sweb-header {
  background-color: var(--sweb-primary);
  color: white;
  padding: 1rem;
  text-align: center;
}

.sweb-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.sweb-footer {
  background-color: var(--sweb-light-background);
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--sweb-light-text);
}

.sweb-component {
  margin-bottom: 2rem;
}

.sweb-form-container, .sweb-list-container {
  background-color: var(--sweb-background);
  border-radius: 4px;
  box-shadow: 0 2px 4px var(--sweb-shadow);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.sweb-form-container h3, .sweb-list-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.sweb-form-group {
  margin-bottom: 1rem;
}

.sweb-form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.sweb-input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--sweb-text);
  background-color: var(--sweb-background);
  background-clip: padding-box;
  border: 1px solid var(--sweb-border);
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.sweb-input:focus {
  border-color: var(--sweb-primary);
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(74, 108, 247, 0.25);
}

.sweb-form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.sweb-button {
  display: inline-block;
  font-weight: 400;
  color: var(--sweb-text);
  text-align: center;
  vertical-align: middle;
  user-select: none;
  background-color: transparent;
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 4px;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  cursor: pointer;
}

.sweb-button.sweb-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  margin-right: 0.5rem;
}

.sweb-primary {
  color: white;
  background-color: var(--sweb-primary);
  border-color: var(--sweb-primary);
}

.sweb-primary:hover {
  background-color: var(--sweb-primary-dark);
  border-color: var(--sweb-primary-dark);
}

.sweb-secondary {
  color: white;
  background-color: var(--sweb-secondary);
  border-color: var(--sweb-secondary);
}

.sweb-secondary:hover {
  background-color: var(--sweb-secondary-dark);
  border-color: var(--sweb-secondary-dark);
}

.sweb-danger {
  color: white;
  background-color: var(--sweb-danger);
  border-color: var(--sweb-danger);
}

.sweb-danger:hover {
  background-color: var(--sweb-danger-dark);
  border-color: var(--sweb-danger-dark);
}

.sweb-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.sweb-table th, .sweb-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--sweb-border);
}

.sweb-table thead th {
  background-color: var(--sweb-light-background);
  border-bottom: 2px solid var(--sweb-border);
  font-weight: 600;
}

.sweb-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.sweb-page-title {
  margin-top: 0;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 500;
  text-align: center;
}

.sweb-error {
  color: var(--sweb-danger);
  padding: 1rem;
  border: 1px solid var(--sweb-danger);
  border-radius: 4px;
  margin-bottom: 1rem;
}

/* Make the app responsive */
@media (max-width: 768px) {
  .sweb-main {
    padding: 1rem;
  }
  
  .sweb-form-actions {
    flex-direction: column;
  }
  
  .sweb-button {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
`;
  }

  // Compile the SWeb code to HTML/JS/CSS
  public compile(): { html: string, js: string, css: string } {
    // Start with empty strings for each part
    let html = '';
    let js = '';
    let css = this.generateCSS();

    // If there are pages, use the first page as the main page
    if (this.parsedApp.pages.length > 0) {
      const mainPage = this.parsedApp.pages[0];
      html += this.generatePageHTML(mainPage);
      js += this.generatePageJS(mainPage);
    } else {
      // If no pages, just render all components
      html = `<div class="sweb-app">
  <header class="sweb-header">
    <h1>SWeb Application</h1>
  </header>
  <main class="sweb-main">`;

      // Add forms
      this.parsedApp.forms.forEach(form => {
        html += this.generateFormHTML(form);
        js += this.generateFormJS(form);
      });

      // Add lists
      this.parsedApp.lists.forEach(list => {
        html += this.generateListHTML(list);
        js += this.generateListJS(list);
      });

      html += `  </main>
  <footer class="sweb-footer">
    <p>Created with SWeb</p>
  </footer>
</div>`;
    }

    // Generate model code
    this.parsedApp.models.forEach(model => {
      js += `\n\n// Model: ${model.name}\n`;
      js += this.generateModelCode(model);
      js += this.generateRefreshListsFunction(model);
    });

    return { html, js, css };
  }
}

// Compile SWeb code to HTML, JS, and CSS
export function compileSWebCode(code: string): { html: string, js: string, css: string } {
  const parsedApp = parseSWebCode(code);
  const compiler = new SWebCompiler(parsedApp);
  return compiler.compile();
}
