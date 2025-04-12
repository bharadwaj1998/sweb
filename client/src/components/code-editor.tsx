import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { compileSWebCode } from '@/lib/sweb-compiler';
import { swebRuntime } from '@/lib/sweb-runtime';
import { useToast } from '@/hooks/use-toast';

interface CodeEditorProps {
  initialCode?: string;
  onCompile?: (html: string, js: string, css: string) => void;
  onSave?: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  initialCode = '', 
  onCompile,
  onSave
}) => {
  const [code, setCode] = useState(initialCode);
  const [compiledHtml, setCompiledHtml] = useState('');
  const [compiledJs, setCompiledJs] = useState('');
  const [compiledCss, setCompiledCss] = useState('');
  const [activeTab, setActiveTab] = useState('code');
  const [error, setError] = useState<string | null>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Update runtime with initial code
  useEffect(() => {
    if (initialCode) {
      swebRuntime.setCode(initialCode);
    }
  }, [initialCode]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    swebRuntime.setCode(newCode);
  };

  const handleCompile = () => {
    try {
      setError(null);
      const { html, js, css } = compileSWebCode(code);
      setCompiledHtml(html);
      setCompiledJs(js);
      setCompiledCss(css);
      
      // Update runtime
      swebRuntime.setCompiledOutput(html, js, css);
      
      // Call onCompile callback if provided
      if (onCompile) {
        onCompile(html, js, css);
      }
      
      // Show success toast
      toast({
        title: "Compilation Successful",
        description: "Your SWeb code has been compiled successfully.",
        duration: 3000,
      });
      
      // Automatically switch to preview tab
      setActiveTab('preview');
      
      // Update the preview iframe
      updatePreviewIframe();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Compilation Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleSave = async () => {
    try {
      if (swebRuntime.getAppId()) {
        await swebRuntime.updateApp();
      } else {
        const appName = prompt("Enter a name for your app:", "My SWeb App");
        if (!appName) return;
        await swebRuntime.saveApp(appName);
      }
      
      toast({
        title: "App Saved",
        description: "Your SWeb app has been saved successfully.",
        duration: 3000,
      });
      
      if (onSave) {
        onSave();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Save Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleRun = async () => {
    try {
      await swebRuntime.executeApp();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Run Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const updatePreviewIframe = () => {
    if (previewIframeRef.current) {
      const iframe = previewIframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>${compiledCss}</style>
            </head>
            <body>
              ${compiledHtml}
              <script>${compiledJs}</script>
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Button variant="default" onClick={handleCompile} className="mr-2">
            Compile
          </Button>
          <Button variant="outline" onClick={handleSave} className="mr-2">
            Save
          </Button>
          <Button variant="secondary" onClick={handleRun}>
            Run App
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="js">JavaScript</TabsTrigger>
          <TabsTrigger value="css">CSS</TabsTrigger>
        </TabsList>

        <div className="flex-1 mt-4">
          <TabsContent value="code" className="h-full">
            {error && (
              <Card className="mb-4 border-red-500">
                <CardContent className="pt-6 text-red-500">
                  <h3 className="font-semibold mb-2">Compilation Error</h3>
                  <pre className="whitespace-pre-wrap text-sm">{error}</pre>
                </CardContent>
              </Card>
            )}
            <textarea
              value={code}
              onChange={handleCodeChange}
              className="w-full h-[calc(100vh-300px)] p-4 font-mono text-sm bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              spellCheck="false"
            />
          </TabsContent>

          <TabsContent value="preview" className="h-full">
            <div className="w-full h-[calc(100vh-300px)] bg-white border rounded-md overflow-hidden">
              <iframe 
                ref={previewIframeRef}
                className="w-full h-full"
                title="Preview"
                sandbox="allow-scripts"
              />
            </div>
          </TabsContent>

          <TabsContent value="html" className="h-full">
            <pre className="w-full h-[calc(100vh-300px)] p-4 font-mono text-sm bg-gray-50 border rounded-md overflow-auto">
              {compiledHtml}
            </pre>
          </TabsContent>

          <TabsContent value="js" className="h-full">
            <pre className="w-full h-[calc(100vh-300px)] p-4 font-mono text-sm bg-gray-50 border rounded-md overflow-auto">
              {compiledJs}
            </pre>
          </TabsContent>

          <TabsContent value="css" className="h-full">
            <pre className="w-full h-[calc(100vh-300px)] p-4 font-mono text-sm bg-gray-50 border rounded-md overflow-auto">
              {compiledCss}
            </pre>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default CodeEditor;
