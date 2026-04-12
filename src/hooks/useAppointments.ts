import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Appointment {
  id: string;
  user_id: string;
  patient_id: string | null;
  patient_name: string;
  patient_mobile: string;
  appointment_date: string;
  appointment_time: string;
  status: "scheduled" | "completed" | "cancelled";
  notes: string;
  created_at: string;
  updated_at: string;
}

export const useAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error);
    } else {
      setAppointments((data as unknown as Appointment[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const addAppointment = async (appt: {
    patient_name: string;
    patient_mobile: string;
    appointment_date: string;
    appointment_time: string;
    notes: string;
    patient_id?: string | null;
  }) => {
    if (!user) return;
    const { error } = await supabase.from("appointments").insert({
      user_id: user.id,
      patient_name: appt.patient_name,
      patient_mobile: appt.patient_mobile,
      appointment_date: appt.appointment_date,
      appointment_time: appt.appointment_time,
      notes: appt.notes,
      patient_id: appt.patient_id || null,
    } as any);

    if (error) {
      toast.error("Failed to add appointment");
      console.error(error);
    } else {
      toast.success("Appointment added");
      fetchAppointments();
    }
  };

  const updateAppointmentStatus = async (id: string, status: "scheduled" | "completed" | "cancelled") => {
    const { error } = await supabase
      .from("appointments")
      .update({ status } as any)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update appointment");
    } else {
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    }
  };

  const deleteAppointment = async (id: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete appointment");
    } else {
      toast.success("Appointment deleted");
      fetchAppointments();
    }
  };

  return { appointments, loading, addAppointment, updateAppointmentStatus, deleteAppointment, refetch: fetchAppointments };
};
