import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PanelExpiry {
  expiresAt: Date | null;
  daysLeft: number | null;
  isExpired: boolean;
  loading: boolean;
}

export const usePanelExpiry = (): PanelExpiry => {
  const { user } = useAuth();
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("profiles")
      .select("panel_expires_at")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.panel_expires_at) setExpiresAt(new Date(data.panel_expires_at));
        setLoading(false);
      });
  }, [user]);

  const now = new Date();
  const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / 86400000) : null;
  const isExpired = expiresAt ? expiresAt.getTime() < now.getTime() : false;

  return { expiresAt, daysLeft, isExpired, loading };
};
