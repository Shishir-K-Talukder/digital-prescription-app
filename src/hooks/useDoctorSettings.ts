import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PrintSettings, defaultPrintSettings } from "@/components/PrintPreview";
import { MedicineOptions, loadMedicineOptions } from "@/components/MedicineSettings";
import { Json } from "@/integrations/supabase/types";

export const useDoctorSettings = () => {
  const { user } = useAuth();
  const [printSettings, setPrintSettings] = useState<PrintSettings>(defaultPrintSettings);
  const [medicineOptions, setMedicineOptions] = useState<MedicineOptions>(loadMedicineOptions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("doctor_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load doctor settings:", error);
      setLoading(false);
      return;
    }

    if (data) {
      if (data.print_settings && typeof data.print_settings === "object") {
        setPrintSettings({ ...defaultPrintSettings, ...(data.print_settings as Record<string, unknown>) } as PrintSettings);
      }
      if (data.medicine_options && typeof data.medicine_options === "object") {
        const stored = data.medicine_options as Record<string, unknown>;
        const defaults = loadMedicineOptions();
        const rawFollowUp = Array.isArray(stored.followUpOptions) ? stored.followUpOptions : defaults.followUpOptions;
        const migratedFollowUp = rawFollowUp.map((o: any) => typeof o === "string" ? o : o.label ?? String(o));

        setMedicineOptions({
          ...defaults,
          ...stored,
          doses: Array.isArray(stored.doses) ? stored.doses as string[] : defaults.doses,
          durations: Array.isArray(stored.durations) ? stored.durations as string[] : defaults.durations,
          meals: Array.isArray(stored.meals) ? stored.meals as string[] : defaults.meals,
          adviceList: Array.isArray(stored.adviceList) ? stored.adviceList as string[] : defaults.adviceList,
          investigations: Array.isArray(stored.investigations) ? stored.investigations as string[] : defaults.investigations,
          chiefComplaints: Array.isArray(stored.chiefComplaints) ? stored.chiefComplaints as string[] : defaults.chiefComplaints,
          pediatricRules: Array.isArray(stored.pediatricRules) ? stored.pediatricRules as MedicineOptions["pediatricRules"] : defaults.pediatricRules,
          followUpOptions: migratedFollowUp as string[],
        } as MedicineOptions);
      }
    }
    setLoading(false);
  };

  const savePrintSettings = async (settings: PrintSettings) => {
    if (!user) return false;

    const mergedSettings = { ...defaultPrintSettings, ...settings } as PrintSettings;

    const { error } = await supabase
      .from("doctor_settings")
      .upsert({
        user_id: user.id,
        print_settings: mergedSettings as unknown as Json,
      }, { onConflict: "user_id" });

    if (error) {
      console.error("Failed to save print settings:", error);
      return false;
    }

    setPrintSettings(mergedSettings);
    return true;
  };

  const saveMedicineOptions = async (options: MedicineOptions) => {
    if (!user) return;
    setMedicineOptions(options);
    await supabase
      .from("doctor_settings")
      .upsert({
        user_id: user.id,
        medicine_options: options as unknown as Json,
      }, { onConflict: "user_id" });
  };

  return { printSettings, savePrintSettings, medicineOptions, saveMedicineOptions, loading };
};
