export type PediatricFrequencyCode = "OD" | "BD" | "TDS" | "QDS";

export interface PediatricDoseRule {
  id: string;
  medicineName: string;
  genericName: string;
  keywords: string[];
  dosePerKg: string;
  frequency: PediatricFrequencyCode;
  mealTiming: string;
  duration: string;
  instructions: string;
  maxDailyDose: string;
}

export interface PediatricMedicineMatch {
  name: string;
  generic: string;
  strength?: string;
  detectedType?: string;
}

export interface PediatricCalculationResult {
  totalDailyDose: number;
  perDose: number;
  timesPerDay: number;
  doseLabel: string;
  doseDetails: string;
  prescriptionDose: string;
  mealTiming: string;
  duration: string;
  instructions: string;
  wasCapped: boolean;
}

export const PEDIATRIC_FREQUENCIES: { code: PediatricFrequencyCode; label: string; timesPerDay: number }[] = [
  { code: "OD", label: "OD — Once daily", timesPerDay: 1 },
  { code: "BD", label: "BD — Twice daily", timesPerDay: 2 },
  { code: "TDS", label: "TDS — 3 times daily", timesPerDay: 3 },
  { code: "QDS", label: "QDS — 4 times daily", timesPerDay: 4 },
];

const FREQUENCY_MAP: Record<PediatricFrequencyCode, number> = {
  OD: 1,
  BD: 2,
  TDS: 3,
  QDS: 4,
};

const SOLID_TYPE_LABELS: Record<string, string> = {
  Tab: "tab",
  Cap: "cap",
  Supp: "supp",
};

const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const uniqueTerms = (values: string[]) => Array.from(new Set(values.map(normalizeText).filter(Boolean)));

const toNumber = (value: string | number | undefined | null) => {
  const parsed = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundTo = (value: number, step: number) => Number((Math.round(value / step) * step).toFixed(2));

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return "0";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(value < 1 ? 2 : 1).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
};

const convertToMg = (amount: number, unit: string) => {
  const normalizedUnit = unit.toLowerCase();
  if (normalizedUnit === "g") return amount * 1000;
  if (normalizedUnit === "mcg") return amount / 1000;
  return amount;
};

const getRuleTerms = (rule: PediatricDoseRule) => uniqueTerms([
  rule.medicineName,
  rule.genericName,
  ...(rule.keywords || []),
]);

const getMatchScore = (value: string, term: string) => {
  if (!value || !term) return 0;
  if (value === term) return 120;
  if (value.startsWith(term)) return 95;
  if (value.includes(term)) return 70;
  if (term.includes(value)) return 40;
  return 0;
};

const parseStrengthInfo = (strength?: string, detectedType?: string) => {
  const text = strength?.toLowerCase() ?? "";

  let match = text.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g)\s*\/\s*(\d+(?:\.\d+)?)\s*ml/i);
  if (match) {
    const amount = convertToMg(parseFloat(match[1]), match[2]);
    const volume = parseFloat(match[3]);
    if (amount > 0 && volume > 0) {
      return { kind: "liquid" as const, mgPerUnit: amount / volume, unitLabel: "mL" };
    }
  }

  match = text.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g)\s*\/\s*ml/i);
  if (match) {
    const amount = convertToMg(parseFloat(match[1]), match[2]);
    if (amount > 0) {
      return { kind: "liquid" as const, mgPerUnit: amount, unitLabel: "mL" };
    }
  }

  match = text.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g)\b/i);
  if (match && detectedType && SOLID_TYPE_LABELS[detectedType]) {
    const amount = convertToMg(parseFloat(match[1]), match[2]);
    if (amount > 0) {
      return { kind: "solid" as const, mgPerUnit: amount, unitLabel: SOLID_TYPE_LABELS[detectedType] };
    }
  }

  return null;
};

export const getFrequencyTimes = (frequency: PediatricFrequencyCode) => FREQUENCY_MAP[frequency] || 1;

export const findMatchingPediatricRules = (rules: PediatricDoseRule[], medicine: PediatricMedicineMatch) => {
  const searchableValues = uniqueTerms([medicine.name, medicine.generic]);

  return rules
    .map((rule) => {
      const score = getRuleTerms(rule).reduce((bestScore, term) => {
        const termScore = searchableValues.reduce((best, value) => Math.max(best, getMatchScore(value, term)), 0);
        return Math.max(bestScore, termScore);
      }, 0);

      return { rule, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.rule);
};

export const calculatePediatricDose = (
  weight: number,
  rule: PediatricDoseRule,
  medicine: PediatricMedicineMatch,
): PediatricCalculationResult | null => {
  const dosePerKg = toNumber(rule.dosePerKg);
  if (weight <= 0 || dosePerKg <= 0) return null;

  let totalDailyDose = weight * dosePerKg;
  const maxDailyDose = toNumber(rule.maxDailyDose);
  let wasCapped = false;

  if (maxDailyDose > 0 && totalDailyDose > maxDailyDose) {
    totalDailyDose = maxDailyDose;
    wasCapped = true;
  }

  const timesPerDay = getFrequencyTimes(rule.frequency);
  const perDose = roundTo(totalDailyDose / timesPerDay, 0.1);
  const totalDailyRounded = roundTo(totalDailyDose, 0.1);
  const strengthInfo = parseStrengthInfo(medicine.strength, medicine.detectedType);

  let prescriptionDose = `${formatNumber(perDose)} mg ${rule.frequency}`;
  let doseLabel = prescriptionDose;
  let doseDetails = `${formatNumber(perDose)} mg per dose • ${formatNumber(totalDailyRounded)} mg/day`;

  if (strengthInfo?.kind === "liquid") {
    const mlPerDose = roundTo(perDose / strengthInfo.mgPerUnit, 0.1);
    if (mlPerDose > 0) {
      prescriptionDose = `${formatNumber(mlPerDose)} ${strengthInfo.unitLabel} ${rule.frequency}`;
      doseLabel = prescriptionDose;
      doseDetails = `${formatNumber(perDose)} mg per dose • ${formatNumber(mlPerDose)} ${strengthInfo.unitLabel} each dose`;
    }
  } else if (strengthInfo?.kind === "solid") {
    const unitsPerDose = roundTo(perDose / strengthInfo.mgPerUnit, 0.25);
    if (unitsPerDose >= 0.25) {
      prescriptionDose = `${formatNumber(unitsPerDose)} ${strengthInfo.unitLabel} ${rule.frequency}`;
      doseLabel = prescriptionDose;
      doseDetails = `${formatNumber(perDose)} mg per dose • approx ${formatNumber(unitsPerDose)} ${strengthInfo.unitLabel} each dose`;
    }
  }

  return {
    totalDailyDose: totalDailyRounded,
    perDose,
    timesPerDay,
    doseLabel,
    doseDetails,
    prescriptionDose,
    mealTiming: rule.mealTiming,
    duration: rule.duration,
    instructions: rule.instructions,
    wasCapped,
  };
};