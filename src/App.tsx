import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
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
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));

const queryClient = new QueryClient();

type RedirectState = {
  from?: {
    pathname: string;
    search?: string;
    hash?: string;
  };
};

const getRouterBasename = () => {
  if (typeof window === "undefined") return undefined;

  if (window.location.hostname.endsWith("github.io")) {
    const [firstPathSegment] = window.location.pathname.split("/").filter(Boolean);
    return firstPathSegment ? `/${firstPathSegment}` : undefined;
  }

  return undefined;
};

const getRedirectPath = (location: { search: string; state: unknown }) => {
  const redirectParam = new URLSearchParams(location.search).get("redirect");

  if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
    return redirectParam;
  }

  const from = (location.state as RedirectState | null)?.from;
  if (!from?.pathname) return null;

  return `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`;
};

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;

  if (!user) {
    const redirectPath = `${location.pathname}${location.search}${location.hash}`;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
        replace
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (user) return <Navigate to={getRedirectPath(location) ?? "/dashboard"} replace />;

  return <>{children}</>;
};

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
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/reset-password" element={<ResetPassword />} />
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
