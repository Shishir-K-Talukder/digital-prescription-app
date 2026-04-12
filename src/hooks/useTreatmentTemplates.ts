import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Medicine } from "@/components/MedicineSection";
import { toast } from "sonner";

export interface TreatmentTemplate {
  id: string;
  name: string;
  medicines: Medicine[];
  created_at: string;
  updated_at: string;
}

export const useTreatmentTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<TreatmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("treatment_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("name");
    if (!error && data) {
      setTemplates(data.map((t: any) => ({
        id: t.id,
        name: t.name,
        medicines: t.medicines as Medicine[],
        created_at: t.created_at,
        updated_at: t.updated_at,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, [user]);

  const saveTemplate = async (name: string, medicines: Medicine[]) => {
    if (!user) return;
    const { error } = await supabase.from("treatment_templates").insert({
      user_id: user.id,
      name,
      medicines: medicines as any,
    });
    if (error) { toast.error("Failed to save template"); return; }
    toast.success(`Template "${name}" saved`);
    fetchTemplates();
  };

  const updateTemplate = async (id: string, name: string, medicines: Medicine[]) => {
    if (!user) return;
    const { error } = await supabase.from("treatment_templates")
      .update({ name, medicines: medicines as any })
      .eq("id", id);
    if (error) { toast.error("Failed to update template"); return; }
    toast.success(`Template "${name}" updated`);
    fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("treatment_templates").delete().eq("id", id);
    if (error) { toast.error("Failed to delete template"); return; }
    toast.success("Template deleted");
    fetchTemplates();
  };

  return { templates, loading, saveTemplate, updateTemplate, deleteTemplate, refetch: fetchTemplates };
};
