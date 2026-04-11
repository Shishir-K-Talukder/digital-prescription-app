import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

export interface OnExaminationData {
  bp: string; weight: string; temp: string; pulse: string; heart: string; lungs: string; abd: string;
  anaemia: string; jaundice: string; cyanosis: string; oedema: string;
  rr: string; spo2: string; lmp: string; edd: string; fm: string; fhr: string; gravida: string;
}

export interface ClinicalData {
  chiefComplaint: string;
  onExamination: OnExaminationData;
  drugHistory: string;
  diagnosis: string;
  investigation: string;
}

export const defaultOnExamination: OnExaminationData = {
  bp: "", weight: "", temp: "", pulse: "", heart: "", lungs: "", abd: "",
  anaemia: "Absent", jaundice: "Absent", cyanosis: "Absent", oedema: "Absent",
  rr: "", spo2: "", lmp: "", edd: "", fm: "", fhr: "Absent", gravida: "",
};

const COMMON_INVESTIGATIONS = [
  "CBC", "ESR", "CRP", "RBS", "FBS", "HbA1c",
  "S. Creatinine", "S. Uric Acid", "S. Electrolyte",
  "Lipid Profile", "LFT", "Thyroid Profile (FT4, TSH)",
  "Urine R/M/E", "Urine C/S", "Stool R/M/E",
  "X-Ray Chest P/A", "X-Ray L/S Spine", "X-Ray KUB",
  "USG of W/A", "USG of KUB", "Echo",
  "ECG", "CT Scan", "MRI",
  "Blood Grouping", "HBsAg", "Anti-HCV",
  "Widal Test", "Blood C/S", "Sputum for AFB",
  "Dengue NS1 Ag", "Dengue IgM/IgG",
  "S. Bilirubin", "S. Albumin", "PT/INR",
  "ANA", "Anti-dsDNA", "RA Factor",
];

interface Props {
  data: ClinicalData;
  onChange: (d: ClinicalData) => void;
}

const presentAbsentOptions = ["Absent", "Present"];

// O/E suggestion history stored in localStorage
const OE_HISTORY_KEY = "oe-field-history";

const getOEHistory = (): Record<string, string[]> => {
  try {
    return JSON.parse(localStorage.getItem(OE_HISTORY_KEY) || "{}");
  } catch { return {}; }
};

const saveOEValue = (fieldKey: string, value: string) => {
  if (!value || value === "Absent" || value === "Present") return;
  const history = getOEHistory();
  const existing = history[fieldKey] || [];
  if (!existing.includes(value)) {
    history[fieldKey] = [value, ...existing].slice(0, 10);
    localStorage.setItem(OE_HISTORY_KEY, JSON.stringify(history));
  }
};

