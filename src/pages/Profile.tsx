import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { DoctorInfo } from "@/components/DoctorHeader";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft, User, LogOut } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, saveProfile, loading } = useProfile();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<DoctorInfo>({
    name: "", degrees: "", specialization: "", bmdcNo: "", chamberAddress: "", phone: "",
  });

  useEffect(() => {
    if (!loading && profile.name) {
      setDoctor(profile);
    }
  }, [loading, profile]);

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
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-lg font-serif italic text-primary-foreground">℞</span>
            </div>
            <h1 className="text-base font-bold text-foreground">Doctor Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => navigate("/")}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 text-destructive" onClick={signOut}>
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
