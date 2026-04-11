import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList } from "lucide-react";

export interface OnExaminationData {
  bp: string; weight: string; temp: string; pulse: string; heart: string; lungs: string; abd: string;
  anaemia: string; jaundice: string; cyanosis: string; oedema: string;
  rr: string; spo2: string; lmp: string; edd: string; fm: string; fhr: string; gravida: string;
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

  const oeFields: { key: keyof OnExaminationData; label: string; placeholder: string; type: "text" | "select" | "date" }[] = [
    { key: "bp", label: "BP", placeholder: "120/80", type: "text" },
    { key: "weight", label: "Weight", placeholder: "70 kg", type: "text" },
    { key: "temp", label: "Temp", placeholder: "99°F", type: "text" },
    { key: "pulse", label: "Pulse", placeholder: "80 bpm", type: "text" },
    { key: "heart", label: "Heart", placeholder: "Heart", type: "text" },
    { key: "lungs", label: "Lungs", placeholder: "Lungs", type: "text" },
    { key: "abd", label: "Abd", placeholder: "Soft", type: "text" },
    { key: "anaemia", label: "Anaemia", placeholder: "Absent", type: "select" },
    { key: "jaundice", label: "Jaundice", placeholder: "Absent", type: "select" },
    { key: "cyanosis", label: "Cyanosis", placeholder: "Absent", type: "select" },
    { key: "oedema", label: "Oedema", placeholder: "Absent", type: "select" },
    { key: "rr", label: "RR", placeholder: "RR", type: "text" },
    { key: "spo2", label: "SPO2", placeholder: "SPO2", type: "text" },
    { key: "lmp", label: "LMP", placeholder: "Date", type: "date" },
    { key: "edd", label: "EDD", placeholder: "Date", type: "date" },
    { key: "fm", label: "FM", placeholder: "Present/Absent", type: "select" },
    { key: "fhr", label: "FHR", placeholder: "FHR", type: "text" },
    { key: "gravida", label: "GRAVIDA", placeholder: "Primi", type: "text" },
  ];

  return (
    <div className="section-card p-4 sticky top-[60px]">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-primary" />
        Clinical Notes
      </h3>

      <Tabs defaultValue="cc" className="w-full">
        <TabsList className="mb-3 flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="cc" className="text-[11px] h-7 px-2.5">C/C</TabsTrigger>
          <TabsTrigger value="oe" className="text-[11px] h-7 px-2.5">O/E</TabsTrigger>
          <TabsTrigger value="dx" className="text-[11px] h-7 px-2.5">D/X</TabsTrigger>
          <TabsTrigger value="inv" className="text-[11px] h-7 px-2.5">Inv</TabsTrigger>
        </TabsList>

        <TabsContent value="cc" className="mt-0">
          <Label className="text-[11px] text-muted-foreground mb-1.5 block">Chief Complaint</Label>
          <Textarea
            value={data.chiefComplaint}
            onChange={(e) => onChange({ ...data, chiefComplaint: e.target.value })}
            placeholder="জ্বর, কাশি ৩ দিন যাবৎ..."
            className="text-sm min-h-[120px] resize-none"
          />
        </TabsContent>

        <TabsContent value="oe" className="mt-0">
          <div className="rounded-lg border border-border overflow-hidden">
            {oeFields.map((f, idx) => (
              <div
                key={f.key}
                className={`flex items-center text-sm ${idx % 2 === 0 ? "bg-card" : "bg-muted/20"} ${idx < oeFields.length - 1 ? "border-b border-border/60" : ""}`}
              >
                <div className="w-20 px-2.5 py-1.5 font-medium text-[11px] text-foreground border-r border-border/60 shrink-0">
                  {f.label}
                </div>
                <div className="flex-1 px-1.5 py-0.5">
                  {f.type === "select" ? (
                    <Select value={data.onExamination[f.key] || "Absent"} onValueChange={(v) => updateOE(f.key, v)}>
                      <SelectTrigger className="h-7 text-xs border-0 shadow-none bg-transparent"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {presentAbsentOptions.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : f.type === "date" ? (
                    <Input type="date" value={data.onExamination[f.key]} onChange={(e) => updateOE(f.key, e.target.value)} className="h-7 text-xs border-0 shadow-none bg-transparent" />
                  ) : (
                    <Input value={data.onExamination[f.key]} onChange={(e) => updateOE(f.key, e.target.value)} placeholder={f.placeholder} className="h-7 text-xs border-0 shadow-none bg-transparent" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dx" className="mt-0">
          <Label className="text-[11px] text-muted-foreground mb-1.5 block">Diagnosis</Label>
          <Textarea
            value={data.diagnosis}
            onChange={(e) => onChange({ ...data, diagnosis: e.target.value })}
            placeholder="Viral Fever"
            className="text-sm min-h-[120px] resize-none"
          />
        </TabsContent>

        <TabsContent value="inv" className="mt-0">
          <Label className="text-[11px] text-muted-foreground mb-1.5 block">Investigation</Label>
          <Textarea
            value={data.investigation}
            onChange={(e) => onChange({ ...data, investigation: e.target.value })}
            placeholder="CBC, X-Ray Chest..."
            className="text-sm min-h-[120px] resize-none"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicalSection;
