import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import CodeEditor from '@/components/code-editor';
import { swebRuntime } from '@/lib/sweb-runtime';
import { LoaderPinwheel } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EditorPage = () => {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/editor/:id');
  const [initialCode, setInitialCode] = useState('');
  const { toast } = useToast();
  
  // If we have an ID in the URL, load that app
  const appId = match && params ? parseInt(params.id) : null;
  
  const { data: app, isLoading, error } = useQuery({
    queryKey: appId ? [`/api/apps/${appId}`] : null,
    enabled: !!appId,
  });
  
  useEffect(() => {
    // If app is loaded, set the code
    if (app) {
      setInitialCode(app.code);
      swebRuntime.setAppId(app.id);
      swebRuntime.setCode(app.code);
    }
  }, [app]);
  
  const handleCompile = (html: string, js: string, css: string) => {
    // Set compiled output in runtime
    swebRuntime.setCompiledOutput(html, js, css);
  };
  
  const handleSave = () => {
    // After save, update URL if needed
    const currentAppId = swebRuntime.getAppId();
    if (currentAppId && !appId) {
      setLocation(`/editor/${currentAppId}`);
    }
  };
  
  // Show loading state
  if (appId && isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center">
          <LoaderPinwheel className="w-12 h-12 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (appId && error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-8">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Failed to load application.</span>
        </div>
        <button 
          onClick={() => setLocation('/editor')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New App
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">
        {appId ? `Editing: ${app?.name}` : 'Create New SWeb Application'}
      </h1>
      
      <CodeEditor 
        initialCode={initialCode} 
        onCompile={handleCompile}
        onSave={handleSave}
      />
    </div>
  );
};

export default EditorPage;
