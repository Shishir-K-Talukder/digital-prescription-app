import { describe, expect, it } from "vitest";
import { calculatePediatricDose, findMatchingPediatricRules, type PediatricDoseRule } from "@/lib/pediatricDose";

const paracetamolRule: PediatricDoseRule = {
  id: "rule-1",
  medicineName: "Napa",
  genericName: "Paracetamol",
  keywords: ["ace", "paracetamol syrup"],
  dosePerKg: "15",
  frequency: "TDS",
  mealTiming: "খাবারের পরে",
  duration: "৩ দিন",
  instructions: "Shake well before use",
  maxDailyDose: "1000",
};

describe("pediatric dose helpers", () => {
  it("matches saved rules by generic name", () => {
    const matches = findMatchingPediatricRules([paracetamolRule], {
      name: "Ace",
      generic: "Paracetamol",
      strength: "120 mg/5ml",
      detectedType: "Syr",
    });

    expect(matches[0]?.id).toBe("rule-1");
  });

  it("calculates syrup dose from mg/5ml strength", () => {
    const result = calculatePediatricDose(10, paracetamolRule, {
      name: "Ace",
      generic: "Paracetamol",
      strength: "120 mg/5ml",
      detectedType: "Syr",
    });

    expect(result?.perDose).toBe(50);
    expect(result?.prescriptionDose).toBe("2.1 mL TDS");
  });

  it("caps total daily dose when max dose is set", () => {
    const result = calculatePediatricDose(80, paracetamolRule, {
      name: "Napa",
      generic: "Paracetamol",
      strength: "500 mg",
      detectedType: "Tab",
    });

    expect(result?.totalDailyDose).toBe(1000);
    expect(result?.wasCapped).toBe(true);
  });
});