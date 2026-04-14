import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";
import NotFound from "./pages/NotFound.tsx";

const Index = lazy(() => import("./pages/Index.tsx"));
const PrintPage = lazy(() => import("./pages/PrintPage.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Signup = lazy(() => import("./pages/Signup.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));

const queryClient = new QueryClient();

const getRouterBasename = () => {
  if (typeof window === "undefined") return undefined;

  if (window.location.hostname.endsWith("github.io")) {
    const [firstPathSegment] = window.location.pathname.split("/").filter(Boolean);
    return firstPathSegment ? `/${firstPathSegment}` : undefined;
  }

  return undefined;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }): React.ReactElement | null => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children as React.ReactElement;
};

const PublicRoute = ({ children }: { children: React.ReactNode }): React.ReactElement | null => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children as React.ReactElement;
};

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>
);

const App = () => {
  const routerBasename = getRouterBasename();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={routerBasename}>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin/login" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/print" element={<PrintPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
