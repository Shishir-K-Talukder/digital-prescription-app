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
    const { data } = await supabase
      .from("doctor_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      if (data.print_settings && typeof data.print_settings === "object") {
        setPrintSettings({ ...defaultPrintSettings, ...(data.print_settings as Record<string, unknown>) } as PrintSettings);
      }
      if (data.medicine_options && typeof data.medicine_options === "object") {
        const stored = data.medicine_options as Record<string, unknown>;
        // Only keep user customizations like types and followUpOptions; use fresh defaults for doses/durations/meals/adviceList
        const defaults = loadMedicineOptions();
        setMedicineOptions({ ...defaults, ...stored, doses: defaults.doses, durations: defaults.durations, meals: defaults.meals, adviceList: defaults.adviceList, investigations: stored.investigations || defaults.investigations, chiefComplaints: stored.chiefComplaints || defaults.chiefComplaints } as MedicineOptions);
      }
    }
    setLoading(false);
  };

  const savePrintSettings = async (settings: PrintSettings) => {
    if (!user) return;
    setPrintSettings(settings);
    await supabase
      .from("doctor_settings")
      .upsert({
        user_id: user.id,
        print_settings: settings as unknown as Json,
      }, { onConflict: "user_id" });
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
