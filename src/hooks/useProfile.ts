import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DoctorInfo } from "@/components/DoctorHeader";

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DoctorInfo>({
    name: "", degrees: "", specialization: "", bmdcNo: "", chamberAddress: "", phone: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setProfile({
        name: data.name,
        degrees: data.degrees,
        specialization: data.specialization,
        bmdcNo: data.bmdc_no,
        chamberAddress: data.chamber_address,
        phone: data.phone,
      });
    }
    setLoading(false);
  };

  const saveProfile = async (info: DoctorInfo) => {
    if (!user) return;
    setProfile(info);
    await supabase
      .from("profiles")
      .update({
        name: info.name,
        degrees: info.degrees,
        specialization: info.specialization,
        bmdc_no: info.bmdcNo,
        chamber_address: info.chamberAddress,
        phone: info.phone,
      })
      .eq("user_id", user.id);
  };

  return { profile, saveProfile, loading };
};
