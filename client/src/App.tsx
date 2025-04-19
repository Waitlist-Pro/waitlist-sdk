import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Subscribers from "@/pages/subscribers";
import Settings from "@/pages/settings";
import Analytics from "@/pages/analytics";
import Integration from "@/pages/integration";
import Documentation from "@/pages/documentation";
import PreviewPage from "@/pages/preview-page";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { useEffect, useState } from "react";
import { apiRequest } from "./lib/queryClient";

function Router() {
  const [location] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [location]);

  // Check if current location is for preview (which doesn't require auth)
  const isPreviewPage = location.startsWith('/preview/');
  const isAuthPage = location === "/login" || location === "/register";

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Allow preview pages without authentication
  if (!isAuthenticated && !isAuthPage && !isPreviewPage) {
    window.location.href = "/login";
    return null;
  }

  if (isAuthenticated && isAuthPage) {
    window.location.href = "/";
    return null;
  }

  return (
    <>
      {/* Preview route is always accessible regardless of authentication */}
      {isPreviewPage && (
        <Switch>
          <Route path="/preview/:formId" component={PreviewPage} />
        </Switch>
      )}

      {isAuthenticated && !isPreviewPage && (
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar user={user} />
          <MobileMenu />
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/subscribers" component={Subscribers} />
              <Route path="/settings" component={Settings} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/integration" component={Integration} />
              <Route path="/documentation" component={Documentation} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      )}

      {!isAuthenticated && !isPreviewPage && (
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route component={Login} />
        </Switch>
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
