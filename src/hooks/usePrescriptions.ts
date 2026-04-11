import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PatientData } from "@/components/PatientInfo";
import { ClinicalData } from "@/components/ClinicalSection";
import { Medicine } from "@/components/MedicineSection";
import { AdviceData } from "@/components/AdviceSection";
import { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

export interface PrescriptionRecord {
  id: string;
  patient_data: PatientData;
  clinical_data: ClinicalData;
  medicines: Medicine[];
  advice: AdviceData;
  created_at: string;
}

export const usePrescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) loadPrescriptions();
  }, [user]);

  const loadPrescriptions = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setPrescriptions(
        data.map((d) => ({
          id: d.id,
          patient_data: d.patient_data as unknown as PatientData,
          clinical_data: d.clinical_data as unknown as ClinicalData,
          medicines: d.medicines as unknown as Medicine[],
          advice: d.advice as unknown as AdviceData,
          created_at: d.created_at,
        }))
      );
    }
    setLoading(false);
  };

  const savePrescription = async (
    patient: PatientData,
    clinical: ClinicalData,
    medicines: Medicine[],
    advice: AdviceData
  ) => {
    if (!user) return;

    // Upsert patient record
    let patientId: string | null = null;
    if (patient.name) {
      const { data: existingPatient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", patient.name)
        .eq("mobile", patient.mobile || "")
        .single();

      if (existingPatient) {
        patientId = existingPatient.id;
        await supabase.from("patients").update({
          age: patient.age, sex: patient.sex, address: patient.address,
        }).eq("id", patientId);
      } else {
        const { data: newPatient } = await supabase
          .from("patients")
          .insert({
            user_id: user.id,
            name: patient.name,
            age: patient.age,
            sex: patient.sex,
            mobile: patient.mobile || "",
            address: patient.address || "",
          })
          .select("id")
          .single();
        patientId = newPatient?.id ?? null;
      }
    }

    const { error } = await supabase.from("prescriptions").insert({
      user_id: user.id,
      patient_id: patientId,
      patient_data: patient as unknown as Json,
      clinical_data: clinical as unknown as Json,
      medicines: medicines as unknown as Json,
      advice: advice as unknown as Json,
    });

    if (error) {
      toast.error("Failed to save prescription");
    } else {
      toast.success("Prescription saved!");
      loadPrescriptions();
    }
  };

  const deletePrescription = async (id: string) => {
    await supabase.from("prescriptions").delete().eq("id", id);
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    toast.success("Prescription deleted");
  };

  return { prescriptions, savePrescription, deletePrescription, loading, reload: loadPrescriptions };
};
