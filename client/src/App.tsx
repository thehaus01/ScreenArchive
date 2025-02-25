import { Switch, Route, Link } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Upload from "@/pages/upload";

function Navigation() {
  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <span className="text-xl font-bold cursor-pointer">UI Archive</span>
        </Link>
        <Link href="/upload">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Screenshot
          </Button>
        </Link>
      </div>
    </header>
  );
}

function Router() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/upload" component={Upload} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;