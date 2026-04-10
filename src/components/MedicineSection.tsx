import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export interface Medicine {
  id: string;
  type: string;
  name: string;
  dose: string;
  duration: string;
  mealTiming: string;
  instructions: string;
}

interface Props {
  medicines: Medicine[];
  onChange: (m: Medicine[]) => void;
}

const TYPES = ["Tab", "Cap", "Syr", "Inj", "Supp", "Drop", "Cream", "Oint"];
const DOSES = ["1+0+0", "0+0+1", "1+0+1", "1+1+1", "1+1+1+1", "0+1+0"];
const DURATIONS = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "Continue"];
const MEAL = ["খাবার পরে (After meal)", "খাবার আগে (Before meal)", "Empty stomach"];

const MedicineSection = ({ medicines, onChange }: Props) => {
  const addMedicine = () => {
    onChange([
      ...medicines,
      { id: crypto.randomUUID(), type: "Tab", name: "", dose: "1+0+1", duration: "5 days", mealTiming: "খাবার পরে (After meal)", instructions: "" },
    ]);
  };

  const removeMedicine = (id: string) => {
    onChange(medicines.filter((m) => m.id !== id));
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    onChange(medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  return (
    <div className="bg-section-bg rounded-lg p-4 mb-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <span className="text-2xl font-serif italic text-primary">℞</span>
          Prescription
        </h3>
        <Button onClick={addMedicine} size="sm" variant="outline" className="h-7 text-xs gap-1">
          <Plus className="w-3 h-3" /> Add Medicine
        </Button>
      </div>

      {medicines.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No medicines added. Click "Add Medicine" to start.</p>
      )}

      <div className="space-y-3">
        {medicines.map((med, idx) => (
          <div key={med.id} className="bg-card rounded-md p-3 border border-border relative">
            <div className="absolute -left-1 -top-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
              {idx + 1}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">Type</Label>
                <Select value={med.type} onValueChange={(v) => updateMedicine(med.id, "type", v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-[10px] text-muted-foreground">Medicine Name</Label>
                <Input value={med.name} onChange={(e) => updateMedicine(med.id, "name", e.target.value)} placeholder="Napa 500mg" className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Dose</Label>
                <Select value={med.dose} onValueChange={(v) => updateMedicine(med.id, "dose", v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{DOSES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Duration</Label>
                <Select value={med.duration} onValueChange={(v) => updateMedicine(med.id, "duration", v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{DURATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-1">
                <div className="flex-1">
                  <Label className="text-[10px] text-muted-foreground">Meal</Label>
                  <Select value={med.mealTiming} onValueChange={(v) => updateMedicine(med.id, "mealTiming", v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{MEAL.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeMedicine(med.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <Input value={med.instructions} onChange={(e) => updateMedicine(med.id, "instructions", e.target.value)} placeholder="Special instructions (optional)" className="h-7 text-xs" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicineSection;
