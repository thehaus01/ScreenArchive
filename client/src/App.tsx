import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Upload from "@/pages/upload";
import Auth from "@/pages/auth";
import Edit from "./pages/edit"; // Added import for Edit component

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user?.isAdmin) {
    setLocation("/auth");
    return null;
  }

  return <Component />;
}

function Navigation() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  console.log("Current location:", location);

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Upload button clicked");
    setLocation("/upload");
  };

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <span className="text-xl font-bold cursor-pointer">UI Archive</span>
        </Link>
        <div className="flex items-center gap-4">
          {user?.isAdmin ? (
            <>
              <Link href="/upload">
                <Button onClick={handleUploadClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Screenshot
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setLocation("/auth")}>Sign In</Button>
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
        <Route path="/auth" component={Auth} />
        <Route path="/upload" component={({ params }) => (
          <ProtectedRoute component={Upload} />
        )} />
        <Route path="/edit/:id" component={Edit} /> {/* Added edit route */}
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