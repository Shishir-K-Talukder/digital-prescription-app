import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Loader2, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import TreatmentTemplateSelector from "./TreatmentTemplateSelector";
import { useRef, useState } from "react";
import { MedicineOptions } from "./MedicineSettings";
import { useMedicineSearch } from "@/hooks/useMedicineSearch";

export interface TaperingDose {
  id: string;
  dose: string;
  duration: string;
}

export interface Medicine {
  id: string;
  type: string;
  name: string;
  dose: string;
  duration: string;
  mealTiming: string;
  instructions: string;
  taperingDoses?: TaperingDose[];
}

interface Props {
  medicines: Medicine[];
  onChange: (m: Medicine[]) => void;
  options: MedicineOptions;
  onOptionsChange: (o: MedicineOptions) => void;
}

const MedicineNameInput = ({ value, onChange, onSelect }: { value: string; onChange: (v: string) => void; onSelect: (fullName: string, detectedType: string) => void }) => {
  const [query, setQuery] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions, loading } = useMedicineSearch(query);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSelect = (med: { name: string; strength: string; detectedType: string }) => {
    const fullName = `${med.detectedType}. ${med.name} ${med.strength}`.trim();
    setQuery(fullName);
    onSelect(fullName, med.detectedType);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setShowSuggestions(true); }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder="Type medicine name..."
        className="h-8 text-xs"
      />
      {showSuggestions && (query.length >= 2) && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" /> Searching medex.com.bd...
            </div>
          )}
          {!loading && suggestions.length === 0 && query.length >= 2 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">No results found</div>
          )}
          {suggestions.map((med, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full text-left px-3 py-1.5 hover:bg-accent/50 transition-colors border-b border-border/30 last:border-0"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(med); }}
            >
              <div className="text-xs font-medium text-foreground">
                <span className="inline-block bg-primary/15 text-primary font-bold rounded px-1.5 py-0.5 mr-1.5 text-[10px]">{med.detectedType}</span>
                {med.name} {med.strength}
              </div>
              <div className="text-[10px] text-muted-foreground pl-[42px]">{med.generic} • {med.company}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const DoseInput = ({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder="Dose..."
        className="h-8 text-xs"
      />
      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
          {options.map((d) => (
            <button
              key={d}
              type="button"
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent/50 transition-colors border-b border-border/30 last:border-0 ${value === d ? "bg-accent text-accent-foreground font-medium" : ""}`}
              onMouseDown={(e) => { e.preventDefault(); onChange(d); setShowDropdown(false); }}
            >
              {d}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TaperingSection = ({ taperingDoses, options, onUpdate }: {
  taperingDoses: TaperingDose[];
  options: MedicineOptions;
  onUpdate: (doses: TaperingDose[]) => void;
}) => {
  const addTaperingDose = () => {
    onUpdate([...taperingDoses, {
      id: crypto.randomUUID(),
      dose: options.doses[0] || "1+0+0",
      duration: options.durations[0] || "3 days",
    }]);
  };

  const updateTapering = (id: string, field: keyof TaperingDose, value: string) => {
    onUpdate(taperingDoses.map((t) => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTapering = (id: string) => {
    onUpdate(taperingDoses.filter((t) => t.id !== id));
  };

  return (
    <div className="mt-2 pl-7 space-y-1.5">
      {taperingDoses.map((td, idx) => (
        <div key={td.id} className="flex items-center gap-2 bg-accent/20 rounded-md px-2 py-1.5 border border-border/50">
          <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
            Then →
          </span>
          <div className="flex-1">
            <DoseInput value={td.dose} options={options.doses} onChange={(v) => updateTapering(td.id, "dose", v)} />
          </div>
          <div className="flex-1">
            <Select value={td.duration} onValueChange={(v) => updateTapering(td.id, "duration", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{options.durations.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeTapering(td.id)}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-[11px] gap-1 border-dashed"
        onClick={addTaperingDose}
      >
        <Plus className="w-3 h-3" /> Add Tapering Dose
      </Button>
    </div>
  );
};

const MedicineSection = ({ medicines, onChange, options, onOptionsChange }: Props) => {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragRef = useRef<number | null>(null);
  const [expandedTapering, setExpandedTapering] = useState<Set<string>>(new Set());

  const toggleTapering = (id: string) => {
    setExpandedTapering((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addMedicine = () => {
    onChange([
      ...medicines,
      { id: crypto.randomUUID(), type: options.types[0] || "Tab", name: "", dose: options.doses[2] || "1+0+1", duration: options.durations[1] || "5 days", mealTiming: options.meals[0] || "After meal", instructions: "", taperingDoses: [] },
    ]);
  };

  const removeMedicine = (id: string) => onChange(medicines.filter((m) => m.id !== id));

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    onChange(medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const updateMedicineMulti = (id: string, updates: Partial<Medicine>) => {
    onChange(medicines.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const updateTaperingDoses = (medId: string, taperingDoses: TaperingDose[]) => {
    onChange(medicines.map((m) => m.id === medId ? { ...m, taperingDoses } : m));
  };

  const handleDragStart = (idx: number) => { setDragIdx(idx); dragRef.current = idx; };
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setOverIdx(idx); };
  const handleDrop = (idx: number) => {
    const from = dragRef.current;
    if (from === null || from === idx) { setDragIdx(null); setOverIdx(null); return; }
    const updated = [...medicines];
    const [moved] = updated.splice(from, 1);
    updated.splice(idx, 0, moved);
    onChange(updated);
    setDragIdx(null); setOverIdx(null); dragRef.current = null;
  };
  const handleDragEnd = () => { setDragIdx(null); setOverIdx(null); dragRef.current = null; };

  return (
    <div className="section-card p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-xl font-serif italic text-primary">℞</span>
          Prescription
        </h3>
        <TreatmentTemplateSelector medicines={medicines} onApplyTemplate={onChange} />
      </div>

      {medicines.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-sm">No medicines added yet</p>
          <p className="text-xs mt-1">Click "Add Medicine" to start prescribing</p>
        </div>
      )}

      <div className="space-y-2.5">
        {medicines.map((med, idx) => {
          const hasTapering = (med.taperingDoses?.length || 0) > 0;
          const isExpanded = expandedTapering.has(med.id) || hasTapering;

          return (
            <div
              key={med.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              className={`rounded-lg border p-3 transition-all ${
                dragIdx === idx ? "opacity-50 border-primary bg-accent/30" : overIdx === idx ? "border-primary border-dashed bg-accent/20" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex gap-2">
                <div className="flex flex-col items-center gap-1 pt-5">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2">
                  <div className="col-span-2">
                    <Label className="text-[11px] text-muted-foreground">Medicine Name</Label>
                    <MedicineNameInput value={med.name} onChange={(v) => updateMedicine(med.id, "name", v)} onSelect={(fullName, detectedType) => updateMedicineMulti(med.id, { name: fullName, type: detectedType })} />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Dose</Label>
                    <DoseInput value={med.dose} options={options.doses} onChange={(v) => updateMedicine(med.id, "dose", v)} />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Duration</Label>
                    <Select value={med.duration} onValueChange={(v) => updateMedicine(med.id, "duration", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{options.durations.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-1">
                    <div className="flex-1">
                      <Label className="text-[11px] text-muted-foreground">Meal</Label>
                      <Select value={med.mealTiming} onValueChange={(v) => updateMedicine(med.id, "mealTiming", v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{options.meals.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeMedicine(med.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tapering toggle button */}
              <div className="mt-2 pl-7 flex items-center gap-2">
                <Input value={med.instructions} onChange={(e) => updateMedicine(med.id, "instructions", e.target.value)} placeholder="Special instructions (optional)" className="h-7 text-xs flex-1" />
                <Button
                  variant={isExpanded ? "secondary" : "outline"}
                  size="sm"
                  className="h-7 text-[10px] gap-1 shrink-0"
                  onClick={() => toggleTapering(med.id)}
                >
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  Tapering
                </Button>
              </div>

              {/* Tapering doses section */}
              {isExpanded && (
                <TaperingSection
                  taperingDoses={med.taperingDoses || []}
                  options={options}
                  onUpdate={(doses) => updateTaperingDoses(med.id, doses)}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={addMedicine} size="sm" variant="default" className="h-8 text-xs gap-1.5 shadow-sm">
          <Plus className="w-3.5 h-3.5" /> Add Medicine
        </Button>
      </div>
    </div>
  );
};

export default MedicineSection;
