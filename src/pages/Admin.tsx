import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import FloatingNav from "@/components/FloatingNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Users, Stethoscope, FileText, Shield, Search, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Navigate } from "react-router-dom";

interface DoctorProfile {
  id: string;
  user_id: string;
  name: string;
  degrees: string;
  specialization: string;
  bmdc_no: string;
  phone: string;
  created_at: string;
}

interface Patient {
  id: string;
  user_id: string;
  name: string;
  age: string;
  sex: string;
  mobile: string;
  address: string;
  created_at: string;
}

interface Prescription {
  id: string;
  user_id: string;
  patient_data: any;
  clinical_data: any;
  medicines: any;
  advice: any;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [search, setSearch] = useState("");
  const [newAdminUserId, setNewAdminUserId] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  const loadAll = async () => {
    setLoading(true);
    const [docRes, patRes, rxRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("patients").select("*").order("created_at", { ascending: false }),
      supabase.from("prescriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*").order("created_at", { ascending: false }),
    ]);
    if (docRes.data) setDoctors(docRes.data);
    if (patRes.data) setPatients(patRes.data);
    if (rxRes.data) setPrescriptions(rxRes.data);
    if (roleRes.data) setRoles(roleRes.data as any);
    setLoading(false);
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

  const addAdminRole = async () => {
    if (!newAdminUserId.trim()) return;
    const { error } = await supabase.from("user_roles").insert({
      user_id: newAdminUserId.trim(),
      role: "admin" as any,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Admin role assigned");
      setNewAdminUserId("");
      loadAll();
    }
  };

  const removeRole = async (id: string) => {
    await supabase.from("user_roles").delete().eq("id", id);
    setRoles((r) => r.filter((x) => x.id !== id));
    toast.success("Role removed");
  };

  if (adminLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const filteredDoctors = doctors.filter((d) =>
    `${d.name} ${d.specialization} ${d.bmdc_no}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredPatients = patients.filter((p) =>
    `${p.name} ${p.mobile} ${p.address}`.toLowerCase().includes(search.toLowerCase())
  );

  const getDoctorName = (userId: string) => {
    const doc = doctors.find((d) => d.user_id === userId);
    return doc?.name || userId.slice(0, 8) + "...";
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingNav />
      <div className="pt-20 px-4 max-w-7xl mx-auto pb-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{doctors.length}</p>
                <p className="text-xs text-muted-foreground">Doctors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{patients.length}</p>
                <p className="text-xs text-muted-foreground">Patients</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{prescriptions.length}</p>
                <p className="text-xs text-muted-foreground">Prescriptions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{roles.length}</p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search doctors, patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="doctors">
          <TabsList className="mb-4">
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>

          {/* Doctors Tab */}
          <TabsContent value="doctors">
            <Card>
              <CardHeader><CardTitle>All Doctors</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Degrees</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>BMDC No</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDoctors.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.name || "—"}</TableCell>
                        <TableCell>{doc.degrees || "—"}</TableCell>
                        <TableCell>{doc.specialization || "—"}</TableCell>
                        <TableCell>{doc.bmdc_no || "—"}</TableCell>
                        <TableCell>{doc.phone || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredDoctors.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">No doctors found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <Card>
              <CardHeader><CardTitle>All Patients</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Sex</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name || "—"}</TableCell>
                        <TableCell>{p.age}</TableCell>
                        <TableCell>{p.sex}</TableCell>
                        <TableCell>{p.mobile}</TableCell>
                        <TableCell className="text-xs">{getDoctorName(p.user_id)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePatient(p.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPatients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">No patients found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader><CardTitle>All Prescriptions</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions.map((rx) => {
                      const pd = rx.patient_data as any;
                      return (
                        <TableRow key={rx.id}>
                          <TableCell className="font-medium">{pd?.name || "—"}</TableCell>
                          <TableCell className="text-xs">{getDoctorName(rx.user_id)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(rx.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedPrescription(rx)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePrescription(rx.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {prescriptions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">No prescriptions found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader><CardTitle>Manage Admin Roles</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="User ID to assign admin role"
                    value={newAdminUserId}
                    onChange={(e) => setNewAdminUserId(e.target.value)}
                  />
                  <Button onClick={addAdminRole}>Assign Admin</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs font-mono">{getDoctorName(r.user_id)}</TableCell>
                        <TableCell><Badge>{r.role}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeRole(r.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {roles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">No roles assigned</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Prescription Detail Dialog */}
        <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Prescription Details</DialogTitle>
            </DialogHeader>
            {selectedPrescription && (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Patient</h4>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedPrescription.patient_data, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Clinical Data</h4>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedPrescription.clinical_data, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Medicines</h4>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedPrescription.medicines, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Advice</h4>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedPrescription.advice, null, 2)}
                  </pre>
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
