import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { DoctorInfo } from "@/components/DoctorHeader";
import FloatingNav from "@/components/FloatingNav";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import PanelExpiryCountdown from "@/components/PanelExpiryCountdown";
import { Save, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user } = useAuth();
  const { profile, saveProfile, loading } = useProfile();
  const [photoUrl, setPhotoUrl] = useState("");
  
  const [doctor, setDoctor] = useState<DoctorInfo>({
    name: "", degrees: "", specialization: "", bmdcNo: "", chamberAddress: "", phone: "",
  });

  useEffect(() => {
    if (!loading && profile.name) {
      setDoctor(profile);
    }
  }, [loading, profile]);

  useEffect(() => {
    if (user) loadPhotoUrl();
  }, [user]);

  const loadPhotoUrl = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("profile_photo_url")
      .eq("user_id", user.id)
      .single();
    if (data?.profile_photo_url) setPhotoUrl(data.profile_photo_url);
  };

  const handlePhotoChange = async (url: string) => {
    setPhotoUrl(url);
    if (user) {
      await supabase.from("profiles").update({ profile_photo_url: url }).eq("user_id", user.id);
    }
  };

  const handleSave = () => {
    saveProfile(doctor);
    toast.success("Profile saved!");
  };

  const fields: { key: keyof DoctorInfo; label: string; placeholder: string }[] = [
    { key: "name", label: "Doctor Name", placeholder: "Dr. Mohammad Rahman" },
    { key: "degrees", label: "Degrees", placeholder: "MBBS, FCPS (Medicine)" },
    { key: "specialization", label: "Specialization", placeholder: "Medicine Specialist" },
    { key: "bmdcNo", label: "BMDC No", placeholder: "A-12345" },
    { key: "chamberAddress", label: "Chamber Address", placeholder: "123 Green Road, Dhaka" },
    { key: "phone", label: "Phone", placeholder: "01XXXXXXXXX" },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <FloatingNav />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <PanelExpiryCountdown />
            <ProfilePhotoUpload
              photoUrl={photoUrl}
              doctorName={doctor.name}
              onPhotoChange={handlePhotoChange}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.key}>
                  <Label className="text-[11px] text-muted-foreground mb-1 block">{f.label}</Label>
                  <Input
                    value={doctor[f.key]}
                    onChange={(e) => setDoctor({ ...doctor, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="h-9 text-sm"
                  />
                </div>
              ))}
            </div>
            {user && (
              <p className="text-xs text-muted-foreground">Email: {user.email}</p>
            )}
            <Button className="gap-1.5 text-sm" onClick={handleSave}>
              <Save className="w-4 h-4" /> Save Profile
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
