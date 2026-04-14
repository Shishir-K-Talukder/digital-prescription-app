import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Stethoscope, LayoutDashboard, User, LogOut, Shield } from "lucide-react";


interface NavAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  variant?: "default" | "destructive";
}

const FloatingNav = ({ actions }: { actions?: NavAction[] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const navItems = [
    { icon: <Stethoscope className="w-5 h-5" />, label: "Write Rx", path: "/" },
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", path: "/dashboard" },
    { icon: <User className="w-5 h-5" />, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-1.5 bg-card/90 backdrop-blur-2xl border border-border/40 rounded-2xl px-3 py-2 shadow-xl shadow-black/[0.08]">
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mr-1 shadow-sm">
          <span className="text-base font-serif italic text-primary-foreground font-bold">℞</span>
        </div>

        {/* Nav items */}
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-9 rounded-full gap-1.5 text-sm transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="sm:hidden">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Extra actions */}
        {actions && actions.length > 0 && (
          <>
            <div className="w-px h-5 bg-border/50 mx-1" />
            {actions.map((action, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                  className={`h-9 rounded-full gap-1.5 text-sm ${
                      action.variant === "destructive" ? "text-destructive hover:text-destructive" : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={action.onClick}
                  >
                    {action.icon}
                    <span className="hidden sm:inline">{action.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="sm:hidden">
                  {action.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </>
        )}

        {/* Logout */}
        <div className="w-px h-5 bg-border/50 mx-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-destructive hover:text-destructive"
              onClick={signOut}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Sign out</TooltipContent>
        </Tooltip>
      </nav>
    </div>
  );
};

export default FloatingNav;
