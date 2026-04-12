import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMedicineSearch, type MedicineSuggestion } from "@/hooks/useMedicineSearch";
import { PEDIATRIC_FREQUENCIES, type PediatricDoseRule, type PediatricFrequencyCode } from "@/lib/pediatricDose";
import { Baby, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";

interface Props {
  rules: PediatricDoseRule[];
  meals: string[];
  durations: string[];
  onChange: (rules: PediatricDoseRule[]) => void;
}

interface RuleFormState {
  id: string | null;
  medicineName: string;
  genericName: string;
  keywords: string;
  dosePerKg: string;
  maxDailyDose: string;
  frequency: PediatricFrequencyCode;
  mealTiming: string;
  duration: string;
  instructions: string;
}

const createEmptyForm = (meals: string[], durations: string[]): RuleFormState => ({
  id: null,
  medicineName: "",
  genericName: "",
  keywords: "",
  dosePerKg: "",
  maxDailyDose: "",
  frequency: "BD",
  mealTiming: meals[0] || "",
  duration: durations[0] || "",
  instructions: "",
});

const PediatricDoseRuleManager = ({ rules, meals, durations, onChange }: Props) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [form, setForm] = useState<RuleFormState>(() => createEmptyForm(meals, durations));
  const { suggestions, loading } = useMedicineSearch(query);

  const canSave = useMemo(() => {
    return Boolean((form.medicineName.trim() || form.genericName.trim()) && parseFloat(form.dosePerKg) > 0);
  }, [form]);

  const resetForm = () => {
    setForm(createEmptyForm(meals, durations));
    setQuery("");
  };

  const applySuggestion = (medicine: MedicineSuggestion) => {
    const mergedKeywords = Array.from(
      new Set(
        [
          ...form.keywords.split(",").map((item) => item.trim()).filter(Boolean),
          medicine.name,
          medicine.generic,
        ].filter(Boolean),
      ),
    );

    setQuery(`${medicine.name} ${medicine.strength}`.trim());
    setForm((current) => ({
      ...current,
      medicineName: medicine.name,
      genericName: medicine.generic,
      keywords: mergedKeywords.join(", "),
    }));
    setShowSuggestions(false);
  };

  const saveRule = () => {
    if (!canSave) return;

    const nextRule: PediatricDoseRule = {
      id: form.id || crypto.randomUUID(),
      medicineName: form.medicineName.trim(),
      genericName: form.genericName.trim(),
      keywords: form.keywords.split(",").map((item) => item.trim()).filter(Boolean),
      dosePerKg: form.dosePerKg.trim(),
      maxDailyDose: form.maxDailyDose.trim(),
      frequency: form.frequency,
      mealTiming: form.mealTiming,
      duration: form.duration,
      instructions: form.instructions.trim(),
    };

    if (form.id) {
      onChange(rules.map((rule) => (rule.id === nextRule.id ? nextRule : rule)));
    } else {
      onChange([nextRule, ...rules]);
    }

    resetForm();
  };

  const editRule = (rule: PediatricDoseRule) => {
    setForm({
      id: rule.id,
      medicineName: rule.medicineName,
      genericName: rule.genericName,
      keywords: rule.keywords.join(", "),
      dosePerKg: rule.dosePerKg,
      maxDailyDose: rule.maxDailyDose,
      frequency: rule.frequency,
      mealTiming: rule.mealTiming || meals[0] || "",
      duration: rule.duration || durations[0] || "",
      instructions: rule.instructions || "",
    });
    setQuery(rule.medicineName || rule.genericName);
  };

  const deleteRule = (ruleId: string) => {
    onChange(rules.filter((rule) => rule.id !== ruleId));
    if (form.id === ruleId) {
      resetForm();
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div>
          <Label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-primary" /> Link medicine from live database
          </Label>
          <div className="relative">
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search brand or generic name"
              className="h-11 text-sm"
            />
            {showSuggestions && query.length >= 2 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border border-border bg-popover shadow-lg max-h-64 overflow-y-auto">
                {loading && (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Searching medicine database...
                  </div>
                )}
                {!loading && suggestions.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No medicine found</div>
                )}
                {suggestions.map((medicine, index) => (
                  <button
                    key={`${medicine.name}-${medicine.strength}-${index}`}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-accent/50 transition-colors border-b border-border/30 last:border-0"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      applySuggestion(medicine);
                    }}
                  >
                    <div className="text-sm font-medium text-foreground">
                      <span className="inline-flex items-center rounded-md bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-semibold mr-2">
                        {medicine.detectedType}
                      </span>
                      {medicine.name} {medicine.strength}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{medicine.generic} • {medicine.company}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Medicine / Brand</Label>
            <Input
              value={form.medicineName}
              onChange={(event) => setForm((current) => ({ ...current, medicineName: event.target.value }))}
              placeholder="e.g. Napa"
              className="h-10 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Generic Name</Label>
            <Input
              value={form.genericName}
              onChange={(event) => setForm((current) => ({ ...current, genericName: event.target.value }))}
              placeholder="e.g. Paracetamol"
              className="h-10 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Dose per kg / day</Label>
            <Input
              value={form.dosePerKg}
              onChange={(event) => setForm((current) => ({ ...current, dosePerKg: event.target.value }))}
              placeholder="e.g. 15"
              type="number"
              className="h-10 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Maximum daily dose (optional)</Label>
            <Input
              value={form.maxDailyDose}
              onChange={(event) => setForm((current) => ({ ...current, maxDailyDose: event.target.value }))}
              placeholder="e.g. 1000"
              type="number"
              className="h-10 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Frequency</Label>
            <Select value={form.frequency} onValueChange={(value) => setForm((current) => ({ ...current, frequency: value as PediatricFrequencyCode }))}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PEDIATRIC_FREQUENCIES.map((option) => (
                  <SelectItem key={option.code} value={option.code}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Meal Instruction</Label>
            <Select value={form.mealTiming} onValueChange={(value) => setForm((current) => ({ ...current, mealTiming: value }))}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {meals.map((meal) => (
                  <SelectItem key={meal} value={meal}>{meal}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Duration</Label>
            <Select value={form.duration} onValueChange={(value) => setForm((current) => ({ ...current, duration: value }))}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durations.map((duration) => (
                  <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Keywords (comma separated)</Label>
            <Input
              value={form.keywords}
              onChange={(event) => setForm((current) => ({ ...current, keywords: event.target.value }))}
              placeholder="e.g. napa, ace, paracetamol"
              className="h-10 text-sm"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Extra Instructions</Label>
          <Input
            value={form.instructions}
            onChange={(event) => setForm((current) => ({ ...current, instructions: event.target.value }))}
            placeholder="e.g. shake well before use"
            className="h-10 text-sm"
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {form.id && (
            <Button variant="outline" onClick={resetForm}>Cancel Edit</Button>
          )}
          <Button onClick={saveRule} disabled={!canSave} className="gap-2">
            <Plus className="w-4 h-4" /> {form.id ? "Update Rule" : "Save Rule"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {rules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground flex items-center gap-2">
            <Baby className="w-4 h-4 text-primary" /> No pediatric rules saved yet.
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{rule.medicineName || rule.genericName}</p>
                  {rule.genericName && rule.medicineName !== rule.genericName && (
                    <p className="text-xs text-muted-foreground">Generic: {rule.genericName}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => editRule(rule)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 text-destructive" onClick={() => deleteRule(rule.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2.5 py-1">{rule.dosePerKg} mg/kg/day</span>
                <span className="rounded-full bg-muted px-2.5 py-1">{rule.frequency}</span>
                <span className="rounded-full bg-muted px-2.5 py-1">{rule.duration}</span>
              </div>
              {rule.instructions && <p className="text-xs text-muted-foreground">{rule.instructions}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PediatricDoseRuleManager;