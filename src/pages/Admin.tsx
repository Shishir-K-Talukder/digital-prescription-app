import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Users, Stethoscope, FileText, Shield, Search, Trash2, Eye, UserCheck, UserX,
  ArrowLeft, Pill, CalendarDays, Database, RefreshCw, Settings, Plus, Download,
  BarChart3, Activity, Clock, Timer,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Navigate, useNavigate } from "react-router-dom";
import FloatingNav from "@/components/FloatingNav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

// ─── Types ───
interface DoctorProfile {
  id: string; user_id: string; name: string; degrees: string; specialization: string;
  bmdc_no: string; phone: string; chamber_address: string; is_active: boolean;
  profile_photo_url: string; created_at: string; updated_at: string;
  panel_expires_at: string | null;
}
interface Patient {
  id: string; user_id: string; name: string; age: string; sex: string;
  mobile: string; address: string; created_at: string;
}
interface Prescription {
  id: string; user_id: string; patient_data: any; clinical_data: any;
  medicines: any; advice: any; created_at: string;
}
interface UserRole { id: string; user_id: string; role: string; created_at: string; }
interface Appointment {
  id: string; user_id: string; patient_name: string; patient_mobile: string;
  patient_age: string; patient_sex: string; appointment_date: string;
  appointment_time: string; status: string; notes: string; created_at: string;
}
interface MedicineRow {
  id: string; name: string; generic: string; strength: string; company: string; created_at: string;
}
interface TreatmentTemplate {
  id: string; user_id: string; name: string; medicines: any; created_at: string;
}