const OEInputWithSuggestions = ({ fieldKey, value, placeholder, onChange }: {
  fieldKey: string; value: string; placeholder: string; onChange: (v: string) => void;
}) => {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focused) {
      const history = getOEHistory();
      const items = (history[fieldKey] || []).filter(
        (s) => !value || s.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(items);
    }
  }, [focused, value, fieldKey]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (!wrapperRef.current?.contains(document.activeElement)) {
        setFocused(false);
        if (value) saveOEValue(fieldKey, value);
      }
    }, 150);
  }, [fieldKey, value]);

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="h-7 text-xs border-0 shadow-none bg-transparent"
      />
      {focused && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 bg-popover border border-border rounded-md shadow-md mt-0.5 max-h-[120px] overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="w-full text-left px-2 py-1 text-xs hover:bg-accent transition-colors"
              onMouseDown={(e) => { e.preventDefault(); onChange(s); setFocused(false); saveOEValue(fieldKey, s); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const InvestigationTab = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [customInv, setCustomInv] = useState("");

  // Parse current investigation string into array of items
  const currentItems = value
    ? value.split("\n").map((s) => s.replace(/^•\s*/, "").trim()).filter(Boolean)
    : [];

  const updateInvestigation = (items: string[]) => {
    onChange(items.map((item) => `• ${item}`).join("\n"));
  };

  const toggleItem = (item: string) => {
    if (currentItems.includes(item)) {
      updateInvestigation(currentItems.filter((i) => i !== item));
    } else {
      updateInvestigation([...currentItems, item]);
    }
  };

  const addCustom = () => {
    const trimmed = customInv.trim();
    if (trimmed && !currentItems.includes(trimmed)) {
      updateInvestigation([...currentItems, trimmed]);
      setCustomInv("");
    }
  };

  const removeItem = (item: string) => {
    updateInvestigation(currentItems.filter((i) => i !== item));
  };

  return (
    <div className="space-y-3">
      {/* Selected items as bullet chips */}
      {currentItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-accent/20 rounded-lg border border-border/50 min-h-[36px]">
          {currentItems.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-medium px-2 py-0.5 rounded-full border border-primary/20"
            >
              • {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Custom investigation input */}
      <div className="flex gap-1.5">
        <Input
          value={customInv}
          onChange={(e) => setCustomInv(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
          placeholder="Add custom investigation..."
          className="h-8 text-xs flex-1"
        />
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1 shrink-0" onClick={addCustom} disabled={!customInv.trim()}>
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>

      {/* Common investigations checkboxes */}
      <div className="max-h-[280px] overflow-y-auto rounded-lg border border-border">
        <div className="grid grid-cols-2 gap-0">
          {COMMON_INVESTIGATIONS.map((inv, idx) => {
            const checked = currentItems.includes(inv);
            return (
              <label
                key={inv}
                className={`flex items-center gap-2 px-2.5 py-1.5 text-xs cursor-pointer hover:bg-accent/40 transition-colors border-b border-border/30 ${
                  idx % 2 === 0 ? "border-r border-border/30" : ""
                } ${checked ? "bg-primary/5 font-medium" : ""}`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleItem(inv)}
                  className="h-3.5 w-3.5"
                />
                <span className={checked ? "text-primary" : "text-foreground"}>{inv}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

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
    <div className="section-card p-5 sticky top-[60px]">
      <h3 className="section-header mb-4">
        <div className="section-header-icon flex items-center justify-center">
          <ClipboardList className="w-3.5 h-3.5" />
        </div>
        Clinical Notes
      </h3>

      <Tabs defaultValue="cc" className="w-full">
        <TabsList className="mb-4 w-full grid grid-cols-5 h-10 bg-muted/60 p-1 rounded-lg">
          <TabsTrigger value="cc" className="text-xs font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
            C/C
          </TabsTrigger>
          <TabsTrigger value="oe" className="text-xs font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
            O/E
          </TabsTrigger>
          <TabsTrigger value="dh" className="text-xs font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
            D/H
          </TabsTrigger>
          <TabsTrigger value="dx" className="text-xs font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
            D/X
          </TabsTrigger>
          <TabsTrigger value="inv" className="text-xs font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
            Inv
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cc" className="mt-0">
          <Label className="text-xs text-muted-foreground mb-1.5 block font-medium">Chief Complaint</Label>
          <Textarea
            value={data.chiefComplaint}
            onChange={(e) => onChange({ ...data, chiefComplaint: e.target.value })}
            placeholder="জ্বর, কাশি ৩ দিন যাবৎ..."
            className="text-sm min-h-[100px] resize-none"
          />
          {/* Quick suggestion chips */}
          <div className="mt-2">
            <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium">Quick Add:</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Fever", "Cough", "Cold", "Headache", "Body ache",
                "Sore throat", "Vomiting", "Diarrhoea", "Abdominal pain",
                "Chest pain", "Breathlessness", "Weakness", "Dizziness",
                "Burning micturition", "Skin rash", "Joint pain",
                "Back pain", "Loss of appetite", "Weight loss",
              ].map((cc) => (
                <button
                  key={cc}
                  type="button"
                  onClick={() => {
                    const current = data.chiefComplaint.trim();
                    const separator = current ? ", " : "";
                    onChange({ ...data, chiefComplaint: current + separator + cc });
                  }}
                  className="px-2 py-0.5 text-[11px] font-medium rounded-full border border-border bg-muted/40 text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
                >
                  + {cc}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="oe" className="mt-0">
          <div className="rounded-lg border border-border overflow-hidden">
            {oeFields.map((f, idx) => (
              <div
                key={f.key}
                className={`flex items-center text-sm ${idx % 2 === 0 ? "bg-card" : "bg-muted/20"} ${idx < oeFields.length - 1 ? "border-b border-border/50" : ""}`}
              >
                <div className="w-[72px] px-2.5 py-1.5 font-semibold text-xs text-primary border-r border-border/50 shrink-0 bg-accent/30">
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
                    <OEInputWithSuggestions fieldKey={f.key} value={data.onExamination[f.key]} placeholder={f.placeholder} onChange={(v) => updateOE(f.key, v)} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dh" className="mt-0">
          <Label className="text-xs text-muted-foreground mb-1.5 block font-medium">Drug History</Label>
          <Textarea
            value={data.drugHistory}
            onChange={(e) => onChange({ ...data, drugHistory: e.target.value })}
            placeholder="রোগী আগে কী কী ওষুধ খেয়েছে / বর্তমানে কী চলছে..."
            className="text-sm min-h-[140px] resize-none"
          />
        </TabsContent>

        <TabsContent value="dx" className="mt-0">
          <Label className="text-xs text-muted-foreground mb-1.5 block font-medium">Diagnosis</Label>
          <Textarea
            value={data.diagnosis}
            onChange={(e) => onChange({ ...data, diagnosis: e.target.value })}
            placeholder="Viral Fever"
            className="text-sm min-h-[140px] resize-none"
          />
        </TabsContent>

        <TabsContent value="inv" className="mt-0">
          <Label className="text-xs text-muted-foreground mb-1.5 block font-medium">Investigation</Label>
          <InvestigationTab
            value={data.investigation}
            onChange={(v) => onChange({ ...data, investigation: v })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicalSection;
