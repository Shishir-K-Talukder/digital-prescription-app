import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMedicineSearch, type MedicineSuggestion } from "@/hooks/useMedicineSearch";
import { calculatePediatricDose, findMatchingPediatricRules } from "@/lib/pediatricDose";
import type { Medicine } from "./MedicineSection";
import type { MedicineOptions } from "./MedicineSettings";
import { Baby, Loader2, Plus } from "lucide-react";

interface Props {
  options: MedicineOptions;
  onAddMedicine: (medicine: Omit<Medicine, "id">) => void;
}

const buildMedicineLabel = (medicine: MedicineSuggestion) => `${medicine.detectedType}. ${medicine.name} ${medicine.strength}`.trim();

const PediatricDoseCalculator = ({ options, onAddMedicine }: Props) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineSuggestion | null>(null);
  const [weight, setWeight] = useState("");
  const [selectedRuleId, setSelectedRuleId] = useState("");
  const { suggestions, loading } = useMedicineSearch(query);

  const w = parseFloat(weight) || 0;
  const matchedRules = useMemo(() => {
    if (!selectedMedicine) return [];
    return findMatchingPediatricRules(options.pediatricRules || [], selectedMedicine);
  }, [options.pediatricRules, selectedMedicine]);

  useEffect(() => {
    setSelectedRuleId(matchedRules[0]?.id || "");
  }, [matchedRules]);

  const activeRule = matchedRules.find((rule) => rule.id === selectedRuleId) || matchedRules[0] || null;
  const calculation = selectedMedicine && activeRule && w > 0
    ? calculatePediatricDose(w, activeRule, selectedMedicine)
    : null;

  const handleSelect = (medicine: MedicineSuggestion) => {
    setSelectedMedicine(medicine);
    setQuery(buildMedicineLabel(medicine));
    setShowSuggestions(false);
  };

  const handleAddToPrescription = () => {
    if (!selectedMedicine || !activeRule || !calculation) return;

    onAddMedicine({
      type: selectedMedicine.detectedType,
      name: buildMedicineLabel(selectedMedicine),
      dose: calculation.prescriptionDose,
      duration: activeRule.duration || options.durations[0] || "",
      mealTiming: activeRule.mealTiming || options.meals[0] || "",
      instructions: activeRule.instructions,
      taperingDoses: [],
    });
  };

  return (
    <div className="section-card p-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
        <div className="section-header-icon flex items-center justify-center">
          <Baby className="w-3.5 h-3.5" />
        </div>
        Pediatric Dose Calculator
      </h3>

      <div className="mb-3 relative">
        <Label className="text-[11px] text-muted-foreground">Search Medicine / Generic</Label>
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedMedicine(null);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search brand or generic name..."
          className="h-8 text-xs"
        />
        {showSuggestions && query.length >= 2 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-[220px] overflow-y-auto">
            {loading && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" /> Searching medicine database...
              </div>
            )}
            {!loading && suggestions.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">No medicine found</div>
            )}
            {suggestions.map((medicine, index) => (
              <button
                key={`${medicine.name}-${medicine.strength}-${index}`}
                type="button"
                className="w-full text-left px-3 py-1.5 hover:bg-accent/50 transition-colors border-b border-border/30 last:border-0"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(medicine);
                }}
              >
                <div className="text-xs font-medium text-foreground">
                  <span className="inline-block bg-primary/15 text-primary font-bold rounded px-1.5 py-0.5 mr-1.5 text-[10px]">{medicine.detectedType}</span>
                  {medicine.name} {medicine.strength}
                </div>
                <div className="text-[10px] text-muted-foreground pl-[42px]">{medicine.generic} • {medicine.company}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <Label className="text-[11px] text-muted-foreground">Child Weight (kg)</Label>
          <Input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" placeholder="kg" className="h-8 text-xs" />
        </div>
        {matchedRules.length > 1 ? (
          <div>
            <Label className="text-[11px] text-muted-foreground">Matched Rule</Label>
            <Select value={selectedRuleId} onValueChange={setSelectedRuleId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {matchedRules.map((rule) => (
                  <SelectItem key={rule.id} value={rule.id}>
                    {(rule.medicineName || rule.genericName).trim()} • {rule.frequency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 bg-accent/20 px-3 py-2 text-xs flex items-center justify-between">
            <span className="text-muted-foreground">Auto Frequency</span>
            <span className="font-semibold text-foreground">{activeRule?.frequency || "—"}</span>
          </div>
        )}
      </div>

      {selectedMedicine && activeRule && (
        <div className="mb-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs space-y-1">
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Matched Rule</span>
            <span className="font-semibold text-foreground text-right">{activeRule.medicineName || activeRule.genericName}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Dose Formula</span>
            <span className="font-semibold text-foreground">{activeRule.dosePerKg} mg/kg/day</span>
          </div>
        </div>
      )}

      {selectedMedicine && !activeRule && (
        <div className="mb-3 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          No pediatric rule saved for this medicine yet. Add one in Rx Settings → Pediatric.
        </div>
      )}

      {calculation && (
        <div className="bg-accent/30 rounded-lg p-3 space-y-1.5 text-xs border border-border/50">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Suggested Rx Dose</span>
            <span className="font-bold text-primary">{calculation.doseLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Daily Dose</span>
            <span className="font-semibold text-foreground">{calculation.totalDailyDose} mg/day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Meal</span>
            <span className="font-semibold text-foreground">{calculation.mealTiming || "—"}</span>
          </div>
          <div className="flex justify-between border-t border-border/50 pt-1.5">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-semibold text-foreground">{calculation.duration || "—"}</span>
          </div>
          <p className="text-[10px] text-muted-foreground italic">{calculation.doseDetails}</p>
          {calculation.instructions && (
            <p className="text-[10px] text-muted-foreground">{calculation.instructions}</p>
          )}
          {calculation.wasCapped && (
            <p className="text-[10px] text-primary">Maximum daily dose applied.</p>
          )}
          <Button size="sm" className="w-full h-8 text-xs gap-1.5 mt-1" onClick={handleAddToPrescription}>
            <Plus className="w-3.5 h-3.5" /> Add to Prescription
          </Button>
        </div>
      )}
    </div>
  );
};

export default PediatricDoseCalculator;
