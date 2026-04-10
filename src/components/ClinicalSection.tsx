import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface OnExaminationData {
  bp: string;
  weight: string;
  temp: string;
  pulse: string;
  heart: string;
  lungs: string;
  abd: string;
  anaemia: string;
  jaundice: string;
  cyanosis: string;
  oedema: string;
  rr: string;
  spo2: string;
  lmp: string;
  edd: string;
  fm: string;
  fhr: string;
  gravida: string;
}

export interface ClinicalData {
  chiefComplaint: string;
  onExamination: OnExaminationData;
  diagnosis: string;
  investigation: string;
}

export const defaultOnExamination: OnExaminationData = {
  bp: "", weight: "", temp: "", pulse: "", heart: "", lungs: "", abd: "",
  anaemia: "Absent", jaundice: "Absent", cyanosis: "Absent", oedema: "Absent",
  rr: "", spo2: "", lmp: "", edd: "", fm: "", fhr: "Absent", gravida: "",
};

interface Props {
  data: ClinicalData;
  onChange: (d: ClinicalData) => void;
}

const presentAbsentOptions = ["Absent", "Present"];

const ClinicalSection = ({ data, onChange }: Props) => {
  const updateOE = (key: keyof OnExaminationData, value: string) => {
    onChange({ ...data, onExamination: { ...data.onExamination, [key]: value } });
  };

  const oeFields: { key: keyof OnExaminationData; label: string; placeholder: string; type: "text" | "select" | "date" | "selectCustom" }[] = [
    { key: "bp", label: "BP", placeholder: "120/80 mmHg", type: "text" },
    { key: "weight", label: "Weight", placeholder: "70 kg", type: "text" },
    { key: "temp", label: "Temp", placeholder: "99 F", type: "text" },
    { key: "pulse", label: "Pulse", placeholder: "80 bpm", type: "text" },
    { key: "heart", label: "Heart", placeholder: "Heart", type: "text" },
    { key: "lungs", label: "Lungs", placeholder: "Lungs", type: "text" },
    { key: "abd", label: "Abd", placeholder: "Soft, Non-Tender", type: "text" },
    { key: "anaemia", label: "Anaemia", placeholder: "Absent", type: "select" },
    { key: "jaundice", label: "Jaundice", placeholder: "Absent", type: "select" },
    { key: "cyanosis", label: "Cyanosis", placeholder: "Absent", type: "select" },
    { key: "oedema", label: "Oedema", placeholder: "Absent", type: "select" },
    { key: "rr", label: "RR", placeholder: "Absent", type: "text" },
    { key: "spo2", label: "SPO2", placeholder: "Absent", type: "text" },
    { key: "lmp", label: "LMP", placeholder: "Select Date", type: "date" },
    { key: "edd", label: "EDD", placeholder: "Select Date", type: "date" },
    { key: "fm", label: "FM", placeholder: "Present/Absent", type: "select" },
    { key: "fhr", label: "FHR", placeholder: "Absent", type: "text" },
    { key: "gravida", label: "GRAVIDA", placeholder: "1st/2nd/Primi", type: "text" },
  ];

  const textFields: { key: "chiefComplaint" | "diagnosis" | "investigation"; label: string; shortLabel: string; placeholder: string }[] = [
    { key: "chiefComplaint", label: "Chief Complaint", shortLabel: "C/C", placeholder: "জ্বর, কাশি ৩ দিন যাবৎ..." },
    { key: "diagnosis", label: "Diagnosis", shortLabel: "D/X", placeholder: "Viral Fever" },
    { key: "investigation", label: "Investigation", shortLabel: "Inv", placeholder: "CBC, X-Ray Chest..." },
  ];

  return (
    <div className="bg-section-bg rounded-lg p-4 mb-4 border border-border">
      <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary" />
        Clinical Notes
      </h3>

      <Tabs defaultValue="cc" className="w-full">
        <TabsList className="mb-3 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="cc" className="text-xs">C/C</TabsTrigger>
          <TabsTrigger value="oe" className="text-xs">O/E</TabsTrigger>
          <TabsTrigger value="dx" className="text-xs">D/X</TabsTrigger>
          <TabsTrigger value="inv" className="text-xs">Investigation</TabsTrigger>
        </TabsList>

        {/* C/C Tab */}
        <TabsContent value="cc">
          <Label className="text-xs text-muted-foreground">
            <span className="font-bold text-accent-foreground">C/C</span> — Chief Complaint
          </Label>
          <Textarea
            value={data.chiefComplaint}
            onChange={(e) => onChange({ ...data, chiefComplaint: e.target.value })}
            placeholder="জ্বর, কাশি ৩ দিন যাবৎ..."
            className="text-sm min-h-[80px] resize-none"
          />
        </TabsContent>

        {/* O/E Tab - Structured */}
        <TabsContent value="oe">
          <div className="border border-border rounded-md overflow-hidden">
            {oeFields.map((f, idx) => (
              <div
                key={f.key}
                className={`flex items-center text-sm ${idx % 2 === 0 ? "bg-background" : "bg-muted/30"} ${idx < oeFields.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="w-28 sm:w-32 px-3 py-2 font-bold text-xs text-foreground border-r border-border shrink-0">
                  {f.label}
                </div>
                <div className="flex-1 px-2 py-1">
                  {f.type === "select" ? (
                    <Select value={data.onExamination[f.key] || "Absent"} onValueChange={(v) => updateOE(f.key, v)}>
                      <SelectTrigger className="h-7 text-xs border-0 shadow-none bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {presentAbsentOptions.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : f.type === "date" ? (
                    <Input
                      type="date"
                      value={data.onExamination[f.key]}
                      onChange={(e) => updateOE(f.key, e.target.value)}
                      className="h-7 text-xs border-0 shadow-none bg-transparent"
                    />
                  ) : (
                    <Input
                      value={data.onExamination[f.key]}
                      onChange={(e) => updateOE(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="h-7 text-xs border-0 shadow-none bg-transparent"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* D/X Tab */}
        <TabsContent value="dx">
          <Label className="text-xs text-muted-foreground">
            <span className="font-bold text-accent-foreground">D/X</span> — Diagnosis
          </Label>
          <Textarea
            value={data.diagnosis}
            onChange={(e) => onChange({ ...data, diagnosis: e.target.value })}
            placeholder="Viral Fever"
            className="text-sm min-h-[80px] resize-none"
          />
        </TabsContent>

        {/* Investigation Tab */}
        <TabsContent value="inv">
          <Label className="text-xs text-muted-foreground">
            <span className="font-bold text-accent-foreground">Inv</span> — Investigation
          </Label>
          <Textarea
            value={data.investigation}
            onChange={(e) => onChange({ ...data, investigation: e.target.value })}
            placeholder="CBC, X-Ray Chest..."
            className="text-sm min-h-[80px] resize-none"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicalSection;
