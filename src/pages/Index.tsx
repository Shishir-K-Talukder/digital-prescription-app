import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, FileText, Stethoscope, Eye, Save, History, LogOut, LayoutDashboard, User } from "lucide-react";
import DoctorHeader, { DoctorInfo } from "@/components/DoctorHeader";
import PatientInfo, { PatientData } from "@/components/PatientInfo";
import ClinicalSection, { ClinicalData, defaultOnExamination } from "@/components/ClinicalSection";
import MedicineSection, { Medicine } from "@/components/MedicineSection";
import AdviceSection, { AdviceData } from "@/components/AdviceSection";
import PrintPreview from "@/components/PrintPreview";
import PrescriptionHistory from "@/components/PrescriptionHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useDoctorSettings } from "@/hooks/useDoctorSettings";
import { usePrescriptions, PrescriptionRecord } from "@/hooks/usePrescriptions";
import { useNavigate } from "react-router-dom";

const today = new Date().toISOString().split("T")[0];

const Index = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, saveProfile, loading: profileLoading } = useProfile();
  const { printSettings, savePrintSettings, medicineOptions, saveMedicineOptions, loading: settingsLoading } = useDoctorSettings();
  const { prescriptions, savePrescription, deletePrescription, loading: rxLoading } = usePrescriptions();

  const [activeTab, setActiveTab] = useState("write");

  const [doctor, setDoctor] = useState<DoctorInfo>({
    name: "", degrees: "", specialization: "", bmdcNo: "", chamberAddress: "", phone: "",
  });

  const [patient, setPatient] = useState<PatientData>({
    name: "", age: "", sex: "", mobile: "", address: "", date: today,
  });

  const [clinical, setClinical] = useState<ClinicalData>({
    chiefComplaint: "", onExamination: { ...defaultOnExamination }, diagnosis: "", investigation: "",
  });

  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [advice, setAdvice] = useState<AdviceData>({
    advice: "", followUpDate: "",
  });

  useEffect(() => {
    if (!profileLoading && profile.name) {
      setDoctor(profile);
    }
  }, [profileLoading, profile]);

  const handleDoctorChange = (d: DoctorInfo) => {
    setDoctor(d);
    saveProfile(d);
  };

  const handlePrint = () => {
    const printData = { doctor, patient, clinical, medicines, advice, printSettings };
    sessionStorage.setItem("prescription-print-data", JSON.stringify(printData));
    window.open("/print", "_blank");
  };

  const handleSave = () => {
    savePrescription(patient, clinical, medicines, advice);
  };

  const handleLoadPrescription = (rx: PrescriptionRecord) => {
    setPatient({ ...rx.patient_data, date: today });
    setClinical(rx.clinical_data);
    setMedicines(rx.medicines);
    setAdvice(rx.advice);
    setActiveTab("write");
  };

  const handleNewPrescription = () => {
    setPatient({ name: "", age: "", sex: "", mobile: "", address: "", date: today });
    setClinical({ chiefComplaint: "", onExamination: { ...defaultOnExamination }, diagnosis: "", investigation: "" });
    setMedicines([]);
    setAdvice({ advice: "", followUpDate: "" });
    setActiveTab("write");
  };

  if (profileLoading || settingsLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading your data...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-lg font-serif italic text-primary-foreground">℞</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">Digital Prescription</h1>
              <span className="text-[10px] text-muted-foreground hidden sm:block">Bangladesh PRD System</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => navigate("/dashboard")}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => navigate("/profile")}>
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleNewPrescription}>
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Rx</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleSave}>
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button size="sm" className="gap-1.5 text-xs h-8 shadow-sm" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 text-destructive" onClick={signOut}>
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-5 bg-card border border-border shadow-sm h-10">
            <TabsTrigger value="write" className="gap-1.5 text-xs data-[state=active]:shadow-sm">
              <Stethoscope className="w-3.5 h-3.5" /> Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5 text-xs data-[state=active]:shadow-sm">
              <Eye className="w-3.5 h-3.5" /> Preview
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs data-[state=active]:shadow-sm">
              <History className="w-3.5 h-3.5" /> History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="write" className="space-y-5 mt-0">
            <PatientInfo patient={patient} onChange={setPatient} />
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
              <div className="min-w-0">
                <ClinicalSection data={clinical} onChange={setClinical} />
              </div>
              <div className="space-y-5 min-w-0">
                <MedicineSection medicines={medicines} onChange={setMedicines} options={medicineOptions} onOptionsChange={saveMedicineOptions} />
              </div>
            </div>
            <AdviceSection data={advice} onChange={setAdvice} options={medicineOptions} />
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <PrintPreview doctor={doctor} patient={patient} clinical={clinical} medicines={medicines} advice={advice} printSettings={printSettings} />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <div className="section-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Prescription History
              </h3>
              <PrescriptionHistory
                prescriptions={prescriptions}
                onLoad={handleLoadPrescription}
                onDelete={deletePrescription}
                loading={rxLoading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
