import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, FileText, Stethoscope, Eye, Save, History, LogOut, LayoutDashboard, User } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import DoctorHeader, { DoctorInfo } from "@/components/DoctorHeader";
import PatientInfo, { PatientData, savePatientToHistory } from "@/components/PatientInfo";
import ClinicalSection, { ClinicalData, defaultOnExamination } from "@/components/ClinicalSection";
import MedicineSection, { Medicine } from "@/components/MedicineSection";
import AdviceSection, { AdviceData } from "@/components/AdviceSection";
import PrintPreview from "@/components/PrintPreview";
import PrescriptionHistory from "@/components/PrescriptionHistory";
import PatientDocuments from "@/components/PatientDocuments";
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
    chiefComplaint: "", onExamination: { ...defaultOnExamination }, drugHistory: "", diagnosis: "", investigation: "",
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

  // Pre-fill patient info from appointment
  useEffect(() => {
    const stored = sessionStorage.getItem("appointment-patient");
    if (stored) {
      try {
        const apptPatient = JSON.parse(stored);
        setPatient((prev) => ({
          ...prev,
          name: apptPatient.name || "",
          age: apptPatient.age || "",
          sex: apptPatient.sex || "",
          mobile: apptPatient.mobile || "",
        }));
      } catch {}
      sessionStorage.removeItem("appointment-patient");
    }
  }, []);

  const handleDoctorChange = (d: DoctorInfo) => {
    setDoctor(d);
    saveProfile(d);
  };

  const handlePrint = () => {
    // Auto-save prescription when printing
    savePatientToHistory(patient);
    savePrescription(patient, clinical, medicines, advice);

    const printData = { doctor, patient, clinical, medicines, advice, printSettings };
    sessionStorage.setItem("prescription-print-data", JSON.stringify(printData));

    const currentLocation = `${window.location.origin}${window.location.pathname.endsWith("/") ? window.location.pathname : `${window.location.pathname}/`}`;
    const printUrl = new URL("print", currentLocation);
    window.open(printUrl.toString(), "_blank");
  };

  const handleSave = () => {
    savePatientToHistory(patient);
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
    setClinical({ chiefComplaint: "", onExamination: { ...defaultOnExamination }, drugHistory: "", drugHistoryMedicines: [], diagnosis: "", investigation: "" });
    setMedicines([]);
    setAdvice({ advice: "", followUpDate: "" });
    setActiveTab("write");
  };

  if (profileLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Stethoscope className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-8">
      <FloatingNav
        actions={[
          { icon: <FileText className="w-5 h-5" />, label: "New Rx", onClick: handleNewPrescription },
          { icon: <Save className="w-5 h-5" />, label: "Save", onClick: handleSave },
          { icon: <Printer className="w-5 h-5" />, label: "Print", onClick: handlePrint },
        ]}
      />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6 mt-2">
            <TabsList className="bg-card border border-border/60 shadow-sm h-12 p-1 rounded-xl">
              <TabsTrigger value="write" className="gap-2 text-sm font-medium rounded-lg px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
                <Stethoscope className="w-4 h-4" /> Write Rx
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 text-sm font-medium rounded-lg px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
                <Eye className="w-4 h-4" /> Preview
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 text-sm font-medium rounded-lg px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
                <History className="w-4 h-4" /> History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="write" className="space-y-4 mt-0">
            {/* Patient Info */}
            <PatientInfo patient={patient} onChange={setPatient} />

            {/* Clinical + Medicine side by side */}
            <div className="rx-page-grid">
              <div className="min-w-0">
                <ClinicalSection data={clinical} onChange={setClinical} options={medicineOptions} />
              </div>
              <div className="space-y-4 min-w-0">
                <MedicineSection medicines={medicines} onChange={setMedicines} options={medicineOptions} onOptionsChange={saveMedicineOptions} />
              </div>
            </div>

            {/* Advice & Documents */}
            <AdviceSection data={advice} onChange={setAdvice} options={medicineOptions} />
            <div className="section-card p-5">
              <PatientDocuments patientId={prescriptions.find(
                (rx) => rx.patient_data.name === patient.name && rx.patient_data.mobile === patient.mobile
              )?.id} />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <PrintPreview doctor={doctor} patient={patient} clinical={clinical} medicines={medicines} advice={advice} printSettings={printSettings} />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <div className="section-card p-5">
              <h3 className="section-header mb-4">
                <div className="section-header-icon flex items-center justify-center">
                  <History className="w-3.5 h-3.5" />
                </div>
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
