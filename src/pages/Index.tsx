import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, Settings, FileText, Stethoscope, Eye, SlidersHorizontal } from "lucide-react";
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
  const [medicineOptions, setMedicineOptions] = useState<MedicineOptions>(loadMedicineOptions);

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

  const [printSettings, setPrintSettings] = useState<PrintSettings>(() => {
    try {
      const stored = localStorage.getItem("print-settings");
      if (stored) return { ...{ pageSize: "A4", customWidth: "210", customHeight: "297", headerSize: "medium", customHeaderHeight: "80", showDoctorInfo: true, showCC: true, showOE: true, showDiagnosis: true, showInvestigation: true }, ...JSON.parse(stored) };
    } catch {}
    return { pageSize: "A4", customWidth: "210", customHeight: "297", headerSize: "medium", customHeaderHeight: "80", showDoctorInfo: true, showCC: true, showOE: true, showDiagnosis: true, showInvestigation: true };
  });

  const handlePrintSettingsChange = (s: PrintSettings) => {
    setPrintSettings(s);
    localStorage.setItem("print-settings", JSON.stringify(s));
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8" onClick={() => setEditDoctor(!editDoctor)}>
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Doctor</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleNewPrescription}>
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Rx</span>
            </Button>
            <Button size="sm" className="gap-1.5 text-xs h-8 shadow-sm" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
        <DoctorHeader doctor={doctor} onChange={setDoctor} editMode={editDoctor} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-5 bg-card border border-border shadow-sm h-10">
            <TabsTrigger value="write" className="gap-1.5 text-xs data-[state=active]:shadow-sm">
              <Stethoscope className="w-3.5 h-3.5" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5 text-xs data-[state=active]:shadow-sm">
              <Eye className="w-3.5 h-3.5" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="setup" className="gap-1.5 text-xs data-[state=active]:shadow-sm">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Print Setup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="write" className="space-y-5 mt-0">
            {/* Patient Info - Full Width */}
            <PatientInfo patient={patient} onChange={setPatient} />

            {/* Two Column Layout: Rx Left, Clinical Right */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
              {/* Left Column - Prescription */}
              <div className="space-y-5 min-w-0">
                <MedicineSection medicines={medicines} onChange={setMedicines} options={medicineOptions} onOptionsChange={setMedicineOptions} />
                <AdviceSection data={advice} onChange={setAdvice} options={medicineOptions} />
              </div>

              {/* Right Column - Clinical Notes */}
              <div className="min-w-0">
                <ClinicalSection data={clinical} onChange={setClinical} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <PrintPreview doctor={doctor} patient={patient} clinical={clinical} medicines={medicines} advice={advice} printSettings={printSettings} />
          </TabsContent>

          <TabsContent value="setup" className="mt-0">
            <PrintSetup settings={printSettings} onChange={handlePrintSettingsChange} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
