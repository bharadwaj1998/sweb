import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code2, Plus, ArrowRight, Bookmark, List, AlertTriangle } from 'lucide-react';
import ExampleCode from '@/components/example-code';
import { SwebApp } from '@shared/schema';

// Simple example for a contact list
const contactListExample = `// Define a contact model
model Contact {
  field name: text required;
  field email: text required;
  field phone: text;
  field company: text;
  field notes: text;
}

// Create a form to add new contacts
form ContactForm(Contact) {
  name, email, phone, company, notes
}

// Create a list to display contacts
list ContactList(Contact) {
  name, email, phone, company
}

// Define the main page
page ContactManager("Contact Manager") {
  ContactForm, ContactList
}`;

// Simple example for a todo app
const todoExample = `// Define a task model
model Task {
  field title: text required;
  field description: text;
  field dueDate: date;
  field completed: boolean default = false;
  field priority: text;
}

// Create a form to add new tasks
form TaskForm(Task) {
  title, description, dueDate, priority
}

// Create a list to display tasks
list TaskList(Task) {
  title, dueDate, completed, priority
}

// Define the main page
page TodoApp("Todo List Application") {
  TaskForm, TaskList
}`;

const HomePage = () => {
  const { data: apps, isLoading, isError } = useQuery<SwebApp[]>({
    queryKey: ['/api/apps'],
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">SWeb Programming Language</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create SaaS applications with a single file using our custom programming language.
          Define models, forms, and views with simple syntax and let SWeb generate the UI for you.
        </p>
        <div className="mt-8">
          <Link href="/editor">
            <Button size="lg" className="mr-4">
              <Plus className="w-4 h-4 mr-2" />
              Create New App
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" size="lg">
              <Bookmark className="w-4 h-4 mr-2" />
              Read Documentation
            </Button>
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Examples</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <ExampleCode 
            title="Contact Manager" 
            description="A simple contact management application" 
            code={contactListExample} 
          />
          <ExampleCode 
            title="Todo List" 
            description="A task management application" 
            code={todoExample} 
          />
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Applications</h2>
          <Link href="/editor">
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-2 text-gray-600">Loading your applications...</p>
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center text-amber-600 mb-2">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">Error Loading Applications</h3>
              </div>
              <p className="text-gray-600">There was a problem fetching your applications. Please try again later.</p>
            </CardContent>
          </Card>
        ) : apps && apps.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <CardTitle>{app.name}</CardTitle>
                  <CardDescription>
                    {app.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500">
                    <Code2 className="w-4 h-4 mr-1" />
                    <span>Last updated: {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href={`/editor/${app.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/run/${app.id}`}>
                    <Button size="sm">
                      Run <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <List className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first SWeb application to get started
              </p>
              <Link href="/editor">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First App
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
};

export default HomePage;
