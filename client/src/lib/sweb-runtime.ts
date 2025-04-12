import { apiRequest } from './queryClient';

// Interface for storing and retrieving app state
export class SWebRuntime {
  private appId: number | null = null;
  private currentCode: string = '';
  private compiledHtml: string = '';
  private compiledJs: string = '';
  private compiledCss: string = '';

  // Set the current app ID
  public setAppId(id: number) {
    this.appId = id;
  }

  // Get the current app ID
  public getAppId(): number | null {
    return this.appId;
  }

  // Set the current SWeb code
  public setCode(code: string) {
    this.currentCode = code;
  }

  // Get the current SWeb code
  public getCode(): string {
    return this.currentCode;
  }

  // Set the compiled output
  public setCompiledOutput(html: string, js: string, css: string) {
    this.compiledHtml = html;
    this.compiledJs = js;
    this.compiledCss = css;
  }

  // Get the compiled HTML
  public getHtml(): string {
    return this.compiledHtml;
  }

  // Get the compiled JavaScript
  public getJs(): string {
    return this.compiledJs;
  }

  // Get the compiled CSS
  public getCss(): string {
    return this.compiledCss;
  }

  // Save the current app to the server
  public async saveApp(name: string, description: string = ''): Promise<any> {
    try {
      const response = await apiRequest('POST', '/api/apps', {
        name,
        description,
        code: this.currentCode
      });
      
      const data = await response.json();
      this.appId = data.id;
      return data;
    } catch (error) {
      console.error('Failed to save app:', error);
      throw error;
    }
  }

  // Update an existing app
  public async updateApp(): Promise<any> {
    if (!this.appId) {
      throw new Error('No app ID set. Cannot update.');
    }

    try {
      const response = await apiRequest('PUT', `/api/apps/${this.appId}`, {
        code: this.currentCode
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update app:', error);
      throw error;
    }
  }

  // Load an app from the server
  public async loadApp(id: number): Promise<any> {
    try {
      const response = await fetch(`/api/apps/${id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load app: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.appId = data.id;
      this.currentCode = data.code;
      return data;
    } catch (error) {
      console.error('Failed to load app:', error);
      throw error;
    }
  }

  // Execute the app by sending the user to the run view
  public async executeApp(): Promise<void> {
    if (!this.appId && this.currentCode) {
      // If we have code but no ID, save first
      await this.saveApp('Untitled App');
    } else if (this.appId) {
      // If we have an ID, update the app
      await this.updateApp();
    }

    // Redirect to the run page for this app
    if (this.appId) {
      window.location.href = `/run/${this.appId}`;
    }
  }

  // Save data for a model
  public async saveModelData(modelName: string, data: any): Promise<any> {
    if (!this.appId) {
      throw new Error('No app ID set. Cannot save data.');
    }

    try {
      const response = await apiRequest('POST', '/api/data', {
        appId: this.appId,
        modelName,
        data
      });
      
      return await response.json();
    } catch (error) {
      console.error('Failed to save model data:', error);
      throw error;
    }
  }

  // Get data for a model
  public async getModelData(modelName: string): Promise<any[]> {
    if (!this.appId) {
      throw new Error('No app ID set. Cannot get data.');
    }

    try {
      const response = await fetch(`/api/apps/${this.appId}/data/${modelName}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get model data: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get model data:', error);
      throw error;
    }
  }
}

// Singleton instance
export const swebRuntime = new SWebRuntime();
