import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Stethoscope, HeartPulse, Home, ArrowLeft, Pill, Syringe, Activity } from "lucide-react";

const medicalQuotes = [
  "Even the best doctors sometimes lose their way...",
  "This page needs a prescription we can't fill.",
  "The diagnosis: Page Not Found. The cure: Go Home.",
  "No vital signs detected on this route.",
];

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [quote] = useState(() => medicalQuotes[Math.floor(Math.random() * medicalQuotes.length)]);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 relative overflow-hidden">
      {/* Floating medical icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Pill className="absolute top-[15%] left-[10%] w-8 h-8 text-primary/10 animate-pulse" style={{ animationDelay: "0s" }} />
        <Syringe className="absolute top-[25%] right-[15%] w-10 h-10 text-primary/8 animate-pulse" style={{ animationDelay: "1s" }} />
        <Activity className="absolute bottom-[20%] left-[20%] w-12 h-12 text-primary/8 animate-pulse" style={{ animationDelay: "0.5s" }} />
        <HeartPulse className="absolute bottom-[30%] right-[10%] w-8 h-8 text-destructive/10 animate-pulse" style={{ animationDelay: "1.5s" }} />
        <Stethoscope className="absolute top-[60%] left-[5%] w-10 h-10 text-primary/6 animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="text-center max-w-lg relative z-10">
        {/* ECG-style line */}
        <div className="flex items-center justify-center mb-6">
          <svg viewBox="0 0 300 60" className="w-72 h-12 text-destructive/40">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              points="0,30 40,30 50,30 60,10 70,50 80,30 90,30 130,30 140,30 150,10 160,50 170,30 180,30 220,30 230,30 240,10 250,50 260,30 300,30"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Stethoscope icon with glow */}
        <div className="relative mx-auto mb-6 w-28 h-28">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "3s" }} />
          <div className="absolute inset-0 rounded-full bg-primary/15 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center shadow-lg">
            <Stethoscope className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* 404 text */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <HeartPulse className="w-5 h-5 text-destructive animate-pulse" />
          <span className="text-7xl font-extrabold text-foreground tracking-tighter">4</span>
          <div className="w-14 h-14 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center">
            <HeartPulse className="w-7 h-7 text-destructive animate-pulse" />
          </div>
          <span className="text-7xl font-extrabold text-foreground tracking-tighter">4</span>
          <HeartPulse className="w-5 h-5 text-destructive animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-sm text-muted-foreground mb-2 italic">"{quote}"</p>
        <p className="text-xs text-muted-foreground/70 mb-8">
          Route: <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">{location.pathname}</code>
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            className="gap-2 rounded-full px-8 border-2 hover:border-primary/50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            size="lg"
            className="gap-2 rounded-full px-8 shadow-lg hover:shadow-xl transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Clinic
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-14 flex items-center justify-center gap-2 text-xs text-muted-foreground/50">
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
            <span className="text-xs font-serif italic text-primary">℞</span>
          </div>
          <span className="font-medium">Digital Prescription App</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
