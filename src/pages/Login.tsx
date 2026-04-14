import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Stethoscope, HeartPulse, Activity } from "lucide-react";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good Morning, Doctor!", emoji: "🌅" };
  if (h < 17) return { text: "Good Afternoon, Doctor!", emoji: "☀️" };
  return { text: "Good Evening, Doctor!", emoji: "🌙" };
};

const getRedirectPath = (location: { search: string; state: unknown }) => {
  const redirectParam = new URLSearchParams(location.search).get("redirect");

  if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
    return redirectParam;
  }

  const from = (location.state as { from?: { pathname: string; search?: string; hash?: string } } | null)?.from;
  if (!from?.pathname) return "/";

  const path = `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`;
  return path === "/login" || path === "/signup" ? "/" : path;
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const greeting = useMemo(getGreeting, []);
  const redirectPath = getRedirectPath(location);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate(redirectPath, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/30 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative medical elements */}
      <div className="absolute top-10 left-10 opacity-[0.06]">
        <Stethoscope className="w-40 h-40 text-primary" strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 right-10 opacity-[0.06]">
        <HeartPulse className="w-32 h-32 text-primary" strokeWidth={1} />
      </div>
      <div className="absolute top-1/3 right-16 opacity-[0.04]">
        <Activity className="w-24 h-24 text-primary" strokeWidth={1} />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header with stethoscope */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
            <Stethoscope className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <p className="text-lg text-primary font-semibold">{greeting.emoji} {greeting.text}</p>
            <h1 className="text-2xl font-bold text-foreground mt-1">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to manage your prescriptions</p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-card rounded-2xl border border-border shadow-xl p-6 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Email Address</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="doctor@clinic.com" required className="mt-1.5 h-12" />
            </div>
            <div>
              <Label className="text-sm font-medium">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="mt-1.5 h-12" />
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot Password?</Link>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground italic">"The art of medicine consists of amusing the patient while nature cures the disease."</p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline font-semibold">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
