import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ClinicalData {
  chiefComplaint: string;
  onExamination: string;
  diagnosis: string;
  investigation: string;
}

interface Props {
  data: ClinicalData;
  onChange: (d: ClinicalData) => void;
}

const ClinicalSection = ({ data, onChange }: Props) => {
  const fields: { key: keyof ClinicalData; label: string; shortLabel: string; placeholder: string }[] = [
    { key: "chiefComplaint", label: "Chief Complaint", shortLabel: "C/C", placeholder: "জ্বর, কাশি ৩ দিন যাবৎ..." },
    { key: "onExamination", label: "On Examination", shortLabel: "O/E", placeholder: "Temp: 101°F, Pulse: 90 bpm..." },
    { key: "diagnosis", label: "Diagnosis", shortLabel: "D/X", placeholder: "Viral Fever" },
    { key: "investigation", label: "Investigation", shortLabel: "Inv", placeholder: "CBC, X-Ray Chest..." },
  ];

  return (
    <div className="bg-section-bg rounded-lg p-4 mb-4 border border-border">
      <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary" />
        Clinical Notes
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.key}>
            <Label className="text-xs text-muted-foreground">
              <span className="font-bold text-accent-foreground">{f.shortLabel}</span> — {f.label}
            </Label>
            <Textarea
              value={data[f.key]}
              onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="text-sm min-h-[60px] resize-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClinicalSection;
