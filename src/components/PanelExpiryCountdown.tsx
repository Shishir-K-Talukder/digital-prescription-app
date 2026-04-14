import { usePanelExpiry } from "@/hooks/usePanelExpiry";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

const PanelExpiryCountdown = () => {
  const { expiresAt, daysLeft, isExpired, loading } = usePanelExpiry();

  if (loading) return null;
  if (!expiresAt) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
        <CheckCircle className="w-4 h-4 text-primary" />
        <span className="text-sm text-muted-foreground">Lifetime access — no expiry set</span>
      </div>
    );
  }

  const color = isExpired ? "destructive" : (daysLeft !== null && daysLeft <= 7) ? "destructive" : (daysLeft !== null && daysLeft <= 30) ? "secondary" : "default";

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${
      isExpired ? "bg-destructive/10 border-destructive/30" : daysLeft !== null && daysLeft <= 7 ? "bg-destructive/5 border-destructive/20" : "bg-primary/5 border-primary/20"
    }`}>
      {isExpired ? (
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
      ) : (
        <Clock className="w-5 h-5 text-primary shrink-0" />
      )}
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          {isExpired ? "Panel Expired" : "Panel Active"}
        </p>
        <p className="text-xs text-muted-foreground">
          {isExpired
            ? `Expired on ${expiresAt.toLocaleDateString()}`
            : `Expires on ${expiresAt.toLocaleDateString()} — ${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`
          }
        </p>
      </div>
      <Badge variant={color} className="text-xs shrink-0">
        {isExpired ? "Expired" : `${daysLeft}d left`}
      </Badge>
    </div>
  );
};

export default PanelExpiryCountdown;