// ─── Component ───
const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();

  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicines, setMedicines] = useState<MedicineRow[]>([]);
  const [templates, setTemplates] = useState<TreatmentTemplate[]>([]);

  const [search, setSearch] = useState("");
  const [medSearch, setMedSearch] = useState("");
  const [newAdminUserId, setNewAdminUserId] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Expiry management
  const [expiryDoctor, setExpiryDoctor] = useState<DoctorProfile | null>(null);
  const [expiryDate, setExpiryDate] = useState("");

  // New medicine form
  const [newMedName, setNewMedName] = useState("");
  const [newMedGeneric, setNewMedGeneric] = useState("");
  const [newMedStrength, setNewMedStrength] = useState("");
  const [newMedCompany, setNewMedCompany] = useState("");

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  const loadAll = async () => {
    setLoading(true);
    const [docRes, patRes, rxRes, roleRes, apptRes, medRes, tmplRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("patients").select("*").order("created_at", { ascending: false }),
      supabase.from("prescriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*").order("created_at", { ascending: false }),
      supabase.from("appointments").select("*").order("appointment_date", { ascending: false }),
      supabase.from("medicines").select("*").order("name").limit(500),
      supabase.from("treatment_templates").select("*").order("created_at", { ascending: false }),
    ]);
    if (docRes.data) setDoctors(docRes.data as any);
    if (patRes.data) setPatients(patRes.data);
    if (rxRes.data) setPrescriptions(rxRes.data);
    if (roleRes.data) setRoles(roleRes.data as any);
    if (apptRes.data) setAppointments(apptRes.data as any);
    if (medRes.data) setMedicines(medRes.data as any);
    if (tmplRes.data) setTemplates(tmplRes.data as any);
    setLoading(false);
  };

  // ─── Helpers ───
  const getDoctorName = (userId: string) => {
    const doc = doctors.find((d) => d.user_id === userId);
    return doc?.name || userId.slice(0, 8) + "...";
  };
  const getDoctorRxCount = (userId: string) => prescriptions.filter((rx) => rx.user_id === userId).length;
  const getDoctorPatientCount = (userId: string) => patients.filter((p) => p.user_id === userId).length;
  const activeDoctors = doctors.filter((d) => d.is_active !== false).length;
  const inactiveDoctors = doctors.filter((d) => d.is_active === false).length;

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const months: { name: string; prescriptions: number; patients: number; appointments: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      months.push({
        name: format(date, "MMM yy"),
        prescriptions: prescriptions.filter((rx) => isWithinInterval(new Date(rx.created_at), { start, end })).length,
        patients: patients.filter((p) => isWithinInterval(new Date(p.created_at), { start, end })).length,
        appointments: appointments.filter((a) => { try { return isWithinInterval(new Date(a.appointment_date), { start, end }); } catch { return false; } }).length,
      });
    }
    return months;
  }, [prescriptions, patients, appointments]);

  // Filtered lists
  const filteredDoctors = doctors.filter((d) =>
    `${d.name} ${d.specialization} ${d.bmdc_no} ${d.phone}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredPatients = patients.filter((p) =>
    `${p.name} ${p.mobile} ${p.address}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredMedicines = medicines.filter((m) =>
    `${m.name} ${m.generic} ${m.company}`.toLowerCase().includes(medSearch.toLowerCase())
  );

  // ─── Actions ───
  const toggleUserActive = async (userId: string, currentActive: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_active: !currentActive } as any).eq("user_id", userId);
    if (error) { toast.error("Failed to update user status"); return; }
    setDoctors((prev) => prev.map((d) => (d.user_id === userId ? { ...d, is_active: !currentActive } : d)));
    toast.success(!currentActive ? "User activated" : "User deactivated");
  };

  const deletePatient = async (id: string) => {
    await supabase.from("patients").delete().eq("id", id);
    setPatients((p) => p.filter((x) => x.id !== id));
    toast.success("Patient deleted");
  };

  const deletePrescription = async (id: string) => {
    await supabase.from("prescriptions").delete().eq("id", id);
    setPrescriptions((p) => p.filter((x) => x.id !== id));
    toast.success("Prescription deleted");
  };

  const deleteAppointment = async (id: string) => {
    await supabase.from("appointments").delete().eq("id", id);
    setAppointments((a) => a.filter((x) => x.id !== id));
    toast.success("Appointment deleted");
  };

  const deleteMedicine = async (id: string) => {
    await supabase.from("medicines").delete().eq("id", id);
    setMedicines((m) => m.filter((x) => x.id !== id));
    toast.success("Medicine deleted");
  };

  const addMedicine = async () => {
    if (!newMedName.trim()) return;
    const { data, error } = await supabase.from("medicines").insert({
      name: newMedName.trim(), generic: newMedGeneric.trim(),
      strength: newMedStrength.trim(), company: newMedCompany.trim(),
    }).select().single();
    if (error) { toast.error(error.message); return; }
    if (data) setMedicines((prev) => [data as any, ...prev]);
    setNewMedName(""); setNewMedGeneric(""); setNewMedStrength(""); setNewMedCompany("");
    toast.success("Medicine added");
  };

  const deleteTemplate = async (id: string) => {
    await supabase.from("treatment_templates").delete().eq("id", id);
    setTemplates((t) => t.filter((x) => x.id !== id));
    toast.success("Template deleted");
  };

  const addAdminRole = async () => {
    if (!newAdminUserId.trim()) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: newAdminUserId.trim(), role: "admin" as any });
    if (error) { toast.error(error.message); } else { toast.success("Admin role assigned"); setNewAdminUserId(""); loadAll(); }
  };

  const removeRole = async (id: string) => {
    await supabase.from("user_roles").delete().eq("id", id);
    setRoles((r) => r.filter((x) => x.id !== id));
    toast.success("Role removed");
  };

  const setPanelExpiry = async () => {
    if (!expiryDoctor) return;
    const val = expiryDate ? new Date(expiryDate).toISOString() : null;
    const { error } = await supabase.from("profiles").update({ panel_expires_at: val } as any).eq("user_id", expiryDoctor.user_id);
    if (error) { toast.error("Failed to set expiry"); return; }
    setDoctors((prev) => prev.map((d) => d.user_id === expiryDoctor.user_id ? { ...d, panel_expires_at: val } : d));
    toast.success(val ? `Expiry set to ${expiryDate}` : "Expiry removed (lifetime)");
    setExpiryDoctor(null); setExpiryDate("");
  };

  const exportData = () => {
    const data = { doctors, patients, prescriptions, appointments, templates, roles, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `app-backup-${format(new Date(), "yyyy-MM-dd")}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported!");
  };

  // ─── Guards ───
  if (adminLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background pt-16 pb-8">
      <FloatingNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <Badge variant="outline" className="text-xs">Full Control</Badge>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={exportData}>
              <Download className="w-3.5 h-3.5" /> Export JSON
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={loadAll} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3 mb-6">
          {[
            { icon: <Stethoscope className="w-5 h-5 text-primary" />, label: "Doctors", value: doctors.length },
            { icon: <UserCheck className="w-5 h-5 text-primary" />, label: "Active", value: activeDoctors },
            { icon: <UserX className="w-5 h-5 text-destructive" />, label: "Inactive", value: inactiveDoctors },
            { icon: <Users className="w-5 h-5 text-primary" />, label: "Patients", value: patients.length },
            { icon: <FileText className="w-5 h-5 text-primary" />, label: "Prescriptions", value: prescriptions.length },
            { icon: <CalendarDays className="w-5 h-5 text-primary" />, label: "Appointments", value: appointments.length },
            { icon: <Pill className="w-5 h-5 text-primary" />, label: "Medicines", value: medicines.length },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-3 flex items-center gap-2">
                {s.icon}
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search doctors, patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full grid grid-cols-4 md:grid-cols-8 h-10 bg-muted/60 p-1 rounded-xl border border-border">
            <TabsTrigger value="overview" className="text-[11px] gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><BarChart3 className="w-3.5 h-3.5" /> Overview</TabsTrigger>
            <TabsTrigger value="doctors" className="text-[11px] gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Stethoscope className="w-3.5 h-3.5" /> Doctors</TabsTrigger>
            <TabsTrigger value="patients" className="text-[11px] gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Users className="w-3.5 h-3.5" /> Patients</TabsTrigger>
            <TabsTrigger value="prescriptions" className="text-[11px] gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><FileText className="w-3.5 h-3.5" /> Rx</TabsTrigger>
            <TabsTrigger value="appointments" className="text-[11px] gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><CalendarDays className="w-3.5 h-3.5" /> Appts</TabsTrigger>
            <TabsTrigger value="medicines" className="text-[11px] gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Pill className="w-3.5 h-3.5" /> Medicines</TabsTrigger>
            <TabsTrigger value="templates" className="text-[11px] gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Settings className="w-3.5 h-3.5" /> Templates</TabsTrigger>
            <TabsTrigger value="roles" className="text-[11px] gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Shield className="w-3.5 h-3.5" /> Access</TabsTrigger>
          </TabsList>

          {/* ═══ OVERVIEW ═══ */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4" /> Monthly Activity (6 Months)</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthlyData.map((m) => (
                      <div key={m.name} className="flex items-center gap-3 text-xs">
                        <span className="w-14 text-muted-foreground font-medium">{m.name}</span>
                        <div className="flex-1 flex gap-1 items-center">
                          <div className="h-4 bg-primary/80 rounded" style={{ width: `${Math.max(4, m.prescriptions * 8)}px` }} />
                          <span className="text-muted-foreground">{m.prescriptions} Rx</span>
                        </div>
                        <span className="text-muted-foreground">{m.patients} pts</span>
                        <span className="text-muted-foreground">{m.appointments} appts</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Database className="w-4 h-4" /> Database Summary</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Profiles (Doctors)", count: doctors.length },
                      { label: "Patients", count: patients.length },
                      { label: "Prescriptions", count: prescriptions.length },
                      { label: "Appointments", count: appointments.length },
                      { label: "Medicines in DB", count: medicines.length + "+" },
                      { label: "Treatment Templates", count: templates.length },
                      { label: "Admin Roles", count: roles.length },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground">{r.label}</span>
                        <Badge variant="secondary" className="text-xs">{r.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══ DOCTORS ═══ */}
          <TabsContent value="doctors">
            <Card>
              <CardHeader><CardTitle className="text-sm">All Doctors / Users</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[70vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>BMDC</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-center">Rx</TableHead>
                         <TableHead className="text-center">Patients</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDoctors.map((doc) => (
                        <TableRow key={doc.id} className={doc.is_active === false ? "opacity-50" : ""}>
                          <TableCell className="font-medium">
                            <button className="text-left hover:underline" onClick={() => setSelectedDoctor(doc)}>{doc.name || "—"}</button>
                          </TableCell>
                          <TableCell className="text-xs">{doc.specialization || "—"}</TableCell>
                          <TableCell className="text-xs">{doc.bmdc_no || "—"}</TableCell>
                          <TableCell className="text-xs">{doc.phone || "—"}</TableCell>
                          <TableCell className="text-center text-xs">{getDoctorRxCount(doc.user_id)}</TableCell>
                          <TableCell className="text-center text-xs">{getDoctorPatientCount(doc.user_id)}</TableCell>
                          <TableCell>
                            <Badge variant={doc.is_active !== false ? "default" : "destructive"} className="text-[10px]">
                              {doc.is_active !== false ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              if (!doc.panel_expires_at) return <Badge variant="secondary" className="text-[10px]">Lifetime</Badge>;
                              const exp = new Date(doc.panel_expires_at);
                              const days = Math.ceil((exp.getTime() - Date.now()) / 86400000);
                              const expired = days < 0;
                              return (
                                <button onClick={() => { setExpiryDoctor(doc); setExpiryDate(doc.panel_expires_at ? doc.panel_expires_at.split("T")[0] : ""); }}>
                                  <Badge variant={expired ? "destructive" : days <= 7 ? "destructive" : "secondary"} className="text-[10px] cursor-pointer">
                                    {expired ? "Expired" : `${days}d left`}
                                  </Badge>
                                </button>
                              );
                            })()}
                          </TableCell>
                          <TableCell className="text-[10px] text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="flex gap-1">
                            <Switch checked={doc.is_active !== false} onCheckedChange={() => toggleUserActive(doc.user_id, doc.is_active !== false)} />
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setExpiryDoctor(doc); setExpiryDate(doc.panel_expires_at ? doc.panel_expires_at.split("T")[0] : ""); }}>
                              <Timer className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredDoctors.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground">No doctors found</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ PATIENTS ═══ */}
          <TabsContent value="patients">
            <Card>
              <CardHeader><CardTitle className="text-sm">All Patients ({filteredPatients.length})</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[70vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead><TableHead>Age</TableHead><TableHead>Sex</TableHead>
                        <TableHead>Mobile</TableHead><TableHead>Address</TableHead><TableHead>Doctor</TableHead><TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name || "—"}</TableCell>
                          <TableCell>{p.age}</TableCell><TableCell>{p.sex}</TableCell>
                          <TableCell>{p.mobile}</TableCell>
                          <TableCell className="text-xs max-w-[150px] truncate">{p.address || "—"}</TableCell>
                          <TableCell className="text-xs">{getDoctorName(p.user_id)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePatient(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredPatients.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No patients found</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ PRESCRIPTIONS ═══ */}
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader><CardTitle className="text-sm">All Prescriptions ({prescriptions.length})</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[70vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead><TableHead>Doctor</TableHead>
                        <TableHead>Medicines</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescriptions.map((rx) => {
                        const pd = rx.patient_data as any;
                        const medCount = Array.isArray(rx.medicines) ? rx.medicines.length : 0;
                        return (
                          <TableRow key={rx.id}>
                            <TableCell className="font-medium">{pd?.name || "—"}</TableCell>
                            <TableCell className="text-xs">{getDoctorName(rx.user_id)}</TableCell>
                            <TableCell><Badge variant="secondary" className="text-[10px]">{medCount} meds</Badge></TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(rx.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedPrescription(rx)}><Eye className="w-3.5 h-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePrescription(rx.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {prescriptions.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No prescriptions</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ APPOINTMENTS ═══ */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader><CardTitle className="text-sm">All Appointments ({appointments.length})</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[70vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead>
                        <TableHead>Status</TableHead><TableHead>Doctor</TableHead><TableHead>Notes</TableHead><TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.patient_name || "—"}</TableCell>
                          <TableCell className="text-xs">{a.appointment_date}</TableCell>
                          <TableCell className="text-xs">{a.appointment_time}</TableCell>
                          <TableCell><Badge variant={a.status === "completed" ? "default" : a.status === "cancelled" ? "destructive" : "secondary"} className="text-[10px]">{a.status}</Badge></TableCell>
                          <TableCell className="text-xs">{getDoctorName(a.user_id)}</TableCell>
                          <TableCell className="text-xs max-w-[100px] truncate">{a.notes || "—"}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteAppointment(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {appointments.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No appointments</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ MEDICINES DB ═══ */}
          <TabsContent value="medicines">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Medicine Database ({medicines.length}+)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new medicine */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <Input placeholder="Medicine name *" value={newMedName} onChange={(e) => setNewMedName(e.target.value)} className="h-9 text-sm" />
                  <Input placeholder="Generic name" value={newMedGeneric} onChange={(e) => setNewMedGeneric(e.target.value)} className="h-9 text-sm" />
                  <Input placeholder="Strength" value={newMedStrength} onChange={(e) => setNewMedStrength(e.target.value)} className="h-9 text-sm" />
                  <Input placeholder="Company" value={newMedCompany} onChange={(e) => setNewMedCompany(e.target.value)} className="h-9 text-sm" />
                  <Button size="sm" className="h-9 gap-1" onClick={addMedicine}><Plus className="w-3.5 h-3.5" /> Add</Button>
                </div>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search medicines..." value={medSearch} onChange={(e) => setMedSearch(e.target.value)} className="pl-9 h-9 text-sm" />
                </div>
                <ScrollArea className="max-h-[50vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead><TableHead>Generic</TableHead><TableHead>Strength</TableHead>
                        <TableHead>Company</TableHead><TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMedicines.slice(0, 100).map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium text-xs">{m.name}</TableCell>
                          <TableCell className="text-xs">{m.generic || "—"}</TableCell>
                          <TableCell className="text-xs">{m.strength || "—"}</TableCell>
                          <TableCell className="text-xs">{m.company || "—"}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMedicine(m.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredMedicines.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No medicines found</TableCell></TableRow>}
                      {filteredMedicines.length > 100 && <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground">Showing first 100 of {filteredMedicines.length} results. Use search to narrow down.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ TREATMENT TEMPLATES ═══ */}
          <TabsContent value="templates">
            <Card>
              <CardHeader><CardTitle className="text-sm">Treatment Templates ({templates.length})</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[70vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead><TableHead>Doctor</TableHead>
                        <TableHead>Medicines</TableHead><TableHead>Created</TableHead><TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((t) => {
                        const medCount = Array.isArray(t.medicines) ? t.medicines.length : 0;
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">{t.name || "—"}</TableCell>
                            <TableCell className="text-xs">{getDoctorName(t.user_id)}</TableCell>
                            <TableCell><Badge variant="secondary" className="text-[10px]">{medCount} meds</Badge></TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteTemplate(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {templates.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No templates</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ ADMIN ACCESS ═══ */}
          <TabsContent value="roles">
            <Card>
              <CardHeader><CardTitle className="text-sm">Manage Admin Access</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="User ID to assign admin role" value={newAdminUserId} onChange={(e) => setNewAdminUserId(e.target.value)} />
                  <Button onClick={addAdminRole}>Assign Admin</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead><TableHead>User ID</TableHead>
                      <TableHead>Role</TableHead><TableHead>Assigned</TableHead><TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{getDoctorName(r.user_id)}</TableCell>
                        <TableCell className="text-[10px] font-mono text-muted-foreground">{r.user_id}</TableCell>
                        <TableCell><Badge>{r.role}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeRole(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {roles.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No roles assigned</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ═══ DIALOGS ═══ */}
        <Dialog open={!!selectedDoctor} onOpenChange={() => setSelectedDoctor(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Doctor Details</DialogTitle></DialogHeader>
            {selectedDoctor && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Name:</span> <strong>{selectedDoctor.name || "—"}</strong></div>
                  <div><span className="text-muted-foreground">Degrees:</span> {selectedDoctor.degrees || "—"}</div>
                  <div><span className="text-muted-foreground">Specialization:</span> {selectedDoctor.specialization || "—"}</div>
                  <div><span className="text-muted-foreground">BMDC No:</span> {selectedDoctor.bmdc_no || "—"}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {selectedDoctor.phone || "—"}</div>
                  <div><span className="text-muted-foreground">Chamber:</span> {selectedDoctor.chamber_address || "—"}</div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant={selectedDoctor.is_active !== false ? "default" : "destructive"}>{selectedDoctor.is_active !== false ? "Active" : "Inactive"}</Badge></div>
                  <div><span className="text-muted-foreground">Joined:</span> {new Date(selectedDoctor.created_at).toLocaleDateString()}</div>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground font-mono">User ID: {selectedDoctor.user_id}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{getDoctorRxCount(selectedDoctor.user_id)}</p><p className="text-[10px] text-muted-foreground">Prescriptions</p></CardContent></Card>
                  <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{getDoctorPatientCount(selectedDoctor.user_id)}</p><p className="text-[10px] text-muted-foreground">Patients</p></CardContent></Card>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader><DialogTitle>Prescription Details</DialogTitle></DialogHeader>
            {selectedPrescription && (
              <div className="space-y-4 text-sm">
                <div><h4 className="font-semibold mb-1">Patient</h4><pre className="bg-muted p-2 rounded text-xs overflow-auto">{JSON.stringify(selectedPrescription.patient_data, null, 2)}</pre></div>
                <div><h4 className="font-semibold mb-1">Clinical Data</h4><pre className="bg-muted p-2 rounded text-xs overflow-auto">{JSON.stringify(selectedPrescription.clinical_data, null, 2)}</pre></div>
                <div><h4 className="font-semibold mb-1">Medicines</h4><pre className="bg-muted p-2 rounded text-xs overflow-auto">{JSON.stringify(selectedPrescription.medicines, null, 2)}</pre></div>
                <div><h4 className="font-semibold mb-1">Advice</h4><pre className="bg-muted p-2 rounded text-xs overflow-auto">{JSON.stringify(selectedPrescription.advice, null, 2)}</pre></div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ═══ EXPIRY DIALOG ═══ */}
        <Dialog open={!!expiryDoctor} onOpenChange={() => setExpiryDoctor(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Timer className="w-4 h-4" /> Set Panel Expiry</DialogTitle></DialogHeader>
            {expiryDoctor && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Doctor: <strong>{expiryDoctor.name || expiryDoctor.user_id.slice(0, 8)}</strong></p>
                <div>
                  <Label className="text-xs">Expiry Date</Label>
                  <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="mt-1 h-9 text-sm" />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-1.5 text-sm" onClick={setPanelExpiry}>
                    <Clock className="w-3.5 h-3.5" /> {expiryDate ? "Set Expiry" : "Set Lifetime"}
                  </Button>
                  <Button variant="outline" className="text-sm" onClick={() => { setExpiryDate(""); }}>
                    Clear (Lifetime)
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
