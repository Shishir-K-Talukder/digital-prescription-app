import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Syringe } from "lucide-react";

const InsulinDoseCalculator = () => {
  const [weight, setWeight] = useState("");
  const [type, setType] = useState<"type1" | "type2">("type2");
  const [sensitivity, setSensitivity] = useState<"normal" | "sensitive" | "resistant">("normal");

  const w = parseFloat(weight) || 0;

  const getMultiplier = () => {
    if (type === "type1") {
      return sensitivity === "sensitive" ? 0.3 : sensitivity === "resistant" ? 0.6 : 0.5;
    }
    return sensitivity === "sensitive" ? 0.3 : sensitivity === "resistant" ? 0.7 : 0.5;
  };

  const totalDailyDose = w > 0 ? Math.round(w * getMultiplier() * 10) / 10 : 0;
  const basalDose = Math.round(totalDailyDose * 0.5 * 10) / 10;
  const bolusDose = Math.round(totalDailyDose * 0.5 * 10) / 10;
  const perMealBolus = Math.round((bolusDose / 3) * 10) / 10;

  return (
    <div className="section-card p-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
        <div className="section-header-icon flex items-center justify-center">
          <Syringe className="w-3.5 h-3.5" />
        </div>
        Insulin Dose Calculator
      </h3>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <Label className="text-[11px] text-muted-foreground">Weight (kg)</Label>
          <Input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" placeholder="kg" className="h-8 text-xs" />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground">Diabetes Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as "type1" | "type2")}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="type1">Type 1</SelectItem>
              <SelectItem value="type2">Type 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground">Sensitivity</Label>
          <Select value={sensitivity} onValueChange={(v) => setSensitivity(v as any)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sensitive">Sensitive</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="resistant">Resistant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {w > 0 && (
        <div className="bg-accent/30 rounded-lg p-3 space-y-1.5 text-xs border border-border/50">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Daily Dose (TDD)</span>
            <span className="font-bold text-foreground">{totalDailyDose} units</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Basal (50% TDD)</span>
            <span className="font-semibold text-foreground">{basalDose} units</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bolus (50% TDD)</span>
            <span className="font-semibold text-foreground">{bolusDose} units</span>
          </div>
          <div className="flex justify-between border-t border-border/50 pt-1.5">
            <span className="text-muted-foreground">Per Meal Bolus (÷3)</span>
            <span className="font-bold text-primary">{perMealBolus} units</span>
          </div>
          <p className="text-[10px] text-muted-foreground pt-1 italic">
            Formula: TDD = Weight × {getMultiplier()} U/kg ({sensitivity})
          </p>
        </div>
      )}
    </div>
  );
};

export default InsulinDoseCalculator;
