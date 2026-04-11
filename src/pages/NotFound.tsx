import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Stethoscope, HeartPulse, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Animated medical icon */}
        <div className="relative mx-auto mb-8 w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
          <div className="absolute inset-3 rounded-full bg-primary/20 flex items-center justify-center">
            <Stethoscope className="w-16 h-16 text-primary" />
          </div>
        </div>

        {/* Error code with heartbeat line */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-destructive/50" />
          <HeartPulse className="w-5 h-5 text-destructive animate-pulse" />
          <span className="text-6xl font-bold text-foreground tracking-tight">404</span>
          <HeartPulse className="w-5 h-5 text-destructive animate-pulse" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-destructive/50" />
        </div>

        <h1 className="text-xl font-semibold text-foreground mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          The prescription you're looking for seems to have been misplaced. 
          Let's get you back to your clinic.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2 rounded-full px-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="gap-2 rounded-full px-6"
          >
            <Home className="w-4 h-4" />
            Back to Clinic
          </Button>
        </div>

        {/* Footer branding */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-[10px] font-serif italic text-primary">℞</span>
          </div>
          RxBengal
        </div>
      </div>
    </div>
  );
};

export default NotFound;
