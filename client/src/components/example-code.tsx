import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { swebRuntime } from '@/lib/sweb-runtime';
import { useToast } from '@/hooks/use-toast';

interface ExampleProps {
  title: string;
  description: string;
  code: string;
}

const ExampleCode: React.FC<ExampleProps> = ({ title, description, code }) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleLoad = () => {
    swebRuntime.setCode(code);
    navigate('/editor');
    
    toast({
      title: 'Example Loaded',
      description: `${title} example has been loaded in the editor.`,
      duration: 3000,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-100 p-4 rounded-md h-32 overflow-auto">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
            {code.length > 300 ? `${code.slice(0, 300)}...` : code}
          </pre>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleLoad}>Load in Editor</Button>
      </CardFooter>
    </Card>
  );
};

export default ExampleCode;
