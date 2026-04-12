import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Baby } from "lucide-react";

const PediatricDoseCalculator = () => {
  const [weight, setWeight] = useState("");
  const [adultDose, setAdultDose] = useState("");
  const [dosePerKg, setDosePerKg] = useState("");
  const [frequency, setFrequency] = useState("3");

  const w = parseFloat(weight) || 0;
  const ad = parseFloat(adultDose) || 0;
  const dpk = parseFloat(dosePerKg) || 0;
  const freq = parseInt(frequency) || 1;

  // Clark's rule: (weight in kg / 70) × adult dose
  const clarksRule = w > 0 && ad > 0 ? Math.round((w / 70) * ad * 100) / 100 : 0;

  // Dose per kg calculation
  const totalDailyDose = w > 0 && dpk > 0 ? Math.round(w * dpk * 100) / 100 : 0;
  const perDose = totalDailyDose > 0 ? Math.round((totalDailyDose / freq) * 100) / 100 : 0;

  return (
    <div className="section-card p-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
        <div className="section-header-icon flex items-center justify-center">
          <Baby className="w-3.5 h-3.5" />
        </div>
        Pediatric Dose Calculator
      </h3>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <Label className="text-[11px] text-muted-foreground">Child Weight (kg)</Label>
          <Input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" placeholder="kg" className="h-8 text-xs" />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground">Frequency (/day)</Label>
          <Input value={frequency} onChange={(e) => setFrequency(e.target.value)} type="number" placeholder="times/day" className="h-8 text-xs" />
        </div>
      </div>

      {/* Method 1: mg/kg */}
      <div className="mb-3">
        <Label className="text-[11px] text-muted-foreground">Dose per kg (mg/kg/day)</Label>
        <Input value={dosePerKg} onChange={(e) => setDosePerKg(e.target.value)} type="number" placeholder="mg/kg/day" className="h-8 text-xs" />
      </div>

      {/* Method 2: Clark's rule */}
      <div className="mb-3">
        <Label className="text-[11px] text-muted-foreground">Adult Dose (mg) — for Clark's Rule</Label>
        <Input value={adultDose} onChange={(e) => setAdultDose(e.target.value)} type="number" placeholder="mg" className="h-8 text-xs" />
      </div>

      {(totalDailyDose > 0 || clarksRule > 0) && (
        <div className="bg-accent/30 rounded-lg p-3 space-y-1.5 text-xs border border-border/50">
          {totalDailyDose > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Daily Dose</span>
                <span className="font-bold text-foreground">{totalDailyDose} mg/day</span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-1.5">
                <span className="text-muted-foreground">Per Dose (÷{freq})</span>
                <span className="font-bold text-primary">{perDose} mg</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                {w} kg × {dpk} mg/kg = {totalDailyDose} mg/day
              </p>
            </>
          )}
          {clarksRule > 0 && (
            <div className={totalDailyDose > 0 ? "border-t border-border/50 pt-1.5" : ""}>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clark's Rule Dose</span>
                <span className="font-bold text-foreground">{clarksRule} mg</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                ({w}/70) × {ad} mg = {clarksRule} mg
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PediatricDoseCalculator;
