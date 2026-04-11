import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, Settings, FileText } from "lucide-react";
import DoctorHeader, { DoctorInfo } from "@/components/DoctorHeader";
import PatientInfo, { PatientData } from "@/components/PatientInfo";
import ClinicalSection, { ClinicalData, defaultOnExamination } from "@/components/ClinicalSection";
import MedicineSection, { Medicine } from "@/components/MedicineSection";
import { loadMedicineOptions, MedicineOptions } from "@/components/MedicineSettings";
import AdviceSection, { AdviceData } from "@/components/AdviceSection";
import PrintPreview, { PrintSettings } from "@/components/PrintPreview";
import PrintSetup from "@/components/PrintSetup";

const today = new Date().toISOString().split("T")[0];

const Index = () => {
  const [activeTab, setActiveTab] = useState("write");
  const [editDoctor, setEditDoctor] = useState(false);

  const [doctor, setDoctor] = useState<DoctorInfo>({
    name: "",
    degrees: "",
    specialization: "",
    bmdcNo: "",
    chamberAddress: "",
    phone: "",
  });

  const [patient, setPatient] = useState<PatientData>({
    name: "",
    age: "",
    sex: "",
    mobile: "",
    address: "",
    date: today,
  });

  const [clinical, setClinical] = useState<ClinicalData>({
    chiefComplaint: "",
    onExamination: { ...defaultOnExamination },
    diagnosis: "",
    investigation: "",
  });

  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [advice, setAdvice] = useState<AdviceData>({
    advice: "",
    followUpDate: "",
  });

  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    pageSize: "A4",
    customWidth: "210",
    customHeight: "297",
    headerSize: "medium",
    customHeaderHeight: "80",
    showDoctorInfo: true,
    showCC: true,
    showOE: true,
    showDiagnosis: true,
    showInvestigation: true,
  });

  const handlePrint = () => {
    const printData = { doctor, patient, clinical, medicines, advice, printSettings };
    sessionStorage.setItem("prescription-print-data", JSON.stringify(printData));
    window.open("/print", "_blank");
  };

  const handleNewPrescription = () => {
    setPatient({ name: "", age: "", sex: "", mobile: "", address: "", date: today });
    setClinical({ chiefComplaint: "", onExamination: { ...defaultOnExamination }, diagnosis: "", investigation: "" });
    setMedicines([]);
    setAdvice({ advice: "", followUpDate: "" });
    setActiveTab("write");
  };

  const pageSizeStyles: Record<string, string> = {
    A4: "max-w-[800px]",
    A5: "max-w-[560px]",
    Letter: "max-w-[816px]",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-serif italic text-primary">℞</span>
            <h1 className="text-lg font-bold text-foreground">Digital Prescription</h1>
            <span className="text-xs text-muted-foreground hidden sm:inline">— Bangladesh PRD System</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setEditDoctor(!editDoctor)}>
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Doctor Info</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={handleNewPrescription}>
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Rx</span>
            </Button>
            <Button size="sm" className="gap-1 text-xs" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-6">
        <DoctorHeader doctor={doctor} onChange={setDoctor} editMode={editDoctor} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="write">Write Prescription</TabsTrigger>
            <TabsTrigger value="preview">Print Preview</TabsTrigger>
            <TabsTrigger value="setup">Print Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="write" className="space-y-0">
            <PatientInfo patient={patient} onChange={setPatient} />
            <ClinicalSection data={clinical} onChange={setClinical} />
            <MedicineSection medicines={medicines} onChange={setMedicines} />
            <AdviceSection data={advice} onChange={setAdvice} />
          </TabsContent>

          <TabsContent value="preview">
            <PrintPreview doctor={doctor} patient={patient} clinical={clinical} medicines={medicines} advice={advice} printSettings={printSettings} />
          </TabsContent>

          <TabsContent value="setup">
            <PrintSetup settings={printSettings} onChange={setPrintSettings} />
          </TabsContent>
        </Tabs>
      </main>

    </div>
  );
};

export default Index;
