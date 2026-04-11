import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

export interface PatientData {
  name: string;
  age: string;
  sex: string;
  mobile: string;
  address: string;
  date: string;
}

interface Props {
  patient: PatientData;
  onChange: (p: PatientData) => void;
}

const PATIENT_HISTORY_KEY = "patient-field-history";

interface PatientHistoryEntry {
  name: string;
  age: string;
  sex: string;
  mobile: string;
  address: string;
}

const getPatientHistory = (): PatientHistoryEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(PATIENT_HISTORY_KEY) || "[]");
  } catch { return []; }
};

export const savePatientToHistory = (patient: PatientData) => {
  if (!patient.name.trim()) return;
  const history = getPatientHistory();
  const existing = history.findIndex(
    (h) => h.name.toLowerCase() === patient.name.toLowerCase() && h.mobile === patient.mobile
  );
  const entry: PatientHistoryEntry = {
    name: patient.name, age: patient.age, sex: patient.sex,
    mobile: patient.mobile, address: patient.address,
  };
  if (existing >= 0) {
    history[existing] = entry;
  } else {
    history.unshift(entry);
  }
  localStorage.setItem(PATIENT_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
};

const PatientFieldWithSuggestions = ({
  value, placeholder, className, suggestions, onSelect, onChange,
}: {
  value: string; placeholder: string; className?: string;
  suggestions: { label: string; data: PatientHistoryEntry }[];
  onSelect: (entry: PatientHistoryEntry) => void;
  onChange: (v: string) => void;
}) => {
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = focused && value.length > 0
    ? suggestions.filter((s) => s.label.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : focused ? suggestions.slice(0, 8) : [];

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (!wrapperRef.current?.contains(document.activeElement)) {
        setFocused(false);
      }
    }, 150);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
      />
      {filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 bg-popover border border-border rounded-md shadow-md mt-0.5 max-h-[160px] overflow-y-auto">
          {filtered.map((s, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-accent transition-colors flex justify-between items-center"
              onMouseDown={(e) => { e.preventDefault(); onSelect(s.data); setFocused(false); }}
            >
              <span className="font-medium">{s.data.name}</span>
              <span className="text-muted-foreground text-[10px]">{s.data.age} • {s.data.mobile}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PatientInfo = ({ patient, onChange }: Props) => {
  const [history, setHistory] = useState<PatientHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getPatientHistory());
  }, []);

  const nameSuggestions = history.map((h) => ({ label: h.name, data: h }));

  const handleSelectPatient = (entry: PatientHistoryEntry) => {
    onChange({
      ...patient,
      name: entry.name,
      age: entry.age,
      sex: entry.sex,
      mobile: entry.mobile,
      address: entry.address,
    });
  };

  return (
    <div className="section-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <User className="w-4 h-4 text-primary" />
        Patient Information
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="col-span-2">
          <Label className="text-[11px] text-muted-foreground mb-1 block">Patient Name</Label>
          <PatientFieldWithSuggestions
            value={patient.name}
            onChange={(v) => onChange({ ...patient, name: v })}
            placeholder="রোগীর নাম"
            className="h-9 text-sm"
            suggestions={nameSuggestions}
            onSelect={handleSelectPatient}
          />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Age</Label>
          <Input value={patient.age} onChange={(e) => onChange({ ...patient, age: e.target.value })} placeholder="বয়স" className="h-9 text-sm" />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Sex</Label>
          <Select value={patient.sex} onValueChange={(v) => onChange({ ...patient, sex: v })}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Mobile</Label>
          <Input value={patient.mobile} onChange={(e) => onChange({ ...patient, mobile: e.target.value })} placeholder="01XXXXXXXXX" className="h-9 text-sm" />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Date</Label>
          <Input type="date" value={patient.date} onChange={(e) => onChange({ ...patient, date: e.target.value })} className="h-9 text-sm" />
        </div>
        <div className="col-span-2 sm:col-span-3 lg:col-span-6">
          <Label className="text-[11px] text-muted-foreground mb-1 block">Address</Label>
          <Input value={patient.address} onChange={(e) => onChange({ ...patient, address: e.target.value })} placeholder="ঠিকানা" className="h-9 text-sm" />
        </div>
      </div>
    </div>
  );
};

export default PatientInfo;
