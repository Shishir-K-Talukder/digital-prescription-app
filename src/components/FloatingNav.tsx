import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Stethoscope, LayoutDashboard, User, LogOut, Shield } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

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
  const { isAdmin } = useAdmin();

  const navItems = [
    { icon: <Stethoscope className="w-4 h-4" />, label: "Write Rx", path: "/" },
    { icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard", path: "/dashboard" },
    { icon: <User className="w-4 h-4" />, label: "Profile", path: "/profile" },
    ...(isAdmin ? [{ icon: <Shield className="w-4 h-4" />, label: "Admin", path: "/admin" }] : []),
  ];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-1 bg-card/80 backdrop-blur-xl border border-border/50 rounded-full px-2 py-1.5 shadow-lg shadow-black/5">
        {/* Logo */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-1">
          <span className="text-sm font-serif italic text-primary-foreground">℞</span>
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
                  className={`h-8 rounded-full gap-1.5 text-xs transition-all ${
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
                    className={`h-8 rounded-full gap-1.5 text-xs ${
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
              className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Sign out</TooltipContent>
        </Tooltip>
      </nav>
    </div>
  );
};

export default FloatingNav;
