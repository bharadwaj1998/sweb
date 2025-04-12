import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import AppNavbar from "@/components/app-navbar";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import EditorPage from "@/pages/editor";
import DocsPage from "@/pages/docs";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/editor" component={EditorPage} />
      <Route path="/editor/:id" component={EditorPage} />
      <Route path="/docs" component={DocsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <AppNavbar />
        <main className="flex-1">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
