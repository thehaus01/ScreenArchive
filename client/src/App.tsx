import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Upload from "@/pages/upload";
import Edit from "./pages/edit";
import BulkUpload from "./pages/bulk-upload";

function Navigation() {
  const [location, setLocation] = useLocation();
  console.log("Current location:", location);

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <span className="text-xl font-bold cursor-pointer">
            augment code Screenshot Archive
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {location === "/" && (
            <>
              <Link href="/upload">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Screenshot
                </Button>
              </Link>
              <Link href="/bulk-upload">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Multiple
                </Button>
              </Link>
            </>
          )}
        </div>
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
        <Route path="/bulk-upload" component={BulkUpload} />
        <Route path="/edit/:id" component={Edit} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;