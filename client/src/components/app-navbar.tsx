import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Code2, BookOpen, Home } from 'lucide-react';

const AppNavbar = () => {
  return (
    <nav className="border-b shadow-sm py-3 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center mr-8 text-xl font-bold text-blue-600">
            <Code2 className="w-6 h-6 mr-2" />
            SWeb
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <Home className="w-4 h-4 mr-1" />
              Home
            </Link>
            <Link href="/editor" className="flex items-center text-gray-600 hover:text-gray-900">
              <Code2 className="w-4 h-4 mr-1" />
              Editor
            </Link>
            <Link href="/docs" className="flex items-center text-gray-600 hover:text-gray-900">
              <BookOpen className="w-4 h-4 mr-1" />
              Documentation
            </Link>
          </div>
        </div>
        
        <div>
          <Link href="/editor">
            <Button size="sm">
              Create App
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
